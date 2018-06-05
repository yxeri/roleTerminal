const BaseView = require('./BaseView');
const MapMarker = require('../worldMap/MapMarker');
const MapLine = require('../worldMap/MapLine');
const MapPolygon = require('../worldMap/MapPolygon');
const MapObject = require('../worldMap/MapObject');
const BaseDialog = require('../views/dialogs/BaseDialog');

const positionComposer = require('../../data/composers/PositionComposer');
const storageManager = require('../../StorageManager');
const eventHandler = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const mouseHandler = require('../../MouseHandler');
const elementCreator = require('../../ElementCreator');
const labelHandler = require('../../labels/LabelHandler');

const ids = {
  RIGHTCLICKBOX: 'rMapBox',
  LEFTCLICKBOX: 'lMapBox',
  CREATEPOSITIONNAME: 'createPositionName',
  CREATEPOSITIONDESCRIPTION: 'createPositionDescription',
};

class WorldMapView extends BaseView {
  constructor({
    mapStyles,
    polygonStyle,
    lineStyle,
    markerStyle,
    circleStyle,
    labelStyle,
    listId,
    clusterStyle,
    choosableStyles = {},
    alwaysShowLabels = {},
    classes = [],
    elementId = `mapView-${Date.now()}`,
    positionTypes = [],
    backgroundColor = '#000000',
    minZoom = 4,
    maxZoom = 15,
    centerCoordinates = storageManager.getCenterCoordinates(),
    cornerCoordinates = {
      upperLeft: storageManager.getCornerOneCoordinates(),
      bottomRight: storageManager.getCornerTwoCoordinates(),
    },
  }) {
    super({
      elementId,
      classes: classes.concat(['worldMapView']),
    });

    this.markers = {};
    this.worldMap = undefined;
    this.clusterer = undefined;
    this.backgroundColor = backgroundColor;
    this.polygonStyle = polygonStyle;
    this.lineStyle = lineStyle;
    this.markerStyle = markerStyle;
    this.circleStyle = circleStyle;
    this.clusterStyle = clusterStyle;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.mapStyles = mapStyles;
    this.centerCoordinates = centerCoordinates;
    this.cornerCoordinates = cornerCoordinates;
    this.positionTypes = Object.values(positionComposer.PositionTypes).concat(positionTypes);
    this.listId = listId;
    this.labelStyle = labelStyle;
    this.alwaysShowLabels = alwaysShowLabels;
    this.choosableStyles = choosableStyles;

    this.element.appendChild(MapObject.leftClickBox);
    this.element.appendChild(MapObject.rightClickBox);

    eventHandler.addWatcher({
      event: eventHandler.Events.WORLDMAP,
      func: () => {
        this.startMap();
      },
    });

    eventHandler.addWatcher({
      event: eventHandler.Events.FOCUS_MAPPOSITION,
      func: ({ origin, position }) => {
        const marker = this.markers[position.objectId];

        if (marker && (!listId || listId === origin)) {
          this.realignMap({ markers: [marker] });
        }
      },
    });

    eventHandler.addWatcher({
      event: eventHandler.Events.POSITION,
      func: (data) => {
        const { position, changeType } = data;
        switch (changeType) {
          case socketManager.ChangeTypes.CREATE: {
            const marker = new MapMarker({
              position,
              worldMapView: this,
            });

            this.markers[position.objectId] = marker;

            break;
          }
          case socketManager.ChangeTypes.UPDATE: {
            const marker = new MapMarker({
              position,
              worldMapView: this,
            });

            this.markers[position.objectId] = marker;

            break;
          }
          case socketManager.ChangeTypes.REMOVE: {
            this.markers[position.objectId].setMap(null);
            this.markers[position.objectId] = undefined;

            break;
          }
          default: {
            break;
          }
        }
      },
    });
  }

