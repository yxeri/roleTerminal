/*
 Copyright 2015 Aleksandar Jankovic

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

/** @module */

const socketHandler = require('./socketHandler');
const storage = require('./storage');
const commandHandler = require('./commandHandler');

const markerInfo = document.getElementById('markerInfo');
const mapMarkers = {};
const mapPolygons = {};
const mapLines = {};
const mapLabels = {};
const cornerCoords = {};
const maxShortDescLength = 200;
let markerClusterer;
let mapView = '';
let map;
let overlay;

/**
 * Sets new map view. Affects how the map is realigned and shown
 * @static
 * @param {string} view - Type of map view (overview, me, cluster)
 */
function setMapView(view) {
  mapView = view;
}

/**
 * @private
 * @param {Object[]} coordsCollection - Collection of x and y coordinates of the polygon
 * @returns {{latitude: Number, longitude: Number}} - Long and lat center coordinates of the polygon
 */
function getPolygonCenter(coordsCollection) {
  const bounds = new google.maps.LatLngBounds();

  for (let i = 0; i < coordsCollection.length; i += 1) {
    const coords = coordsCollection[i];

    bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
  }

  const center = bounds.getCenter();

  return { latitude: center.lat(), longitude: center.lng() };
}

/**
 * Creates a label at the location of another object
 * The name of the position will be used as text for the label
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the position
 * @param {string} params.labelText - Text that will be printed
 * @param {string} params.align - Text alignment (left|right)
 * @param {{latitude: Number, longitude: Number}} params.position - Long and lat coordinates of the label
 */
