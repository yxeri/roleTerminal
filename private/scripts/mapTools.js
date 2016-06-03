'use strict';

const mapMarkers = {};
const mapPolygons = {};
const mapLines = {};
const mapLabels = {};
const cornerCoords = {};
let markerClusterer;
let mapView = '';
let map;

function createLabel(params) {
  const positionName = params.positionName;
  const position = params.position;

  mapLabels[positionName] = new MapLabel({
    text: positionName,
    position: new google.maps.LatLng(position.latitude, position.longitude),
    align: 'right',
  });

  mapLabels[positionName].setMap(map || null);
}

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
    title: params.title,
    opacity: params.opacity || 0.9,
    icon,
  });

  if (!params.hideLabel) {
    createLabel({
      positionName: markerName,
      position,
    });
  }

  mapMarkers[markerName].setMap(map || null);

  if (!params.ignoreCluster && markerClusterer) {
    markerClusterer.addMarker(mapMarkers[markerName]);
  }
}

function setMarkerPosition(params) {
  const positionName = params.positionName;
  const position = params.position;

  if (mapMarkers[positionName]) {
    mapMarkers[positionName].setPosition(new google.maps.LatLng(position.latitude, position.longitude));
  } else {
    createMarker({
      position,
      markerName: positionName,
      title: positionName,
      hideLabel: params.hideLabel,
      iconUrl: params.iconUrl,
    });
  }
}

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

  if (params.hasLabel) {
    // TODO Should center the label inside the polygon
    createLabel({
      positionName,
    });
  }

  mapPolygons[positionName].setMap(map || null);
}

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

function getMapView() {
  return mapView;
}

function getThisUserMarker() {
  return mapMarkers.I;
}

function createThisUserMarker(position) {
  createMarker({
    markerName: 'I',
    position,
    title: 'You',
    iconUrl: '/images/mapiconyou.png',
    hideLabel: true,
  });
}

function setUserPosition(position) {
  if (mapMarkers.I) {
    mapMarkers.I.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
  } else {
    createThisUserMarker(position);
  }
}

function toggleMapLabels() {
  for (const markerName of Object.keys(mapMarkers)) {
    if (mapLabels[markerName] && mapLabels[markerName].getMap() !== mapMarkers[markerName].getMap()) {
      mapLabels[markerName].setMap(mapMarkers[markerName].getMap());
    }
  }
}

function realignMap() {
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
  } else {
    bounds.extend(new google.maps.LatLng(cornerCoords.cornerOne.latitude, cornerCoords.cornerOne.longitude));
    bounds.extend(new google.maps.LatLng(cornerCoords.cornerTwo.latitude, cornerCoords.cornerTwo.longitude));

    map.fitBounds(bounds);
    centerPos = bounds.getCenter();
  }

  map.setCenter(centerPos);
  toggleMapLabels();
}

function setMap(collections) {
  for (const collection of collections) {
    for (const markerName of Object.keys(collection)) {
      collection[markerName].setMap(map);
    }
  }
}

function attachMapListeners(elementId) {
  map.addListener('idle', () => {
    realignMap();
  });

  document.getElementById(elementId).addEventListener('click', (event) => {
    if (map.getZoom() > 10) {
      event.target.classList.add('hide');
    }
  });

  google.maps.event.addListener(markerClusterer, 'clusterclick', (cluster) => {
    if (map.getZoom() > 10) {
      for (const marker of cluster.getMarkers()) {
        marker.setMap(map);
      }
    }
  });
}

function createMarkerClusterer() {
  markerClusterer = new MarkerClusterer(map, Object.keys(mapMarkers).map((key) => mapMarkers[key]), {
    gridSize: 12,
    maxZoom: 15,
    zoomOnClick: false,
    styles: [{
      width: 26,
      height: 26,
      iconAnchor: [13, 13],
      textSize: 12,
      url: 'images/m.png',
    }],
  });
}

function createMap(params) {
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
}

function setMapView(view) {
  mapView = view;
}

function resetClusters() {
  markerClusterer.resetViewport();
}

function getMap() {
  return map;
}

function setMapCenter(position) {
  if (map) {
    map.setCenter(new google.maps.LatLng(parseFloat(position.latitude), parseFloat(position.longitude)));
  }
}

function setCornerCoords(cornerOneCoords, cornerTwoCoords) {
  cornerCoords.cornerOne = cornerOneCoords;
  cornerCoords.cornerTwo = cornerTwoCoords;
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
