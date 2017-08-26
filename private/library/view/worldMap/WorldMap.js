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

/**
 * Creates a circle
 * @param {Object} params.coordinates Coordinates
 * @param {number} params.coordinates.latitude Latitude
 * @param {number} params.coordinates.longitude Longitude
 * @param {number} params.coordinates.radius Radius
 * @returns {google.maps.Circle} Circle
 */
function createCircle({ coordinates }) {
  return new google.maps.Circle({
    center: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
    radius: coordinates.radius,
    strokeColor: '#00ffcc',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#ff02e5',
    fillOpacity: 0.35,
  });
}

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
    maxUserAge = (15 * 60 * 1000),
    maxPingAge = (10 * 60 * 1000),
  }) {
    super({ isFullscreen, viewId: 'map' });

    this.mapView = mapView;
    this.markers = markers;
    this.circles = {};
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
    this.maxUserAge = maxUserAge;
    this.maxPingAge = maxPingAge;
    this.userList = new List({ title: 'USER', viewId: 'mapUserList', shouldSort: true, minimumToShow: 0, showTitle: true });
    this.localList = new List({ title: 'LOCAL', viewId: 'mapLocalList', shouldSort: true, minimumToShow: 0, showTitle: true });
    this.worldList = new List({ title: 'WORLD', viewId: 'mapWorldList', shouldSort: true, minimumToShow: 0, showTitle: true });
    this.teamList = new List({ title: 'TEAM', viewId: 'mapTeamList', shouldSort: true, minimumToShow: 0, showTitle: true });

    // TODO Ugly and duplicated
    this.userList.element.addEventListener('click', () => {
      [this.worldList, this.teamList, this.localList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });
    this.worldList.element.addEventListener('click', () => {
      [this.userList, this.teamList, this.localList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });
    this.teamList.element.addEventListener('click', () => {
      [this.userList, this.worldList, this.localList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });
    this.localList.element.addEventListener('click', () => {
      [this.worldList, this.teamList, this.userList].forEach((list) => { if (list.showingList) { list.toggleList(); } });
    });

    const mapMenu = elementCreator.createContainer({ elementId: 'mapMenu', classes: ['innerMenu'] });
    const meButton = elementCreator.createSpan({
      text: 'ME',
      classes: ['clickable'],
      func: () => {
        if (this.markers.I) {
          this.realignMap([this.markers.I]);
        }
      },
    });

    mapMenu.appendChild(this.localList.element);
    mapMenu.appendChild(this.worldList.element);
    mapMenu.appendChild(this.userList.element);
    mapMenu.appendChild(this.teamList.element);
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
      event: eventCentral.Events.USER,
      func: () => {
        this.retrievePositions({ callback: () => {
          const team = storageManager.getTeam();
          const world = [];
          const local = [];
          const teamUsers = [];
          const users = Object.keys(this.markers).filter((positionName) => {
            const marker = this.markers[positionName];

            if (marker.markerType === 'user') {
              if (team && marker.team && team === marker.team) {
                teamUsers.push(positionName);
              } else {
                return true;
              }
            } else if (marker.markerType === 'world') {
              world.push(positionName);
            } else if (marker.markerType === 'local') {
              local.push(positionName);
            }

            return false;
          });

          this.replaceListItems(local, this.localList);
          this.replaceListItems(world, this.worldList);
          this.replaceListItems(users, this.userList);
          this.replaceListItems(teamUsers, this.teamList);
        } });
      },
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.REMOVEPOSITIONS,
      func: ({ positions }) => {
        positions.forEach((position) => {
          switch (position.markerType) {
            case 'signalBlock': {
              const markersInBounds = this.isWithinBounds({ source: this.circles[position.positionName].circle });

              this.clusterer.addMarkers(markersInBounds.map(mapMarker => mapMarker.marker));
              markersInBounds.forEach((marker) => {
                marker.setMap(this.map);
              });

              this.circles[position.positionName].circle.setMap(null);
              this.circles[position.positionName].label.setMap(null);
              this.circles[position.positionName] = undefined;

              break;
            }
            case 'ping': {
              this.circles[position.positionName].circle.setMap(null);
              this.circles[position.positionName].label.setMap(null);
              this.circles[position.positionName] = undefined;

              break;
            }
            case 'local': {
              this.localList.removeItem({ name: position.positionName });
              this.clusterer.removeMarker(this.markers[position.positionName].marker);
              this.markers[position.positionName].setMap(null);
              this.markers[position.positionName] = undefined;

              break;
            }
            case 'world': {
              this.worldList.removeItem({ name: position.positionName });
              this.clusterer.removeMarker(this.markers[position.positionName].marker);
              this.markers[position.positionName].setMap(null);
              this.markers[position.positionName] = undefined;

              break;
            }
            case 'user': {
              const marker = this.markers[position.positionName];
              const team = storageManager.getTeam();

              if (team && team === marker.team) {
                this.teamList.removeItem({ name: position.positionName });
              } else {
                this.userList.removeItem({ name: position.positionName });
              }

              this.clusterer.removeMarker(this.markers[position.positionName].marker);
              this.markers[position.positionName].setMap(null);
              this.markers[position.positionName] = undefined;

              break;
            }
            default: {
              this.clusterer.removeMarker(this.markers[position.positionName].marker);
              this.markers[position.positionName].setMap(null);
              this.markers[position.positionName] = undefined;

              break;
            }
          }
        });
      },
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.POSITIONS,
      /**
       * Add positions to lists
       * @param {Object[]} params.positions Positions
       * @param {string} params.positions[].positionName Name of the position
       * @param {Object} params.positions[].coordinates GPS coordinates
       * @param {string} params.positions[].markerType Type of marker
       * @param {string} params.positions[].team Team name
       * @param {Date} params.positions[].lastUpdated Last position change
       * @param {Date} params.currentTime Current time, sent from server
       */
      func: ({ positions, currentTime }) => {
        positions.forEach((position) => {
          const thisUser = storageManager.getUserName();
          const thisTeam = storageManager.getTeam();
          const positionName = position.positionName;

          if (position.markerType === 'ping' || position.markerType === 'signalBlock') {
            const circleObj = this.circles[positionName];

            if (circleObj) {
              const latLng = new google.maps.LatLng(position.coordinates.latitude, position.coordinates.longitude);

              circleObj.circle.setCenter(latLng);
              circleObj.label.setText({ text: position.description[0] });
              circleObj.label.setPosition({ coordinates: position.coordinates });
              circleObj.circle.setMap(this.map);
              circleObj.label.setMap(this.map);
            } else {
              this.createCircleArea({ position });
            }
          } else if (this.markers[positionName]) {
            this.markers[positionName].setPosition({ coordinates: position.coordinates, lastUpdated: position.lastUpdated, map: this.map });

            if (position.markerType && (position.markerType === 'user' || position.markerType === 'device')) {
              const beautifiedDate = textTools.generateTimeStamp({ date: new Date(position.lastUpdated) });

              // TODO Duplicate code
              this.markers[positionName].description = [
                `Team: ${position.team || '-'}`,
                `Last seen: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`,
                `Accuracy: ${position.coordinates.accuracy} meters`,
              ];
            }
          } else if (positionName !== thisUser) {
            this.createMarker({ position, currentTime });

            switch (position.markerType) {
              case 'local': {
                if (!this.localList.getItem({ name: positionName })) {
                  this.localList.addItem({ item: this.createListButton(positionName, this.localList) });
                }

                break;
              }
              case 'world': {
                if (!this.worldList.getItem({ name: positionName })) {
                  this.worldList.addItem({ item: this.createListButton(positionName, this.worldList) });
                }

                break;
              }
              case 'user': {
                if (!this.userList.getItem({ name: positionName })) {
                  if (positionName.team && thisTeam && positionName.team === thisTeam) {
                    this.teamList.addItem({ item: this.createListButton(positionName, this.userList) });
                  } else {
                    this.userList.addItem({ item: this.createListButton(positionName, this.userList) });
                  }
                }

                break;
              }
              default: {
                break;
              }
            }

            this.hideBlockedPositions(positionName);
          }
        });
      },
    });

    this.startAgeChecker();
  }

  startAgeChecker() {
    setTimeout(() => {
      Object.keys(this.circles).forEach((circleName) => {
        const circle = this.circles[circleName];

        if (circle && circle.markerType !== 'signalBlock') {
          const currentTime = new Date();
          const lastUpdated = new Date(circle.createdAt);

          if (currentTime - lastUpdated > this.maxPingAge) {
            circle.circle.setMap(null);
            circle.label.setMap(null);
          }
        }
      });

      Object.keys(this.markers).forEach((positionName) => {
        const marker = this.markers[positionName];

        if (marker) {
          switch (marker.markerType) {
            case 'user': {
              const currentTime = new Date();
              const lastUpdated = new Date(marker.lastUpdated);

              if (currentTime - lastUpdated > this.maxUserAge) {
                eventCentral.triggerEvent({
                  event: eventCentral.Events.REMOVEPOSITIONS,
                  params: { positions: [marker] },
                });
              }

              break;
            }
            default: {
              break;
            }
          }
        }
      });

      this.startAgeChecker();
    }, 10000);
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
        const marker = this.markers[positionName];

        this.realignMap([marker]);
        parentList.toggleList();
        marker.showDescription();
        marker.showLabel();

        if (marker.markerType === 'user' || marker.markerType === 'you') {
          marker.showAccuracy();
        }
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
                coordinates: {
                  latitude: moveEvent.latLng.lat(),
                  longitude: moveEvent.latLng.lng(),
                },
                map: this.map,
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
        // elementCreator.createButton({
        //   text: 'Create marker',
        //   func: () => {
        //     const markerDialog = new DialogBox({
        //       buttons: {
        //         left: {
        //           text: 'Cancel',
        //           eventFunc: () => {
        //             markerDialog.removeView();
        //           },
        //         },
        //         right: {
        //           text: 'Create',
        //           eventFunc: () => {
        //             const position = {
        //               coordinates: {
        //                 longitude: event.latLng.lng(),
        //                 latitude: event.latLng.lat(),
        //                 accuracy: 30,
        //               },
        //               positionName: markerDialog.inputs.find(input => input.inputName === 'markerName').inputElement.value,
        //               description: markerDialog.inputs.find(input => input.inputName === 'description').inputElement.value.split('\n'),
        //               markerType: 'custom',
        //             };
        //
        //             socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
        //               if (error) {
        //                 console.log(error);
        //
        //                 return;
        //               }
        //
        //               eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
        //               markerDialog.removeView();
        //             });
        //           },
        //         },
        //       },
        //       inputs: [{
        //         placeholder: 'Name of the position',
        //         inputName: 'markerName',
        //         isRequired: true,
        //         maxLength: 100,
        //       }, {
        //         placeholder: 'Description',
        //         inputName: 'description',
        //         multiLine: true,
        //         maxLength: 6000,
        //       }, {
        //         type: 'radioSet',
        //         title: 'Who should the position be visible to?',
        //         optionName: 'visibility',
        //         options: [
        //           { optionId: 'visPublic', optionLabel: 'Everyone' },
        //           { optionId: 'visTeam', optionLabel: 'My team' },
        //           { optionId: 'visPrivate', optionLabel: 'Only me' },
        //         ],
        //       }],
        //       description: ['Mark a position that offers the maximum amount of project team synergy'],
        //       extraDescription: [''],
        //     });
        //     markerDialog.appendTo(this.element.parentElement);
        //     this.hideMapClickMenu();
        //   },
        // }),
        // elementCreator.createButton({
        //   text: 'Ping',
        //   func: () => {
        //     const pingDialog = new DialogBox({
        //       buttons: {
        //         left: {
        //           text: 'Cancel',
        //           eventFunc: () => {
        //             pingDialog.removeView();
        //           },
        //         },
        //         right: {
        //           text: 'Ping',
        //           eventFunc: () => {
        //             const pingText = pingDialog.inputs.find(({ inputName }) => inputName === 'pingText').inputElement.value;
        //
        //             const userName = storageManager.getUserName();
        //             const position = {
        //               coordinates: {
        //                 radius: 90,
        //                 longitude: event.latLng.lng(),
        //                 latitude: event.latLng.lat(),
        //                 accuracy: 0,
        //               },
        //               markerType: 'ping',
        //               positionName: `${userName}-ping`,
        //               isPublic: true,
        //               isStatic: true,
        //               description: pingText ? [`${pingText.charAt(0).toUpperCase()}${pingText.slice(1)}`] : ['Unknown activity'],
        //             };
        //
        //             socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
        //               if (error) {
        //                 return;
        //               }
        //
        //               pingDialog.removeView();
        //               eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
        //             });
        //           },
        //         },
        //       },
        //       inputs: [{
        //         placeholder: 'Ping message. Optional',
        //         inputName: 'pingText',
        //         maxLength: 20,
        //       }],
        //       description: ['Send a map ping'],
        //       extraDescription: ['Input the message that will be shown with the ping. Default message is "Unknown activity"'],
        //     });
        //
        //     pingDialog.appendTo(this.element.parentElement);
        //     this.hideMapClickMenu();
        //   },
        // }),
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
    if (!(typeof google === 'undefined' || typeof MarkerClusterer === 'undefined' || typeof MapLabel === 'undefined')) {
      const beautifiedDate = textTools.generateTimeStamp({ date: position.lastUpdated });

      if (this.markers.I) {
        this.markers.I.setPosition({
          coordinates: position.coordinates,
          lastUpdated: position.lastUpdated,
          map: this.map,
        });
        this.markers.I.description = [`Last updated: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`];
        this.markers.I.setMap(this.map);
      } else {
        this.createThisUserMarker({ position });
      }
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
   * Add listeners to map
   */
  attachMapListeners() {
    let longClick = false;

    google.maps.event.addListener(this.clusterer, 'clusterclick', (cluster) => {
      const bounds = new google.maps.LatLngBounds();
      const markers = cluster.getMarkers();

      soundLibrary.playSound('button2');

      if (markers) {
        markers.forEach(marker => bounds.extend(marker.getPosition()));

        this.realignMap(markers);
      }
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
   * @returns {google.maps.Map} - Map
   */
  getMap() { return this.map; }

  /**
   * @param {{latitude: Number, longitude: Number}} position - Long and lat coordinates for the new map center
   */
  setMapCenter(position) {
    if (this.map) {
      this.map.setCenter(new google.maps.LatLng(parseFloat(position.latitude), parseFloat(position.longitude)));
    }
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

  isWithinBounds({ source }) {
    return Object.keys(this.markers).filter((markerName) => {
      const marker = this.markers[markerName];

      const accuracy = marker.accuracy;
      // TODO Get from server instead of hardcoding
      const accuracyAdjustment = accuracy > 40 ? 40 : accuracy;

      return source.getBounds()
          .contains(marker.getPosition()) || (google.maps.geometry.spherical.computeDistanceBetween(source.getCenter(), marker.getPosition()) - accuracyAdjustment) <= source.getRadius();
    }).map(markerName => this.markers[markerName]);
  }

  retrievePositions({ callback = () => {} }) {
    socketManager.emitEvent('getMapPositions', { types: ['google', 'custom', 'user', 'ping'] }, ({ error, data }) => {
      if (error || !data) {
        return;
      }

      const { positions, currentTime } = data;

      positions.forEach((position) => {
        if (position.markerType === 'ping' || position.markerType === 'signalBlock') {
          this.createCircleArea({ position });
        } else {
          this.createMarker({ position, currentTime });
        }
      });

      if (this.map) {
        this.resetClusterer(Object.keys(this.markers).filter(positionName => this.markers[positionName].shouldCluster && this.markers[positionName].map).map(positionName => this.markers[positionName].marker));
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
  }

  createCircleArea({ position = {} }) {
    const currentTime = new Date();
    const lastUpdated = new Date(position.lastUpdated);

    if (position.markerType === 'signalBlock' || (currentTime - lastUpdated < this.maxPingAge)) {
      const circle = createCircle({ coordinates: position.coordinates });
      const label = new Label({
        positionName: position.positionName,
        coordinates: position.coordinates,
        labelText: position.description[0],
      });

      this.circles[position.positionName] = {
        createdAt: position.lastUpdated,
        markerType: position.markerType,
        circle,
        label,
      };

      if (this.map) {
        circle.setMap(this.map);
        label.setMap(this.map);

        if (position.markerType === 'signalBlock') {
          this.hideBlockedPositions();
        }
      }
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
   * @param {Date} params.currentTime Current time sent from server
   * @param {string[]} [params.position.description] Position description
   * @param {string} [params.position.team] Name of the team that the position is part of
   */
  createMarker({ position: { positionName, coordinates, geometry, markerType, description, lastUpdated, team, owner }, currentTime }) {
    if (typeof positionName !== 'string') {
      return;
    }

    const thisUser = storageManager.getUserName();

    if (positionName && positionName.toLowerCase() !== thisUser) {
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

          this.clusterer.addMarkers([this.markers[positionName].marker]);
        }
      } else if (markerType === 'user' && lastUpdated) {
        const date = new Date(lastUpdated);
        const currentDate = new Date(currentTime);

        if (currentDate - date < this.maxUserAge) {
          const beautifiedDate = textTools.generateTimeStamp({ date });
          // TODO Duplicate code
          const userDescription = [
            `Team: ${team || '-'}`,
            `Last seen: ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`,
            `Accuracy: ${coordinates.accuracy} meters`,
          ];

          this.markers[positionName] = new MapMarker({
            coordinates: {
              accuracy: coordinates.accuracy,
              latitude,
              longitude,
            },
            lastUpdated: date,
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

          this.markers[positionName].setPosition({
            coordinates: {
              accuracy: coordinates.accuracy,
              latitude,
              longitude,
            },
            lastUpdated: date,
            map: this.map,
          });
        }
      } else if (markerType) {
        this.markers[positionName] = new MapMarker({
          coordinates: {
            latitude,
            longitude,
          },
          icon: {
            url: markerType === 'custom' ? 'images/mapiconcreated.png' : 'images/mapicon.png',
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

        this.clusterer.addMarkers([this.markers[positionName].marker]);
      }
    }
  }

  hideBlockedPositions(positionName) {
    const blockers = Object.keys(this.circles).filter(circleName => this.circles[circleName] && this.circles[circleName].markerType === 'signalBlock').map(circleName => this.circles[circleName].circle);

    blockers.forEach((blocker) => {
      const withinBounds = this.isWithinBounds({ source: blocker });

      if (positionName) {
        const names = withinBounds.map(mapMarker => mapMarker.positionName);

        if (names.indexOf(positionName) > -1) {
          this.clusterer.removeMarker(this.markers[positionName].marker);
          this.markers[positionName].setMap(null);
        }
      } else {
        withinBounds.forEach((mapMarker) => {
          this.clusterer.removeMarker(mapMarker.marker);
          mapMarker.setMap(null);
        });
      }
    });
  }

  appendTo(parentElement) {
    parentElement.classList.add('mapMain');
    super.appendTo(parentElement);

    if (!this.started) {
      this.startMap();
    } else {
      google.maps.event.trigger(this.map, 'resize');
    }

    this.hideBlockedPositions();
  }

  removeView() {
    this.element.parentNode.classList.remove('mapMain');
    super.removeView();
    this.infoElement.classList.remove('flash');
  }
}

module.exports = WorldMap;
exports.MapViews = MapViews;