function createLabel(params) {
  const positionName = params.positionName.toLowerCase();
  const position = params.position;
  const labelText = params.labelText;

  mapLabels[positionName] = new MapLabel({
    text: labelText,
    position: new google.maps.LatLng(position.latitude, position.longitude),
    align: params.align || 'right',
    fontFamily: 'GlassTTYVT220',
    fontColor: '#00ffcc',
    strokeColor: '#001e15',
    fontSize: 12,
  });

  mapLabels[positionName].setMap(map || null);
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
function createMarker(params) {
  const markerName = params.markerName;
  const position = params.position;
  const icon = {
    url: params.iconUrl || '/images/mapicon.png',
    size: new google.maps.Size(16, 16),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(8, 8),
  };
  const description = params.description;
  const title = params.title;
  const snakeCaseTitle = title.replace(/\s/g, '_');
  const markerId = Object.keys(mapMarkers).length + 1;
  const markerType = params.markerType;

  mapMarkers[markerName] = new google.maps.Marker({
    position: {
      lat: position.latitude,
      lng: position.longitude,
    },
    opacity: params.opacity || 0.9,
    icon,
  });

  mapMarkers[markerName].addedTitle = params.title;
  mapMarkers[markerName].markerId = markerId;
  mapMarkers[markerName].markerType = markerType;

  if (description) {
    mapMarkers[markerName].addedShortDesc = description.length > maxShortDescLength ? `${description.slice(0, maxShortDescLength)}..` : `${description}`;
    mapMarkers[markerName].addedExpandedDesc = description.length > maxShortDescLength ? `${description.slice(maxShortDescLength)}` : undefined;
  }

  if (!params.hideLabel) {
    createLabel({
      positionName: title,
      labelText: snakeCaseTitle.length > 18 ? `${markerId}:${snakeCaseTitle.slice(0, 18)}..` : `${markerId}:${snakeCaseTitle}`,
      position,
    });
  }

  mapMarkers[markerName].setMap(map || null);

  if (!params.ignoreCluster && markerClusterer) {
    markerClusterer.addMarker(mapMarkers[markerName]);
  }

  google.maps.event.addListener(mapMarkers[markerName], 'click', () => {
    const marker = mapMarkers[markerName];
    const projection = overlay.getProjection();
    const xy = projection.fromLatLngToContainerPixel(marker.getPosition());

    markerInfo.classList.remove('hide');
    markerInfo.style.left = `${xy.x}px`;
    markerInfo.style.top = `${xy.y}px`;
    markerInfo.textContent = `${marker.addedTitle}.${'\n'}${marker.addedShortDesc || ''}`;
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
function setMarkerPosition(params) {
  const positionName = params.positionName;
  const markerName = params.positionName.toLowerCase();
  const position = params.position;
  const lastUpdated = params.lastUpdated;
  const marker = mapMarkers[markerName];
  const markerType = params.markerType;

  if (marker) {
    marker.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
    marker.lastUpdated = lastUpdated;
  } else {
    createMarker({
      lastUpdated,
      position,
      markerName,
      title: positionName,
      hideLabel: params.hideLabel,
      iconUrl: params.iconUrl,
      description: params.description,
      markerType: params.markerType,
    });
  }

  commandHandler.addSpecialMapOption(positionName, markerType, mapMarkers[markerName].markerId);
}

/**
 * Creates a polygon and adds it to the map
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the polygon
 * @param {Object[]} params.coordsCollection - Collection of x and y coordinates of the polygon
 * @param {boolean} [params.hideLabel] - Should the label be hidden?
 */
function createPolygon(params) {
  const positionName = params.positionName;
  const coordsCollection = params.coordsCollection;

  mapPolygons[positionName] = new google.maps.Polygon({
    paths: coordsCollection,
    strokeColor: '#008766',
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: '#00ffcc',
    fillOpacity: 0.35,
  });

  if (!params.hideLabel) {
    // TODO Should center the label inside the polygon
    createLabel({
      positionName,
      labelText: positionName,
      position: getPolygonCenter(coordsCollection),
      align: 'center',
    });
  }

  mapPolygons[positionName].setMap(map || null);
}

/**
 * Sets new positions of the polygon
 * Creates a new polygon if one with the sent name doesn't exist
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the polygon
 * @param {Object[]} params.coordsCollection - Collection of x and y coordinates of the polygon
 */
function setPolygonPosition(params) {
  const positionName = params.positionName;
  const coordsCollection = params.coordsCollection;

  if (mapPolygons[positionName]) {
    mapPolygons[positionName].setPaths(coordsCollection);
  } else {
    createPolygon({
      coordsCollection,
      positionName,
    });
  }
}

/**
 * Creates a line and adds it to the map
 * The line can have multiple points
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the line
 * @param {Object[]} params.coordsCollection - Collection of Long and lat coordinates of the line
 */
function createLine(params) {
  const positionName = params.positionName;

  mapLines[positionName] = new google.maps.Polyline({
    path: params.coordsCollection,
    strokeColor: '#008766',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  mapLines[positionName].setMap(map || null);
}

/**
 * Sets new positions for the line
 * Creates a new line if a line with the sent name doesn't exist
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the line
 * @param {Object[]} params.coordsCollection - Collection of long and lat coordinates for the line
 */
function setLinePosition(params) {
  const positionName = params.positionName;
  const coordsCollection = params.coordsCollection;

  if (mapLines[positionName]) {
    mapLines[positionName].setPath(coordsCollection);
  } else {
    createLine({
      positionName,
      coordsCollection,
    });
  }
}

/**
 * @static
 * @returns {string} - Returns string representing the type of map view
 */
function getMapView() {
  return mapView;
}

/**
 * @static
 * @returns {Object} - Returns map marker representing this user
 */
function getThisUserMarker() {
  return mapMarkers.I;
}

/**
 * Creates the map marker representing this user
 * @static
 * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
 */
function createThisUserMarker(position) {
  createMarker({
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
 * @static
 * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
 */
function setUserPosition(position) {
  if (mapMarkers.I) {
    mapMarkers.I.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
  } else {
    createThisUserMarker(position);
  }
}

/**
 * Resets map on all labels, in case any of the connected markers are no longer on the map
 * @static
 */
function toggleMapLabels() {
  const markerKeys = Object.keys(mapMarkers);

  for (let i = 0; i < markerKeys.length; i += 1) {
    const markerName = markerKeys[i];

    if (mapLabels[markerName] && mapLabels[markerName].getMap() !== mapMarkers[markerName].getMap()) {
      mapLabels[markerName].setMap(mapMarkers[markerName].getMap());
    }
  }
}

/**
 * Creates new bounds and re-centers the map based on the map view
 * @static
 * @param {Object[]} markers - Map markers used to create bounds if map view is "cluster"
 */
function realignMap(markers) {
  const bounds = new google.maps.LatLngBounds();
  let centerPos = map.getCenter();

  google.maps.event.trigger(map, 'resize');

  if (mapView === 'overview') {
    const markerKeys = Object.keys(mapMarkers);

    for (let i = 0; i < markerKeys.length; i += 1) {
      const marker = markerKeys[i];

      bounds.extend(mapMarkers[marker].getPosition());
    }

    map.fitBounds(bounds);
    centerPos = bounds.getCenter();
  } else if (mapView === 'me' && mapMarkers.I) {
    centerPos = mapMarkers.I.getPosition();
    map.setZoom(18);
  } else if (mapView === 'cluster') {
    if (markers) {
      for (let i = 0; i < markers.length; i += 1) {
        const marker = markers[i];

        bounds.extend(marker.getPosition());
      }

      map.fitBounds(bounds);
      centerPos = bounds.getCenter();
    }
  } else if (mapView === 'area') {
    bounds.extend(new google.maps.LatLng(cornerCoords.cornerOne.latitude, cornerCoords.cornerOne.longitude));
    bounds.extend(new google.maps.LatLng(cornerCoords.cornerTwo.latitude, cornerCoords.cornerTwo.longitude));

    map.fitBounds(bounds);
    centerPos = bounds.getCenter();
  } else if (mapMarkers[mapView]) {
    bounds.extend(mapMarkers[mapView].getPosition());

    map.fitBounds(bounds);
    centerPos = bounds.getCenter();
  }

  map.setCenter(centerPos);
  markerInfo.classList.add('hide');
}

/**
 * Set map to current map on all objects in the collection
 * @private
 * @param {Object} collections - Collection of objects to be attached to the map
 */
function setMap(collections) {
  for (let i = 0; i < collections.length; i += 1) {
    const collection = collections[i];
    const collectionKeys = Object.keys(collection);

    for (let j = 0; j < collectionKeys.length; j += 1) {
      collection[collectionKeys[j]].setMap(map);
    }
  }
}

/**
 * Add listeners to map
 */
function attachMapListeners() {
  google.maps.event.addListener(markerClusterer, 'clusterclick', (cluster) => {
    const bounds = new google.maps.LatLngBounds();
    const markers = cluster.getMarkers();

    for (let i = 0; i < markers.length; i += 1) {
      bounds.extend(markers[i].getPosition());
    }

    setMapView('cluster');
    realignMap(cluster.getMarkers());
  });

  google.maps.event.addListener(map, 'click', () => {
    markerInfo.classList.add('hide');
  });

  google.maps.event.addListener(map, 'dragstart', () => {
    markerInfo.classList.add('hide');
  });

  google.maps.event.addListener(map, 'zoom_changed', () => {
    markerInfo.classList.add('hide');
  });

  google.maps.event.addListener(map, 'idle', () => {
    toggleMapLabels();
  });
}

/**
 * Create map clusterer and add all map markers to it
 * @private
 */
function createMarkerClusterer() {
  markerClusterer = new MarkerClusterer(map, Object.keys(mapMarkers).map(key => mapMarkers[key]), {
    gridSize: 24,
    maxZoom: 17,
    zoomOnClick: false,
    singleSize: true,
    averageCenter: true,
    styles: [{
      width: 22,
      height: 22,
      iconAnchor: [11, 11],
      textSize: 11,
      url: 'images/m.png',
    }],
  });
}

/**
 * Create map, sets this map on all polygons, markers, lines, creates map clusterer and attaches listeners
 * @static
 * @param {Object} params - Parameters
 * @param {Object} params.centerCoordinates - Long and lat coordinates
 * @param {Number} params.centerCoordinates.latitude - Center latitude for the map
 * @param {Number} params.centerCoordinates.longitude - Center longitude for the map
 * @param {Number} params.zoomLevel - Default zoom level
 * @param {string} params.elementId - Id of map element
 */
function createMap(params) {
  const elementId = params.elementId;

  map = new google.maps.Map(document.getElementById(elementId), {
    center: {
      lat: params.centerCoordinates.latitude,
      lng: params.centerCoordinates.longitude,
    },
    zoom: params.zoomLevel,
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
    backgroundColor: '#001e15',
    minZoom: 3,
    maxZoom: 19,
    styles: [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          { color: '#001e15' },
        ],
      }, {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          { color: '#00cca3' },
        ],
      }, {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'administrative',
        elementType: 'all',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          { color: '#00cca3' },
        ],
      },
    ],
  });

  setMap([mapMarkers, mapPolygons, mapLines, mapLabels]);
  createMarkerClusterer();
  attachMapListeners(elementId);

  /**
   * Overlay is used to catch mouse clicks and easily retrieve x and y instead of lot and lang coordinates
   */
  overlay = new google.maps.OverlayView();
  overlay.draw = () => {};
  overlay.setMap(map);
}

/**
 * Reset view port, which recreates all clusters
 * @static
 */
function resetClusters() {
  markerClusterer.resetViewport();
}

/**
 * @static
 * @returns {google.maps.Map} - Map
 */
function getMap() {
  return map;
}

/**
 * @static
 * @param {{latitude: Number, longitude: Number}} position - Long and lat coordinates for the new map center
 */
function setMapCenter(position) {
  if (map) {
    map.setCenter(new google.maps.LatLng(parseFloat(position.latitude), parseFloat(position.longitude)));
  }
}

/**
 * Set corner coordinates of the bounds for the map
 * @static
 * @param {{longitude: Number, latitude: Number}} cornerOneCoords - Corner lat and long coordinates
 * @param {{longitude: Number, latitude: Number}} cornerTwoCoords - Corner lat and long coordinates
 */
function setCornerCoords(cornerOneCoords, cornerTwoCoords) {
  cornerCoords.cornerOne = cornerOneCoords;
  cornerCoords.cornerTwo = cornerTwoCoords;
}

/**
 * Increase the zoom level of the map by 1
 * @static
 */
function increaseZoom() {
  mapView = '';
  map.setZoom(map.getZoom() + 1);
}

/**
 * Decrease the zoom level of the map by 1
 * @static
 */
function decreaseZoom() {
  mapView = '';
  map.setZoom(map.getZoom() - 1);
}

/**
 * Get description from the map marker
 * @static
 * @param {Number} markerId - ID of the map marker
 * @returns {{title: string, description: string}} - Title and escription of the map marker
 */
function getInfoText(markerId) {
  const marker = mapMarkers[Object.keys(mapMarkers).find(markerName => mapMarkers[markerName].markerId === parseInt(markerId, 10))];

  if (!marker) {
    return null;
  }

  let description = marker.addedShortDesc;

  if (marker.addedExpandedDesc) {
    description = marker.addedShortDesc.slice(0, marker.addedShortDesc.length - 2) + marker.addedExpandedDesc;
  }

  return { title: marker.addedTitle, description };
}

/**
 * Creates the map and retrieves positions from server and Google maps
 * @static
 */
function startMap() {
  // Will stop and retry to create map if external files have not finished loading
  if (typeof google === 'undefined' || typeof MarkerClusterer === 'undefined' || typeof MapLabel === 'undefined') {
    setTimeout(startMap, 1000);

    return;
  }

  if (!getMap()) {
    createMap({
      centerCoordinates: storage.getCenterCoordinates(),
      zoomLevel: storage.getDefaultZoomLevel(),
      elementId: 'map',
    });
  }

  socketHandler.emit('getMapPositions', { types: ['static', 'users'] });
  socketHandler.emit('getGooglePositions', { types: ['world'] });
}

exports.setMarkerPosition = setMarkerPosition;
exports.setLinePosition = setLinePosition;
exports.setPolygonPosition = setPolygonPosition;
exports.getMapView = getMapView;
exports.getThisUserMarker = getThisUserMarker;
exports.setUserPosition = setUserPosition;
exports.createMap = createMap;
exports.setMapView = setMapView;
exports.realignMap = realignMap;
exports.resetClusters = resetClusters;
exports.getMap = getMap;
exports.toggleMapLabels = toggleMapLabels;
exports.setMapCenter = setMapCenter;
exports.setCornerCoords = setCornerCoords;
exports.increaseZoom = increaseZoom;
exports.decreaseZoom = decreaseZoom;
exports.getInfoText = getInfoText;
exports.startMap = startMap;
