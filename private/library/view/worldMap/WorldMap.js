/*
 Copyright 2017 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const View = require('../base/View');
const DialogBox = require('../DialogBox');
const MapMarker = require('./MapMarker');
const Label = require('./Label');
const List = require('../base/List');
const textTools = require('../../TextTools');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const elementCreator = require('../../ElementCreator');
const soundLibrary = require('../../audio/SoundLibrary');
const eventCentral = require('../../EventCentral');

const MapViews = {
  OVERVIEW: 'overview',
  CLUSTER: 'cluster',
  AREA: 'area',
  NONE: '',
};

class WorldMap extends View {
  /** @namespace this.markers.I */

  constructor({
    isFullscreen,
    mapView = MapViews.NONE,
    markers = {},
    cornerCoordinates = {},
    centerCoordinates = {},
    zoomLevel = 15,
    mapBackground = '#000000',
    mapStyles = [],
    labelStyle = {},
    clusterStyle = {},
  }) {
    super({ isFullscreen, viewId: 'map' });

    this.mapView = mapView;
    this.markers = markers;
    this.pings = {};
    this.labels = {};
    this.cornerCoordinates = cornerCoordinates;
    this.centerCoordinates = centerCoordinates;
    this.infoElement = elementCreator.createContainer({ elementId: 'markerInfo', classes: ['hide'] });
    this.mapClickMenu = elementCreator.createContainer({ elementId: 'mapClickMenu', classes: ['hide', 'clickMenu'] });
    this.markerClickMenu = elementCreator.createContainer({ elementId: 'markerClickMenu', classes: ['hide', 'clickMenu'] });
    this.infoElement.addEventListener('click', () => { this.hideMarkerInfo(); });
    this.defaultZoomLevel = zoomLevel;
    this.labelStyle = labelStyle;
    this.clusterer = null;
    this.clusterStyle = clusterStyle;
    this.mapStyles = mapStyles;
    this.mapBackground = mapBackground;
    this.map = null;
    this.overlay = null;
    this.movingMarker = null;
    this.userList = new List({ title: 'Users', viewId: 'mapUserList', shouldSort: true, minimumToShow: 0, showTitle: true });
    this.worldList = new List({ title: 'World', viewId: 'mapWorldList', shouldSort: true, minimumToShow: 0, showTitle: true });
    this.otherList = new List({ title: 'Others', viewId: 'mapOtherList', shouldSort: true, minimumToShow: 0, showTitle: true });

    this.userList.element.addEventListener('click', () => {
      [this.worldList, this.otherList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });
    this.worldList.element.addEventListener('click', () => {
      [this.userList, this.otherList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });
    this.otherList.element.addEventListener('click', () => {
      [this.userList, this.worldList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });

    const mapMenu = elementCreator.createContainer({ elementId: 'mapMenu', classes: ['mapMenu'] });
    const meButton = elementCreator.createSpan({
      text: 'Me',
      classes: ['clickable'],
      func: () => {
        if (this.markers.I) {
          this.realignMap([this.markers.I]);
        }
      },
    });

    mapMenu.appendChild(this.worldList.element);
    mapMenu.appendChild(this.userList.element);
    mapMenu.appendChild(this.otherList.element);
    mapMenu.appendChild(meButton);
    this.element.appendChild(mapMenu);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.MYPOSITION,
      func: ({ position }) => {
        this.setUserPosition({ position });
      },
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.PINGMAP,
      func: ({ position, pingInfo }) => {
        this.createPing({ position, pingInfo });
      },
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        this.retrievePositions(() => {
          const world = [];
          const users = [];
          const others = Object.keys(this.markers).filter((positionName) => {
            if (this.markers[positionName].markerType === 'custom') {
              return true;
            }

            if (this.markers[positionName].markerType === 'users') {
              users.push(positionName);
            } else if (this.markers[positionName].markerType === 'world') {
              world.push(positionName);
            }

            return false;
          });

          this.replaceListItems(world, this.worldList);
          this.replaceListItems(users, this.userList);
          this.replaceListItems(others, this.otherList);
        });
      },
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.POSITIONS,
      func: ({ positions, currentTime }) => {
        const userName = storageManager.getUserName() || '';

        positions.forEach((position) => {
          const positionName = position.positionName;

          if (positionName) {
            if (this.markers[positionName]) {
              this.markers[positionName].setPosition({ coordinates: position.coordinates, lastUpdated: position.lastUpdated });

              if (position.markerType && position.markerType === 'user') {
                const beautifiedDate = textTools.generateTimeStamp({ date: new Date(position.lastUpdated) });

                this.markers[positionName].description = [`Team: ${position.team || '-'}`, `Last seen: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`];
              }
            } else {
              this.createMarker({ position, userName, currentTime });

              switch (position.markerType) {
                case 'world': {
                  this.worldList.addItem({ item: this.createListButton(positionName, this.worldList) });

                  break;
                }
                case 'user': {
                  this.userList.addItem({ item: this.createListButton(positionName, this.userList) });

                  break;
                }
                case 'custom': {
                  this.otherList.addItem({ item: this.createListButton(positionName, this.otherList) });

                  break;
                }
                default: {
                  break;
                }
              }
            }
          }
        });
      },
    });
  }

  resetClusterer(markers = []) {
    if (!this.clusterer) {
      this.clusterer = new MarkerClusterer(this.map, [], this.clusterStyle);
    }

    this.clusterer.clearMarkers();
    this.clusterer.addMarkers(markers);
  }

  createListButton(positionName, parentList) {
    return elementCreator.createButton({
      text: positionName,
      func: () => {
        this.realignMap([this.markers[positionName]]);
        parentList.toggleList();
      },
    });
  }

  replaceListItems(list, listToChange) {
    listToChange.replaceAllItems({
      items: list.map(positionName => this.createListButton(positionName, listToChange)),
    });
  }

  static get MapViews() {
    return MapViews;
  }

  /**
   * Sets new map view. Affects how the map is realigned and shown
   * @param {string} view - Type of map view (overview, me, cluster)
   */
  setMapView(view) {
    this.mapView = view;
  }

  createMarkerClickMenu(event, marker) {
    const projection = this.overlay.getProjection();
    const xy = projection.fromLatLngToContainerPixel(event.latLng);

    this.markerClickMenu.style.left = `${xy.x + 5}px`;
    this.markerClickMenu.style.top = `${xy.y + 5}px`;

    const list = elementCreator.createList({
      elements: [
        elementCreator.createButton({
          text: 'Move marker',
          func: () => {
            this.movingMarker = marker;

            google.maps.event.addListener(this.map, 'mousemove', (moveEvent) => {
              this.movingMarker.setPosition({
                latitude: moveEvent.latLng.lat(),
                longitude: moveEvent.latLng.lng(),
              });
            });
            this.hideMarkerClicKMenu();
          },
        }),
      ],
    });

    elementCreator.replaceOnlyChild(this.markerClickMenu, list);
    this.showMarkerClickMenu();
  }

  createMapClickMenu(event) {
    const projection = this.overlay.getProjection();
    const xy = projection.fromLatLngToContainerPixel(event.latLng);

    this.mapClickMenu.style.left = `${xy.x + 5}px`;
    this.mapClickMenu.style.top = `${xy.y + 5}px`;

    const list = elementCreator.createList({
      elements: [
        elementCreator.createButton({
          text: 'Create marker',
          func: () => {
            const markerDialog = new DialogBox({
              buttons: {
                left: {
                  text: 'Cancel',
                  eventFunc: () => {
                    markerDialog.removeView();
                  },
                },
                right: {
                  text: 'Create',
                  eventFunc: () => {
                    const position = {
                      coordinates: {
                        longitude: event.latLng.lng(),
                        latitude: event.latLng.lat(),
                      },
                      positionName: markerDialog.inputs.find(input => input.inputName === 'markerName').inputElement.value,
                      description: markerDialog.inputs.find(input => input.inputName === 'description').inputElement.value.split('\n'),
                      markerType: 'custom',
                    };

                    socketManager.emitEvent('updatePosition', { position }, ({ error }) => {
                      if (error) {
                        console.log(error);

                        return;
                      }

                      this.markers[position.positionName] = new MapMarker({
                        positionName: position.positionName,
                        description: position.description,
                        markerType: 'custom',
                        icon: {
                          url: 'images/mapiconcreated.png',
                        },
                        coordinates: {
                          longitude: event.latLng.lng(),
                          latitude: event.latLng.lat(),
                        },
                        worldMap: this,
                        map: this.map,
                        owner: storageManager.getUserName(),
                        team: storageManager.getTeam(),
                      });
                      this.clusterer.addMarker(this.markers[position.positionName].marker);
                      markerDialog.removeView();
                    });
                  },
                },
              },
              inputs: [{
                placeholder: 'Name of the position',
                inputName: 'markerName',
                isRequired: true,
              }, {
                placeholder: 'Description',
                inputName: 'description',
                multiLine: true,
              }],
              description: ['Mark a position that offers the maximum amount of team synergy'],
              extraDescription: [''],
            });
            markerDialog.appendTo(this.element.parentElement);
            this.hideMapClickMenu();
          },
        }),
        elementCreator.createButton({
          text: 'Ping',
          func: () => {
            const position = {
              coordinates: {
                longitude: event.latLng.lng(),
                latitude: event.latLng.lat(),
              },
            };
            const pingInfo = {
              pingType: 'notification',
              userName: storageManager.getUserName(),
            };

            socketManager.emitEvent('pingMap', { position, pingInfo }, () => {

            });
            this.hideMapClickMenu();
          },
        }),
      ],
    });

    elementCreator.replaceOnlyChild(this.mapClickMenu, list);
    this.showMapClickMenu();
  }

  /**
   * @returns {string} - Returns string representing the type of map view
   */
  getMapView() {
    return this.mapView;
  }

  /**
   * @returns {Object} - Returns map marker representing this user
   */
  getThisUserMarker() {
    return this.markers.I;
  }

  /**
   * Creates the map marker representing this user
   * @param {Object} position New position
   */
  createThisUserMarker({ position }) {
    this.markers.I = new MapMarker({
      coordinates: position.coordinates,
      markerType: 'you',
      positionName: 'You',
      team: storageManager.getTeam() || '',
      owner: storageManager.getUserName() || '',
      icon: {
        url: '/images/mapiconyou.png',
      },
      map: this.map,
      worldMap: this,
      description: ['You'],
    });
  }

  /**
   * Sets new position to the user's map marker
   * Creates a new map marker if it doesn't exist
   * @param {Object} position New position
   */
  setUserPosition({ position }) {
    const beautifiedDate = textTools.generateTimeStamp({ date: position.lastUpdated });

    if (this.markers.I) {
      this.markers.I.setPosition({ coordinates: position.coordinates, lastUpdated: position.lastUpdated });
      this.markers.I.description = [`Last updated: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`];
    } else {
      this.createThisUserMarker({ position });
    }
  }

  /**
   * Resets map on all labels, in case any of the connected markers are no longer on the map
   */
  toggleMapLabels() {
    Object.keys(this.markers).forEach((markerName) => {
      if (this.labels[markerName] && this.labels[markerName].getMap() !== this.markers[markerName].getMap()) {
        this.labels[markerName].setMap(this.markers[markerName].getMap());
      }
    });
  }

  /**
   * Creates new bounds and re-centers the map based on the map view
   * @param {Object[]} [sentMarkers] - Map markers used to create bounds
   */
  realignMap(sentMarkers) {
    const bounds = new google.maps.LatLngBounds();
    let centerPos = this.map.getCenter();

    google.maps.event.trigger(this.map, 'resize');

    if (sentMarkers) {
      Object.keys(sentMarkers).forEach(markerName => bounds.extend(sentMarkers[markerName].getPosition()));

      this.map.fitBounds(bounds);
      centerPos = bounds.getCenter();
    } else if (this.mapView === MapViews.OVERVIEW) {
      Object.keys(this.markers).forEach(markerName => bounds.extend(this.markers[markerName].getPosition()));

      this.map.fitBounds(bounds);
      centerPos = bounds.getCenter();
    } else if (this.mapView === MapViews.CLUSTER) {
      if (this.markers) {
        for (let i = 0; i < this.markers.length; i += 1) {
          const marker = this.markers[i];

          bounds.extend(marker.getPosition());
        }

        this.map.fitBounds(bounds);
        centerPos = bounds.getCenter();
      }
    } else if (this.mapView === MapViews.AREA) {
      bounds.extend(new google.maps.LatLng(this.cornerCoordinates.cornerOne.latitude, this.cornerCoordinates.cornerOne.longitude));
      bounds.extend(new google.maps.LatLng(this.cornerCoordinates.cornerTwo.latitude, this.cornerCoordinates.cornerTwo.longitude));

      this.map.fitBounds(bounds);
      centerPos = bounds.getCenter();
    }

    this.map.setCenter(centerPos);
    this.hideMarkerInfo();
  }

  /**
   * Set map to current map on all objects in the collection
   * @param {Object} collections - Collection of objects to be attached to the map
   */
  setMap(collections) {
    collections.forEach((collection) => {
      Object.keys(collection).forEach((name) => {
        collection[name].setMap(this.map);
      });
    });
  }

  /**
   * Add listeners to map
   */
  attachMapListeners() {
    let longClick = false;

    google.maps.event.addListener(this.clusterer, 'clusterclick', (cluster) => {
      const bounds = new google.maps.LatLngBounds();
      const markers = cluster.getMarkers();

      soundLibrary.playSound('button2');

      for (let i = 0; i < markers.length; i += 1) {
        bounds.extend(markers[i].getPosition());
      }

      this.setMapView(MapViews.CLUSTER);
      this.realignMap();
    });

    google.maps.event.addListener(this.map, 'dragstart', () => {
      longClick = false;
      this.hideMarkerInfo();
      this.hideMapClickMenu();
      this.hideMarkerClicKMenu();
    });
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.hideMarkerInfo();
      this.hideMapClickMenu();
      this.hideMarkerClicKMenu();
    });
    google.maps.event.addListener(this.map, 'rightclick', (event) => {
      this.hideMarkerInfo();
      this.hideMarkerClicKMenu();
      this.createMapClickMenu(event);
    });
    google.maps.event.addListener(this.map, 'mousedown', (event) => {
      longClick = true;
      this.hideMarkerInfo();
      this.hideMapClickMenu();
      this.hideMarkerClicKMenu();

      setTimeout(() => {
        if (longClick) {
          this.createMapClickMenu(event);
        }
      }, 500);
    });
    google.maps.event.addListener(this.map, 'mouseup', () => {
      longClick = false;
    });
  }

  showMapClickMenu() { this.mapClickMenu.classList.remove('hide'); }

  hideMapClickMenu() { this.mapClickMenu.classList.add('hide'); }

  showMarkerClickMenu() { this.markerClickMenu.classList.remove('hide'); }

  hideMarkerClicKMenu() { this.markerClickMenu.classList.add('hide'); }

  showMarkerInfo({ position, positionName, description = [] }) {
    this.hideMarkerInfo();

    const projection = this.overlay.getProjection();
    const xy = projection.fromLatLngToContainerPixel(position);

    this.infoElement.style.left = `${xy.x}px`;
    this.infoElement.style.top = `${xy.y}px`;

    const infoText = document.createElement('DIV');
    const titleParagraph = document.createElement('P');
    titleParagraph.appendChild(document.createTextNode(positionName));

    const fragment = document.createDocumentFragment();

    description.forEach((line) => {
      const paragraph = document.createElement('P');
      paragraph.appendChild(document.createTextNode(line));
      fragment.appendChild(paragraph);
    });

    infoText.appendChild(titleParagraph);
    infoText.appendChild(fragment);
    elementCreator.replaceOnlyChild(this.infoElement, infoText);

    setTimeout(() => {
      this.infoElement.classList.remove('hide');
      this.infoElement.classList.add('flash');
    }, 100);
  }

  hideMarkerInfo() {
    this.infoElement.classList.remove('flash');
    this.infoElement.classList.add('hide');
  }

  /**
   * Reset view port, which recreates all clusters
   */
  resetClusters() { this.clusterer.resetViewport(); }

  /**
   * @returns {google.maps.Map} - Map
   */
  getMap() { return this.map; }

  /**
   * @param {{latitude: Number, longitude: Number}} position - Long and lat coordinates for the new map center
   */
  setMapCenter(position) {
    if (this.map) { this.map.setCenter(new google.maps.LatLng(parseFloat(position.latitude), parseFloat(position.longitude))); }
  }

  /**
   * Set corner coordinates of the bounds for the map
   * @param {{longitude: Number, latitude: Number}} cornerOneCoords - Corner lat and long coordinates
   * @param {{longitude: Number, latitude: Number}} cornerTwoCoords - Corner lat and long coordinates
   */
  setCornerCoordinates(cornerOneCoords, cornerTwoCoords) {
    this.cornerCoordinates.cornerOne = cornerOneCoords;
    this.cornerCoordinates.cornerTwo = cornerTwoCoords;
  }

  /**
   * Set center coordinates for the map
   * @param {{longitude: Number, latitude: Number}} centerCoordinates - Center lat and long coordinates
   */
  setCenterCoordinates(centerCoordinates) {
    this.centerCoordinates = centerCoordinates;
  }

  /**
   * Set default zoom level
   * @param {number} defaultZoomLevel - Default zoom level
   */
  setDefaultZoomLevel(defaultZoomLevel) {
    this.defaultZoomLevel = defaultZoomLevel;
  }

  /**
   * Increase the zoom level of the map by 1
   */
  increaseZoom() {
    this.mapView = MapViews.NONE;
    this.map.setZoom(this.map.getZoom() + 1);
  }

  /**
   * Decrease the zoom level of the map by 1
   */
  decreaseZoom() {
    this.mapView = MapViews.NONE;
    this.map.setZoom(this.map.getZoom() - 1);
  }

  retrievePositions(callback = () => {}) {
    socketManager.emitEvent('getMapPositions', { types: ['google', 'custom', 'user'] }, ({ error, data }) => {
      if (error || !data) {
        return;
      }

      const { positions, currentTime } = data;
      const userName = storageManager.getUserName() || '';

      positions.forEach((position) => {
        this.createMarker({ position, userName, currentTime });
      });

      if (this.map) {
        this.resetClusterer(Object.keys(this.markers).filter(positionName => this.markers[positionName].shouldCluster).map(positionName => this.markers[positionName].marker));
        this.realignMap();
      }

      callback();
    });
  }

  /**
   * Creates the map and retrieves positions from server and Google maps
   */
  startMap() {
    // Will stop and retry to create map if external files have not finished loading
    if (typeof google === 'undefined' || typeof MarkerClusterer === 'undefined' || typeof MapLabel === 'undefined') {
      setTimeout(this.startMap, 1000);

      return;
    }

    this.started = true;

    if (!this.map) {
      this.map = new google.maps.Map(this.element, {
        center: {
          lat: this.centerCoordinates.latitude,
          lng: this.centerCoordinates.longitude,
        },
        zoom: this.defaultZoomLevel,
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
        backgroundColor: this.mapBackground,
        minZoom: 3,
        maxZoom: 19,
        styles: this.mapStyles,
      });
    }

    this.resetClusterer();

    if (!this.overlay) {
      this.overlay = new google.maps.OverlayView();
      this.overlay.draw = () => {};
      this.overlay.setMap(this.map);
    }

    this.element.appendChild(this.infoElement);
    this.element.appendChild(this.mapClickMenu);
    this.element.appendChild(this.markerClickMenu);
    this.attachMapListeners();

    /**
     * User position marker can be created before map exists. That's why we add it to the map here
     */
    if (this.markers.I) {
      this.markers.I.marker.setMap(this.map);
    }

    this.retrievePositions();
  }

  createPing({ position = {}, pingInfo = {} }) {
    const ping = new google.maps.Circle({
      center: new google.maps.LatLng(position.coordinates.latitude, position.coordinates.longitude),
      strokeColor: '#00ffcc',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ff02e5',
      fillOpacity: 0.35,
      radius: 100,
    });
    const labelText = (() => {
      switch (pingInfo.pingType) {
        case 'organica': {
          return 'Organica företagsfest';
        }
        case 'panzerwolves': {
          return 'Panzerwolf raid';
        }
        default: {
          return 'Unknown activity';
        }
      }
    })();
    const label = new Label({
      positionName: `${pingInfo.userName}-ping`,
      coordinates: position.coordinates,
      labelText,
    });

    if (this.map) {
      ping.setMap(this.map);
      label.setMap(this.map);
    }
  }

  /**
   * Create map marker
   * @param {string} params.position.positionName Name of the position
   * @param {Object} params.position.coordinates Coordinates
   * @param {number} params.position.coordinates.longitude Longitude
   * @param {number} params.position.coordinates.latitude Latitude
   * @param {number} params.position.coordinates.accuracy Accuracy in meters
   * @param {number|null} params.position.coordinates.speed Speed in m/s
   * @param {number|null} params.position.coordinates.heading Heading in degrees
   * @param {Object} [params.position.geometry] Google geometry, for complex objects
   * @param {string} params.position.markerType Marker type
   * @param {Date} params.position.lastUpdated Date for when the position was last updated
   * @param {string} params.position.owner User name of the owner
   * @param {string} params.userName user name of the current user
   * @param {Date} params.currentTime Current time sent from server
   * @param {string[]} [params.position.description] Position description
   * @param {string} [params.position.team] Name of the team that the position is part of
   */
  createMarker({ position: { positionName, coordinates, geometry, markerType, description, lastUpdated, team, owner }, userName, currentTime }) {
    if (positionName && positionName.toLowerCase() !== userName) {
      const latitude = parseFloat(coordinates.latitude);
      const longitude = parseFloat(coordinates.longitude);

      if (markerType === 'world') {
        if (geometry === 'point') {
          this.markers[positionName] = new MapMarker({
            coordinates: {
              latitude,
              longitude,
            },
            map: this.map,
            worldMap: this,
            shouldCluster: true,
            positionName,
            description,
            markerType,
            owner,
            team,
          });
        }
      } else if (markerType === 'user' && lastUpdated) {
        const date = new Date(lastUpdated);
        const currentDate = new Date(currentTime);

        if (currentDate - date < (20 * 60 * 1000)) {
          const beautifiedDate = textTools.generateTimeStamp({ date });
          const userDescription = [`Team: ${team || '-'}`, `Last seen: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`];

          this.markers[positionName] = new MapMarker({
            lastUpdated: date,
            coordinates: {
              latitude,
              longitude,
            },
            icon: {
              url: team && team === (storageManager.getTeam() || '') ? 'images/mapiconteam.png' : 'images/mapiconuser.png',
            },
            description: userDescription,
            map: this.map,
            worldMap: this,
            markerType,
            positionName,
            owner,
            team,
          });
        }
      } else if (markerType) {
        this.markers[positionName] = new MapMarker({
          coordinates: {
            latitude,
            longitude,
          },
          icon: {
            url: 'images/mapiconcreated.png',
          },
          map: this.map,
          worldMap: this,
          shouldCluster: true,
          description,
          positionName,
          markerType,
          owner,
          team,
        });
      }
    }
  }

  appendTo(parentElement) {
    parentElement.classList.add('mapMain');
    super.appendTo(parentElement);

    if (!this.started) {
      this.startMap();
    } else {
      google.maps.event.trigger(this.map, 'resize');
    }
  }

  removeView() {
    this.element.parentNode.classList.remove('mapMain');
    super.removeView();
    this.infoElement.classList.remove('flash');
  }
}

module.exports = WorldMap;
exports.MapViews = MapViews;
