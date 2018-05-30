const BaseView = require('./BaseView');
const MapMarker = require('../worldMap/MapMarker');
const MapLine = require('../worldMap/MapLine');
const MapPolygon = require('../worldMap/MapPolygon');
const MapObject = require('../worldMap/MapObject');

const positionComposer = require('../../data/PositionComposer');
const storageManager = require('../../StorageManager');
const eventHandler = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const mouseHandler = require('../../MouseHandler');
const elementCreator = require('../../ElementCreator');
const labelHandler = require('../../labels/LabelHandler');

class WorldMapView extends BaseView {
  constructor({
    mapStyles,
    polygonStyle,
    lineStyle,
    markerStyle,
    circleStyle,
    listId,
    classes = [],
    elementId = `mapView-${Date.now()}`,
    positionTypes = Object.keys(worldMapHandler.PositionTypes).map(positionType => worldMapHandler.PositionTypes[positionType]),
    backgroundColor = '#000000',
    minZoom = 3,
    maxZoom = 16,
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
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.mapStyles = mapStyles;
    this.centerCoordinates = centerCoordinates;
    this.cornerCoordinates = cornerCoordinates;
    this.positionTypes = positionTypes;
    this.listId = listId;

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
  }

  createMarkers() {
    const markers = {};
    const positions = positionComposer.getPositions({ positionTypes: this.positionTypes });

    positions.forEach((position) => {
      switch (position.positionStructure) {
        case worldMapHandler.PositionStructures.CIRCLE: {
          break;
        }
        case worldMapHandler.PositionStructures.LINE: {
          markers[position.objectId] = new MapLine({
            position,
            styles: this.lineStyle,
          });

          break;
        }
        case worldMapHandler.PositionStructures.POLYGON: {
          markers[position.objectId] = new MapPolygon({
            position,
            styles: this.polygonStyle,
          });

          break;
        }
        default: {
          markers[position.objectId] = new MapMarker({
            position,
            styles: this.markerStyle,
          });

          break;
        }
      }
    });

    return markers;
  }

  resetClusterer() {
    if (!this.clusterer) {
      return;
    }

    this.clusterer.clearMarkers();
    this.clusterer.addMarkers(Object.keys(this.markers).filter(markerId => this.markers[markerId].shouldCluster).map(markerId => this.markers[markerId]));
  }

  showPositionClickBox({ position }) {
    const { description = [labelHandler.getLabel({ baseObject: 'WorldMapView', label: 'noDescription' })] } = position;

    const descriptionContainer = elementCreator.createContainer({
      elements: [elementCreator.createArticle({
        headerElement: elementCreator.createParagraph({
          elements: [elementCreator.createSpan({ text: position.positionName || labelHandler.getLabel({ baseObject: 'WorldMapView', label: 'noName' }) })],
        }),
        elements: [
          elementCreator.createSection({
            elements: description.map((line) => {
              return elementCreator.createParagraph({
                elements: [elementCreator.createSpan({ text: line })],
              });
            }),
          }),
        ],
      })],
    });

    elementCreator.replaceFirstChild(this.leftClickBox, descriptionContainer);

    this.leftClickBox.classList.remove('hide');
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
    this.markers = this.createMarkers();
    this.clusterer = new MarkerClusterer(this.worldMap, this.marker);

    Object.keys(this.markers).forEach((markerId) => {
      const marker = this.markers[markerId];

      if (marker) {
        marker.setMap(this.worldMap);
      }
    });

    this.overlay = new google.maps.OverlayView();
    this.overlay.draw = () => {};
    this.overlay.setMap(this.worldMap);

    this.realignMap({
      markers: this.markers,
    });

    mouseHandler.addGMapsClickListener({
      element: this.worldMap,
      leftFunc: () => {
        MapObject.hideLeftClickBox();
        MapObject.hideRightClickBox();
      },
      right: () => {
        MapObject.hideLeftClickBox();
      },
    });

    google.maps.event.addListener(this.worldMap, 'drag', () => {
      MapObject.hideLeftClickBox();
      MapObject.hideRightClickBox();
    });

    eventHandler.addWatcher({
      event: eventHandler.Events.MARKER_DESCRIPTION,
      func: ({
        position,
        shouldShow,
        event,
      }) => {
        if (shouldShow) {
          this.showPositionClickBox({
            event,
            position,
          });
        } else {
          MapObject.hideLeftClickBox();
        }
      },
    });
  }
}

module.exports = WorldMapView;