  realignMap({ markers }) {
    const bounds = new google.maps.LatLngBounds();

    if (markers) {
      Object.keys(markers).forEach((markerId) => {
        const marker = markers[markerId];

        if (marker) {
          const coordinates = marker.getLatestCoordinates();

          bounds.extend(new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
        }
      });
    } else {
      bounds.extend(new google.maps.LatLng(this.cornerCoordinates.upperLeft.latitude, this.cornerCoordinates.upperLeft.longitude));
      bounds.extend(new google.maps.LatLng(this.cornerCoordinates.bottomRight.latitude, this.cornerCoordinates.bottomRight.longitude));
    }

    this.worldMap.fitBounds(bounds);
    this.worldMap.setCenter(bounds.getCenter());
  }

  addMarker({ marker }) {
    marker.setMap(this.worldMap);

    this.markers[marker.position.objectId] = marker;

    if (marker.shouldCluster) {
      this.clusterer.addMarker(marker.mapObject);
    }
  }

  createMarker({ position }) {
    let newMarker;

    switch (position.positionStructure) {
      case positionComposer.PositionStructures.CIRCLE: {
        break;
      }
      case positionComposer.PositionStructures.LINE: {
        newMarker = new MapLine({
          position,
          choosableStyles: this.choosableStyles.lines,
          alwaysShowLabel: this.alwaysShowLabels.line,
          labelStyle: this.labelStyle,
          styles: this.lineStyle,
        });

        break;
      }
      case positionComposer.PositionStructures.POLYGON: {
        newMarker = new MapPolygon({
          position,
          choosableStyles: this.choosableStyles.polygons,
          alwaysShowLabel: this.alwaysShowLabels.polygon,
          labelStyle: this.labelStyle,
          styles: this.polygonStyle,
        });

        break;
      }
      default: {
        newMarker = new MapMarker({
          position,
          choosableStyles: this.choosableStyles.markers,
          alwaysShowLabel: this.alwaysShowLabels.marker,
          labelStyle: this.labelStyle,
          styles: this.markerStyle,
        });

        break;
      }
    }

    return newMarker;
  }


  createMarkers() {
    const markers = {};
    const positions = positionComposer.getPositions({ positionTypes: this.positionTypes });

    positions.forEach((position) => {
      const marker = this.createMarker({ position });

      if (marker) {
        markers[position.objectId] = this.createMarker({ position });
      }
    });

    return markers;
  }

  resetClusterer() {
    if (!this.clusterer) {
      return;
    }

    this.clusterer.clearMarkers();
    this.clusterer.addMarkers(Object.keys(this.markers).filter(markerId => this.markers[markerId].shouldCluster).map(markerId => this.markers[markerId].mapObject));
  }

  showMapRightClickBox({ event }) {
    const { clientX: x, clientY: y } = event.Ia;

    const items = [{
      elements: [elementCreator.createSpan({
        text: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPosition' }),
      })],
      clickFuncs: {
        leftFunc: () => {
          MapObject.hideRightClickBox();

          const dialog = new BaseDialog({
            lowerButtons: [
              elementCreator.createButton({
                text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                clickFuncs: {
                  leftFunc: () => {
                    dialog.removeFromView();
                  },
                },
              }),
              elementCreator.createButton({
                text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
                clickFuncs: {
                  leftFunc: () => {
                    const position = {
                      coordinates: {
                        longitude: event.latLng.lng(),
                        latitude: event.latLng.lat(),
                      },
                      positionName: dialog.getInputValue(ids.CREATEPOSITIONNAME),
                    };
                    const description = dialog.getInputValue(ids.CREATEPOSITIONDESCRIPTION);

                    if (description) {
                      position.description = description;
                    }

                    positionComposer.createPosition({
                      position,
                      callback: ({ data, error }) => {
                        if (error) {
                          console.log('Create position', error);

                          return;
                        }

                        console.log('Created position', data);

                        dialog.removeFromView();
                      },
                    });
                  },
                },
              }),
            ],
            inputs: [
              elementCreator.createInput({
                elementId: ids.CREATEPOSITIONNAME,
                inputName: 'positionName',
                type: 'text',
                isRequired: true,
                placeholder: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPositionName' }),
              }),
              elementCreator.createInput({
                elementId: ids.CREATEPOSITIONDESCRIPTION,
                inputName: 'positionDescription',
                type: 'text',
                multiLine: true,
                placeholder: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPositionDescription' }),
              }),
            ],
          });

          dialog.addToView({ element: this.element });
        },
      },
    }];

    MapObject.showRightClickBox({
      x,
      y,
      container: elementCreator.createContainer({ elements: [elementCreator.createList({ items })] }),
    });
  }

  startMap() {
    if (this.worldMap) {
      return;
    }

    const centerCoordinates = storageManager.getCenterCoordinates();

    this.worldMap = new google.maps.Map(this.element, {
      disableDefaultUI: true,
      fullscreenControl: false,
      keyboardShortcuts: false,
      mapTypeControl: false,
      noClear: true,
      zoomControl: false,
      panControl: false,
      overviewMapControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      center: {
        lat: centerCoordinates.latitude,
        lng: centerCoordinates.longitude,
      },
      zoom: this.defaultZoomLevel,
      backgroundColor: this.backgroundColor,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      styles: this.mapStyles,
    });
    this.clusterer = new MarkerClusterer(this.worldMap, [], this.clusterStyle);

    this.markers = this.createMarkers();

    Object.keys(this.markers).forEach((markerId) => {
      const marker = this.markers[markerId];

      if (marker) {
        marker.setMap(this.worldMap);
      }
    });

    this.resetClusterer();

    this.realignMap({
      markers: this.markers,
    });

    mouseHandler.addGMapsClickListener({
      element: this.worldMap,
      leftFunc: () => {
        MapObject.hideLeftClickBox();
        MapObject.hideRightClickBox();
      },
      right: (event) => {
        MapObject.hideLeftClickBox();
        this.showMapRightClickBox({ event });
      },
    });

    google.maps.event.addListener(this.worldMap, 'drag', () => {
      MapObject.hideLeftClickBox();
      MapObject.hideRightClickBox();
    });

    eventHandler.addWatcher({
      event: eventHandler.Events.POSITION,
      func: ({ position }) => {
        this.addMarker({ marker: this.createMarker({ position }) });
        console.log('event pos', position);
      },
    });
  }
}

module.exports = WorldMapView;
