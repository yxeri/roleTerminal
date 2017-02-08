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
const textTools = require('../../TextTools');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

const MapViews = {
  OVERVIEW: 'overview',
  ME: 'me',
  CLUSTER: 'cluster',
  AREA: 'area',
  NONE: '',
};

class WorldMap extends View {
  /** @namespace this.markers.I */

  constructor({
    isFullscreen,
    mapView,
    markers = {},
    cornerCoordinates = {},
    centerCoordinates = {},
    maxShortDescription = 200,
    zoomLevel = 15,
    mapBackground = '#FFFFFF',
    mapStyles = [],
    labelStyle = {},
    clusterStyle = {},
  }) {
    super({ isFullscreen });
    this.element.setAttribute('id', 'map');

    this.mapView = mapView || MapViews.NONE;
    this.markers = markers;
    this.labels = {};
    this.cornerCoordinates = cornerCoordinates;
    this.centerCoordinates = centerCoordinates;
    this.infoElement = document.createElement('DIV');
    this.infoElement.setAttribute('id', 'markerInfo');
    this.hideMarkerInfo();
    this.maxShortDescription = maxShortDescription;
    this.defaultZoomLevel = zoomLevel;
    this.labelStyle = labelStyle;
    this.clusterer = null;
    this.clusterStyle = clusterStyle;
    this.mapStyles = mapStyles;
    this.mapBackground = mapBackground;
    this.map = null;
    this.overlay = null;
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

  /**
   * Creates a label at the location of another object
   * The name of the position will be used as text for the label
   * @param {string} params.positionName - Name of the position
   * @param {string} params.text - Text that will be printed
   * @param {string} [params.align] - Text alignment (left|right)
   * @param {{latitude: Number, longitude: Number}} params.position - Long and lat coordinates of the label
   */
  createLabel({ positionName, text, align = 'right', position }) {
    const lowerPositionName = positionName.toLowerCase();
    const labelOptions = {
      position: new google.maps.LatLng(position.latitude, position.longitude),
      align,
      text,
    };

    Object.keys(this.labelStyle).forEach((name) => { labelOptions[name] = this.labelStyle[name]; });

    this.labels[lowerPositionName] = new MapLabel(labelOptions);
    this.labels[lowerPositionName].setMap(this.map);
  }

  /**
   * Creates a map marker, adds it to the map and calls the creation of a label (if flag is set)
   * @private
   * @param {Object} params - Parameters
   * @param {string} params.markerName - Name of the map marker
   * @param {string} params.title - Title of the marker description
   * @param {string} params.markerType - Type of the marker
   * @param {number} params.opacity - Opacity of the marker in the view
   * @param {boolean} params.hideLabel - Should the label be hidden in the view?
   * @param {boolean} params.ignoreCluster - Should the marker be excluded from clusters?
   * @param {string} params.iconUrl - Path to a custom icon image
   * @param {{longitude: Number, latitude: Number}} params.position - Long and lat coordinates of the map marker
   * @param {string} params.description - Description for map marker, which will be shown on click or command
   */
  createMarker({ markerName, position, iconUrl, description, title, markerType, opacity, hideLabel, ignoreCluster }) {
    const icon = {
      url: iconUrl || '/images/mapicon.png',
      size: new google.maps.Size(16, 16),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(8, 8),
    };
    const snakeCaseTitle = title.replace(/\s/g, '_');
    const markerId = Object.keys(this.markers).length + 1;

    this.markers[markerName] = new google.maps.Marker({
      position: {
        lat: position.latitude,
        lng: position.longitude,
      },
      opacity: opacity || 0.9,
      icon,
    });

    this.markers[markerName].addedTitle = title;
    this.markers[markerName].markerId = markerId;
    this.markers[markerName].markerType = markerType;

    if (description) {
      this.markers[markerName].addedShortDesc = description.length > this.maxShortDescription ? `${description.slice(0, this.maxShortDescription)}..` : `${description}`;
      this.markers[markerName].addedExpandedDesc = description.length > this.maxShortDescription ? `${description.slice(this.maxShortDescription)}` : undefined;
    }

    if (!hideLabel) {
      this.createLabel({
        positionName: title,
        labelText: snakeCaseTitle.length > 18 ? `${markerId}:${snakeCaseTitle.slice(0, 18)}..` : `${markerId}:${snakeCaseTitle}`,
        position,
      });
    }

    this.markers[markerName].setMap(this.map);

    if (!ignoreCluster && this.clusterer) {
      this.clusterer.addMarker(this.markers[markerName]);
    }

    google.maps.event.addListener(this.markers[markerName], 'click', () => {
      const marker = this.markers[markerName];
      const projection = this.overlay.getProjection();
      const xy = projection.fromLatLngToContainerPixel(marker.getPosition());

      this.infoElement.style.left = `${xy.x}px`;
      this.infoElement.style.top = `${xy.y}px`;
      this.infoElement.textContent = `${marker.addedTitle}.${'\n'}${marker.addedShortDesc || ''}`;
      this.showMarkerInfo();
    });
  }

  /**
   * Sets new position for a map marker
   * Creates a new map marker if it doesn't exist
   * @static
   * @param {Object} params - Parameters
   * @param {string} params.positionName - Name of the map marker
   * @param {{latitude: Number, longitude: Number}} params.position - Latitude and longitude coordinates for the map marker
   * @param {string} params.description - Description for map marker, which will be shown on click or command
   * @param {string} params.markerType - Type of marker
   * @param {Date} [params.lastUpdated] - Time of last update
   * @param {boolean} [params.hideLabel] - Should the label be hidden?
   * @param {string} [params.iconUrl] - Path to custom map marker icon
   */
  setMarkerPosition({ positionName, position, lastUpdated, markerType, hideLabel, iconUrl, description }) {
    const markerName = positionName.toLowerCase();
    const marker = this.markers[markerName];

    if (marker) {
      marker.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
      marker.lastUpdated = lastUpdated;
    } else {
      this.createMarker({
        lastUpdated,
        position,
        markerName,
        title: positionName,
        hideLabel,
        iconUrl,
        description,
        markerType,
      });
    }
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
   * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
   */
  createThisUserMarker(position) {
    this.createMarker({
      markerName: 'I',
      position,
      title: 'You',
      iconUrl: '/images/mapiconyou.png',
      hideLabel: true,
    });
  }

  /**
   * Sets new position to the user's map marker
   * Creates a new map marker if it doesn't exist
   * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
   */
  setUserPosition(position) {
    if (this.markers.I) {
      this.markers.I.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
    } else {
      this.createThisUserMarker(position);
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
   * @param {Object[]} markers - Map markers used to create bounds
   */
  realignMap(markers) {
    const bounds = new google.maps.LatLngBounds();
    let centerPos = this.map.getCenter();

    google.maps.event.trigger(this.map, 'resize');

    if (this.mapView === MapViews.OVERVIEW) {
      const markerKeys = Object.keys(markers);

      for (let i = 0; i < markerKeys.length; i += 1) {
        const marker = markerKeys[i];

        bounds.extend(markers[marker].getPosition());
      }

      this.map.fitBounds(bounds);
      centerPos = bounds.getCenter();
    } else if (this.mapView === MapViews.ME && markers.I) {
      centerPos = markers.I.getPosition();
      this.map.setZoom(18);
    } else if (this.mapView === MapViews.CLUSTER) {
      if (markers) {
        for (let i = 0; i < markers.length; i += 1) {
          const marker = markers[i];

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
    } else if (markers[this.mapView]) {
      bounds.extend(markers[this.mapView].getPosition());

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
    google.maps.event.addListener(this.clusterer, 'clusterclick', (cluster) => {
      const bounds = new google.maps.LatLngBounds();
      const markers = cluster.getMarkers();

      for (let i = 0; i < markers.length; i += 1) {
        bounds.extend(markers[i].getPosition());
      }

      this.setMapView(MapViews.CLUSTER);
      this.realignMap(cluster.getMarkers());
    });

    google.maps.event.addListener(this.map, 'click', () => { console.log('click map'); this.hideMarkerInfo(); });
    google.maps.event.addListener(this.map, 'dragstart', () => { console.log('dragstart'); this.hideMarkerInfo(); });
    google.maps.event.addListener(this.map, 'zoom_changed', () => { console.log('zoomchange'); this.hideMarkerInfo(); });
    google.maps.event.addListener(this.map, 'idle', () => { this.toggleMapLabels(); });
  }

  showMarkerInfo() { this.infoElement.classList.remove('hide'); }

  hideMarkerInfo() { this.infoElement.classList.add('hide'); }

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
    console.log(cornerOneCoords, cornerTwoCoords);
    this.cornerCoordinates.cornerOne = cornerOneCoords;
    this.cornerCoordinates.cornerTwo = cornerTwoCoords;
  }

  /**
   * Set center coordinates for the map
   * @param {{longitude: Number, latitude: Number}} centerCoordinates - Center lat and long coordinates
   */
  setCenterCoordinates(centerCoordinates) {
    console.log(centerCoordinates);
    this.centerCoordinates = centerCoordinates;
  }

  /**
   * Set default zoom level
   * @param {number} defaultZoomLevel - Default zoom level
   */
  setDefaultZoomLevel(defaultZoomLevel) {
    console.log(defaultZoomLevel);
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

  /**
   * Get description from the map marker
   * @static
   * @param {Number} markerId - ID of the map marker
   * @returns {{title: string, description: string}|null} - Title and escription of the map marker
   */
  getInfoText(markerId) {
    const marker = this.markers[Object.keys(this.markers).find(markerName => this.markers[markerName].markerId === parseInt(markerId, 10))];

    if (!marker) { return null; }

    let description = marker.addedShortDesc;

    if (marker.addedExpandedDesc) { description = marker.addedShortDesc.slice(0, marker.addedShortDesc.length - 2) + marker.addedExpandedDesc; }

    return { title: marker.addedTitle, description };
  }

  /**
   * Creates the map and retrieves positions from server and Google maps
   * @static
   */
  startMap() {
    // Will stop and retry to create map if external files have not finished loading
    if (typeof google === 'undefined' || typeof MarkerClusterer === 'undefined' || typeof MapLabel === 'undefined') {
      setTimeout(this.startMap, 1000);

      return;
    }

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

    if (!this.clusterer) {
      this.clusterer = new MarkerClusterer(this.map, Object.keys(this.markers).map(key => this.markers[key]), this.clusterStyle);
    }

    if (!this.overlay) {
      this.overlay = new google.maps.OverlayView();
      this.overlay.draw = () => {};
      this.overlay.setMap(this.map);
    }

    this.element.appendChild(this.infoElement);
    this.attachMapListeners();

    socketManager.emitEvent('getGooglePositions', {}, ({ error, data: { positions = [], team, currentTime } }) => {
      if (error) {
        return;
      }

      const userName = storageManager.getUserName() ? storageManager.getUserName().toLowerCase() : '';

      positions.forEach(({ positionName, position, geometry, type, group, description, lastUpdated }) => {
        if (positionName.toLowerCase() !== userName) {
          const latitude = parseFloat(position.latitude);
          const longitude = parseFloat(position.longitude);

          if (geometry === 'point') {
            this.setMarkerPosition({
              positionName,
              position: {
                latitude,
                longitude,
              },
              description,
              markerType: 'location',
            });
          } else if (type && type === 'user' && lastUpdated) {
            const date = new Date(lastUpdated);

            if (currentTime - date < (20 * 60 * 1000)) {
              const userDescription = `Team: ${group || '-'}. Last seen: ${textTools.generateTimeStamp({ date })}`;

              this.setMarkerPosition({
                date,
                positionName,
                position: {
                  latitude,
                  longitude,
                },
                iconUrl: team && group && team === group ? 'images/mapiconteam.png' : 'images/mapiconuser.png',
                hideLabel: true,
                description: userDescription,
                markerType: type,
              });
            }
          }
        }
      });

      this.realignMap(this.markers);
    });
  }

  appendTo(parentElement) {
    parentElement.classList.add('mapMain');
    super.appendTo(parentElement);
  }

  removeView() {
    this.element.parentNode.classList.remove('mapMain');
    super.removeView();
  }
}

module.exports = WorldMap;
exports.MapViews = MapViews;
