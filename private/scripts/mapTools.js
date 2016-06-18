'use strict';

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

function setMapView(view) {
  mapView = view;
}

function getPolygonCenter(coordsCollection) {
  const bounds = new google.maps.LatLngBounds();

  for (const coords of coordsCollection) {
    bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
  }

  const center = bounds.getCenter();

  return { latitude: center.lat(), longitude: center.lng() };
}

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

function setMap(collections) {
  for (const collection of collections) {
    for (const markerName of Object.keys(collection)) {
      collection[markerName].setMap(map);
    }
  }
}

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

  overlay = new google.maps.OverlayView();
  overlay.draw = () => {};
  overlay.setMap(map);
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

function increaseZoom() {
  mapView = '';
  map.setZoom(map.getZoom() + 1);
}

function decreaseZoom() {
  mapView = '';
  map.setZoom(map.getZoom() - 1);
}

/**
 * @param {string} markerName
 * @returns {{title: string, description: string}}
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
