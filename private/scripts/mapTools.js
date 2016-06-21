/** @module */

const markerInfo = document.getElementById('markerInfo');
const mapMarkers = {};
const mapPolygons = {};
const mapLines = {};
const mapLabels = {};
const cornerCoords = {};
const maxShortDescLength = 320;
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

  for (const coords of coordsCollection) {
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
 * @param {{latitude: Number, longitude: Number}} param.position - Long and lat coordinates of the label
 */
function createLabel(params) {
  const positionName = params.positionName;
  const itemName = params.positionName.toLowerCase();
  const position = params.position;

  mapLabels[itemName] = new MapLabel({
    text: positionName,
    position: new google.maps.LatLng(position.latitude, position.longitude),
    align: params.align || 'right',
    fontFamily: 'monospace',
    fontColor: '#00ffcc',
    strokeColor: '#001e15',
    fontSize: 12,
  });

  mapLabels[itemName].setMap(map || null);
}

/**
 * Creates a map marker, adds it to the map and calls the creation of a label (if flag is set)
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.markerName - Name of the map marker
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

  mapMarkers[markerName] = new google.maps.Marker({
    position: {
      lat: position.latitude,
      lng: position.longitude,
    },
    opacity: params.opacity || 0.9,
    icon,
  });
  mapMarkers[markerName].addedShortDesc = params.description.length > maxShortDescLength ? `${params.description.slice(0, maxShortDescLength)}...` : `${params.description}`;
  mapMarkers[markerName].addedExpandedDesc = params.description.length > maxShortDescLength ? `${params.description.slice(maxShortDescLength)}` : undefined;
  mapMarkers[markerName].addedTitle = params.title;

  if (!params.hideLabel) {
    createLabel({
      positionName: params.title,
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
    markerInfo.textContent = `${marker.addedTitle}.${'\n'}${marker.addedShortDesc}`;
  });
}

/**
 * Sets new position for a map marker
 * Creates a new map marker if it doesn't exist
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the map marker
 * @param {{latitude: Number, longitude: Number}} params.position - Lat and long coordinates for the map marker
 * @param {boolean} params.hideLabel - Should the label be hidden?
 * @param {string} params.iconUrl - Path to custom map marker icon
 * @param {string} params.description - Description for map marker, which will be shown on click or command
 */
function setMarkerPosition(params) {
  const positionName = params.positionName;
  const markerName = params.positionName.toLowerCase();
  const position = params.position;

  if (mapMarkers[markerName]) {
    mapMarkers[markerName].setPosition(new google.maps.LatLng(position.latitude, position.longitude));
  } else {
    createMarker({
      position,
      markerName,
      title: positionName,
      hideLabel: params.hideLabel,
      iconUrl: params.iconUrl,
      description: params.description,
    });
  }
}

/**
 * Creates a polygon and adds it to the map
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.positionName - Name of the polygon
 * @param {Object[]} params.coordsCollection - Collection of x and y coordinates of the polygon
 * @param {boolean} params.hideLabel - Should the label be hidden?
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
  for (const markerName of Object.keys(mapMarkers)) {
    if (mapLabels[markerName] && mapLabels[markerName].getMap() !== mapMarkers[markerName].getMap()) {
      mapLabels[markerName].setMap(mapMarkers[markerName].getMap());
    }
  }
}

/**
 * Creates new bounds and re-centers the map based on the map view
 * @static
 * @param {Objects} markers - Map markers used to create bounds if map view is "cluster"
 */
function realignMap(markers) {
  const bounds = new google.maps.LatLngBounds();
  let centerPos = map.getCenter();

  google.maps.event.trigger(map, 'resize');

  if (mapView === 'overview') {
    for (const marker of Object.keys(mapMarkers)) {
      bounds.extend(mapMarkers[marker].getPosition());
    }

    map.fitBounds(bounds);
    centerPos = bounds.getCenter();
  } else if (mapView === 'me' && mapMarkers.I) {
    centerPos = mapMarkers.I.getPosition();
    map.setZoom(18);
  } else if (mapView === 'cluster') {
    if (markers) {
      for (const marker of markers) {
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
  for (const collection of collections) {
    for (const markerName of Object.keys(collection)) {
      collection[markerName].setMap(map);
    }
  }
}

/**
 * Add listeners to map
 */
function attachMapListeners() {
  google.maps.event.addListener(markerClusterer, 'clusterclick', (cluster) => {
    const bounds = new google.maps.LatLngBounds();

    for (const marker of cluster.getMarkers()) {
      bounds.extend(marker.getPosition());
    }

    setMapView('cluster');
    realignMap(cluster.getMarkers());
  });

  google.maps.event.addListener(map, 'click', () => {
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
  markerClusterer = new MarkerClusterer(map, Object.keys(mapMarkers).map((key) => mapMarkers[key]), {
    gridSize: 13,
    maxZoom: 15,
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
  if (!google) {
    return;
  }

  const elementId = params.elementId;

  map = new google.maps.Map(document.getElementById(elementId), {
    center: {
      lat: params.centerCoordinates.latitude,
      lng: params.centerCoordinates.longitude,
    },
    zoom: params.zoomLevel,
    disableDefaultUI: true,
    draggable: false,
    fullscreenControl: false,
    keyboardShortcuts: false,
    mapTypeControl: false,
    noClear: true,
    zoomControl: false,
    disableDoubleClickZoom: true,
    panControl: false,
    overviewMapControl: false,
    rotateControl: false,
    scaleControl: false,
    scrollwheel: false,
    streetViewControl: false,
    backgroundColor: '#001e15',
    minZoom: 2,
    maxZoom: 18,
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
          { color: '#00ffcc' },
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
          { color: '#00ffcc' },
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
 * @param {string} markerName - Name of the map marker
 * @returns {{title: string, description: string}} - Title and escription of the map marker
 */
function getInfoText(markerName) {
  const marker = mapMarkers[markerName];
  let description = marker.addedShortDesc;

  if (description.addedExpandedDesc) {
    description = marker.addedShortDesc.slice(0, marker.addedShortDesc.length - 3) + marker.addedExpandedDesc;
  }

  if (!marker) {
    return null;
  }

  return { title: marker.addedTitle, description };
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
