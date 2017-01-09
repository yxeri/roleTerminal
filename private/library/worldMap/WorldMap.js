// /*
//  Copyright 2015 Aleksandar Jankovic
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  */
//
// const Label = require('./Label');
//
// /**
//  * Uses and requires Google maps library
//  */
// class WorldMap {
//   /**
//    * @param {{longitude:number, latitude:number}} params.centerCoordinates
//    * @param {{topLeft:{latitude:number, longitude:number},bottomRight:{latitude:number, longitude:number}}} params.cornerCoordinates
//    * @param {Object} params.htmlElement
//    * @param {number} [params.minZoom]
//    * @param {number} [params.zoomLevel]
//    * @param {number} [params.maxZoom]
//    * @param {number} [params.maxShortDescLength]
//    * @param {string} [params.backgroundColor]
//    */
//   constructor({ centerCoordinates, cornerCoordinates, zoomLevel, htmlElement, minZoom, maxZoom, maxShortDescLength, backgroundColor }) {
//     // Will stop if external files have not finished loading
//     if (typeof google === 'undefined' || typeof MarkerClusterer === 'undefined' || typeof MapLabel === 'undefined') {
//       throw new Error();
//     }
//
//     this.MapViewEnum = {
//       NONE: 1,
//       ME: 2,
//       CLUSTER: 3,
//       ALL: 4,
//       GAMEAREA: 5,
//     };
//     this.markers = new Map();
//     this.lines = new Map();
//     this.labels = new Map();
//     this.cornerCoordinates = cornerCoordinates;
//     this.mapView = this.MapViewEnum.GAMEAREA;
//     this.maxShortDescLength = maxShortDescLength || 200;
//     this.map = new google.maps.Map(htmlElement, {
//       center: {
//         lat: centerCoordinates.latitude || 0,
//         lng: centerCoordinates.longitude || 0,
//       },
//       zoom: zoomLevel || 0,
//       disableDefaultUI: true,
//       fullscreenControl: false,
//       keyboardShortcuts: false,
//       mapTypeControl: false,
//       noClear: true,
//       zoomControl: false,
//       panControl: false,
//       overviewMapControl: false,
//       rotateControl: false,
//       scaleControl: false,
//       streetViewControl: false,
//       backgroundColor: backgroundColor || '#001e15',
//       minZoom: minZoom || 3,
//       maxZoom: maxZoom || 19,
//       styles: [
//         {
//           featureType: 'all',
//           elementType: 'all',
//           stylers: [
//             { color: '#001e15' },
//           ],
//         }, {
//           featureType: 'road',
//           elementType: 'geometry',
//           stylers: [
//             { color: '#00cca3' },
//           ],
//         }, {
//           featureType: 'road',
//           elementType: 'labels',
//           stylers: [
//             { visibility: 'off' },
//           ],
//         }, {
//           featureType: 'poi',
//           elementType: 'all',
//           stylers: [
//             { visibility: 'off' },
//           ],
//         }, {
//           featureType: 'administrative',
//           elementType: 'all',
//           stylers: [
//             { visibility: 'off' },
//           ],
//         }, {
//           featureType: 'water',
//           elementType: 'all',
//           stylers: [
//             { color: '#00cca3' },
//           ],
//         },
//       ],
//     });
//   }
//
//   /**
//    * Sets new map view. Affects how the map is realigned and shown
//    * @param {number} view - Type of map view
//    */
//   set mapView(view) {
//     this.mapView = view;
//   }
//
//   /**
//    * Creates a map marker, adds it to the map and calls the creation of a label (if flag is set)
//    * @param {Object} params - Parameters
//    * @param {string} params.markerName - Name of the map marker
//    * @param {string} params.title - Title of the marker description
//    * @param {string} params.markerType - Type of the marker
//    * @param {number} params.opacity - Opacity of the marker in the view
//    * @param {boolean} params.hideLabel - Should the label be hidden in the view?
//    * @param {boolean} params.ignoreCluster - Should the marker be excluded from clusters?
//    * @param {string} params.iconUrl - Path to a custom icon image
//    * @param {{longitude: Number, latitude: Number}} params.position - Long and lat coordinates of the map marker
//    * @param {string} params.description - Description for map marker, which will be shown on click or command
//    */
//   createMarker({ markerName, position, iconUrl, description, title, markerType, opacity, hideLabel, ignoreCluster }) {
//     const icon = {
//       url: iconUrl || '/images/mapicon.png',
//       size: new google.maps.Size(16, 16),
//       origin: new google.maps.Point(0, 0),
//       anchor: new google.maps.Point(8, 8),
//     };
//     const snakeCaseTitle = title.replace(/\s/g, '_');
//     const markerId = this.markers.size + 1;
//     const marker = {
//       marker: new google.maps.Marker({
//         position: {
//           lat: position.latitude,
//           lng: position.longitude,
//         },
//         opacity: opacity || 0.9,
//         icon,
//         map: this.map,
//       }),
//       addedTitle: title,
//       markerId: markerId,
//       markerType: markerType,
//     };
//
//     if (description) {
//       marker.addedShortDesc = description.length > this.maxShortDescLength ? `${description.slice(0, this.maxShortDescLength)}..` : `${description}`;
//       marker.addedExpandedDesc = description.length > this.maxShortDescLength ? `${description.slice(this.maxShortDescLength)}` : undefined;
//     }
//
//     if (!hideLabel) {
//       this.labels.set(title, new Label({
//         positionName: title,
//         labelText: snakeCaseTitle.length > 18 ? `${markerId}:${snakeCaseTitle.slice(0, 18)}..` : `${markerId}:${snakeCaseTitle}`,
//         position,
//       }));
//     }
//
//     if (!ignoreCluster && markerClusterer) {
//       markerClusterer.addMarker(mapMarkers[markerName]);
//     }
//
//     google.maps.event.addListener(marker, 'click', () => {
//       const projection = overlay.getProjection();
//       const xy = projection.fromLatLngToContainerPixel(marker.getPosition());
//
//       // TODO Create marker info window
//       console.log(xy);
//     });
//
//     this.markers.set(markerName, marker);
//   }
//
//   /**
//    * Sets new position for a map marker
//    * Creates a new map marker if it doesn't exist
//    * @param {Object} params - Parameters
//    * @param {string} params.positionName - Name of the map marker
//    * @param {{latitude: Number, longitude: Number}} params.position - Latitude and longitude coordinates for the map marker
//    * @param {string} params.description - Description for map marker, which will be shown on click or command
//    * @param {string} params.markerType - Type of marker
//    * @param {Date} [params.lastUpdated] - Time of last update
//    * @param {boolean} [params.hideLabel] - Should the label be hidden?
//    * @param {string} [params.iconUrl] - Path to custom map marker icon
//    */
//   setMarkerPosition({ positionName, position, lastUpdated, markerType, description, hideLabel, iconUrl }) {
//     const lowerMarkerName = positionName.toLowerCase();
//     const marker = mapMarkers[lowerMarkerName];
//
//     if (marker) {
//       marker.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
//       marker.lastUpdated = lastUpdated;
//     } else {
//       this.createMarker({
//         lastUpdated,
//         position,
//         hideLabel,
//         iconUrl,
//         description,
//         markerType,
//         markerName: lowerMarkerName,
//         title: positionName,
//       });
//     }
//   }
//
//   /**
//    * Creates a polygon and adds it to the map
//    * @param {Object} params - Parameters
//    * @param {string} params.positionName - Name of the polygon
//    * @param {Object[]} params.coordsCollection - Collection of x and y coordinates of the polygon
//    * @param {boolean} [params.hideLabel] - Should the label be hidden?
//    */
//   createPolygon({ positionName, coordsCollection, hideLabel }) {
//     mapPolygons[positionName] = new google.maps.Polygon({
//       paths: coordsCollection,
//       strokeColor: '#008766',
//       strokeOpacity: 0.9,
//       strokeWeight: 2,
//       fillColor: '#00ffcc',
//       fillOpacity: 0.35,
//     });
//
//     if (!hideLabel) {
//       // TODO Should center the label inside the polygon
//       createLabel({
//         positionName,
//         labelText: positionName,
//         position: getPolygonCenter(coordsCollection),
//         align: 'center',
//       });
//     }
//
//     mapPolygons[positionName].setMap(map || null);
//   }
//
//   /**
//    * Sets new positions of the polygon
//    * Creates a new polygon if one with the sent name doesn't exist
//    * @param {Object} params - Parameters
//    * @param {string} params.positionName - Name of the polygon
//    * @param {Object[]} params.coordsCollection - Collection of x and y coordinates of the polygon
//    */
//   setPolygonPosition({ positionName, coordsCollection }) {
//     if (mapPolygons[positionName]) {
//       mapPolygons[positionName].setPaths(coordsCollection);
//     } else {
//       createPolygon({
//         coordsCollection,
//         positionName,
//       });
//     }
//   }
//
//   /**
//    * Creates a line and adds it to the map
//    * The line can have multiple points
//    * @param {Object} params - Parameters
//    * @param {string} params.positionName - Name of the line
//    * @param {Object[]} params.coordsCollection - Collection of Long and lat coordinates of the line
//    */
//   createLine({ positionName, coordsCollection }) {
//     mapLines[positionName] = new google.maps.Polyline({
//       path: coordsCollection,
//       strokeColor: '#008766',
//       strokeOpacity: 1.0,
//       strokeWeight: 2,
//     });
//
//     mapLines[positionName].setMap(map || null);
//   }
//
//   /**
//    * Sets new positions for the line
//    * Creates a new line if a line with the sent name doesn't exist
//    * @param {Object} params - Parameters
//    * @param {string} params.positionName - Name of the line
//    * @param {Object[]} params.coordsCollection - Collection of long and lat coordinates for the line
//    */
//   setLinePosition({ positionName, coordsCollection }) {
//     if (mapLines[positionName]) {
//       mapLines[positionName].setPath(coordsCollection);
//     } else {
//       createLine({
//         positionName,
//         coordsCollection,
//       });
//     }
//   }
//
//   /**
//    * @returns {string} - Returns string representing the type of map view
//    */
//   get mapView() {
//     return this.mapView;
//   }
//
//   /**
//    * @returns {Object} - Returns map marker representing this user
//    */
//   getThisUserMarker() {
//     return this.mapMarkers.I;
//   }
//
//   /**
//    * Creates the map marker representing this user
//    * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
//    */
//   createThisUserMarker(position) {
//     this.createMarker({
//       markerName: 'I',
//       position,
//       title: 'You',
//       iconUrl: '/images/mapiconyou.png',
//       hideLabel: true,
//     });
//   }
//
//   /**
//    * Sets new position to the user's map marker
//    * Creates a new map marker if it doesn't exist
//    * @param {{longitude: Number, latitude:Number}} position - Long and lat coordinates of the map marker
//    */
//   setUserPosition(position) {
//     if (mapMarkers.I) {
//       mapMarkers.I.setPosition(new google.maps.LatLng(position.latitude, position.longitude));
//     } else {
//       createThisUserMarker(position);
//     }
//   }
//
//   /**
//    * Resets map on all labels, in case any of the connected markers are no longer on the map
//    */
//   toggleMapLabels() {
//     const markerKeys = Object.keys(mapMarkers);
//
//     for (let i = 0; i < markerKeys.length; i += 1) {
//       const markerName = markerKeys[i];
//
//       if (mapLabels[markerName] && mapLabels[markerName].getMap() !== mapMarkers[markerName].getMap()) {
//         mapLabels[markerName].setMap(mapMarkers[markerName].getMap());
//       }
//     }
//   }
//
//   /**
//    * Creates new bounds and re-centers the map based on the map view
//    * @param {Object[]} markers - worldMap markers used to create bounds if map view is "cluster"
//    */
//   realignMap(markers) {
//     const bounds = new google.maps.LatLngBounds();
//     let centerPos = map.getCenter();
//
//     google.maps.event.trigger(map, 'resize');
//
//     if (mapView === 'overview') {
//       const markerKeys = Object.keys(mapMarkers);
//
//       for (let i = 0; i < markerKeys.length; i += 1) {
//         const marker = markerKeys[i];
//
//         bounds.extend(mapMarkers[marker].getPosition());
//       }
//
//       map.fitBounds(bounds);
//       centerPos = bounds.getCenter();
//     } else if (mapView === 'me' && mapMarkers.I) {
//       centerPos = mapMarkers.I.getPosition();
//       map.setZoom(18);
//     } else if (mapView === 'cluster') {
//       if (markers) {
//         for (let i = 0; i < markers.length; i += 1) {
//           const marker = markers[i];
//
//           bounds.extend(marker.getPosition());
//         }
//
//         map.fitBounds(bounds);
//         centerPos = bounds.getCenter();
//       }
//     } else if (mapView === 'area') {
//       bounds.extend(new google.maps.LatLng(cornerCoords.cornerOne.latitude, cornerCoords.cornerOne.longitude));
//       bounds.extend(new google.maps.LatLng(cornerCoords.cornerTwo.latitude, cornerCoords.cornerTwo.longitude));
//
//       map.fitBounds(bounds);
//       centerPos = bounds.getCenter();
//     } else if (mapMarkers[mapView]) {
//       bounds.extend(mapMarkers[mapView].getPosition());
//
//       map.fitBounds(bounds);
//       centerPos = bounds.getCenter();
//     }
//
//     map.setCenter(centerPos);
//     // TODO Hide marker info window
//   }
//
//   /**
//    * Set map to current map on all objects in the collection
//    * @param {Object} collections - Collection of objects to be attached to the map
//    */
//   setMap(collections) {
//     for (let i = 0; i < collections.length; i += 1) {
//       const collection = collections[i];
//       const collectionKeys = Object.keys(collection);
//
//       for (let j = 0; j < collectionKeys.length; j += 1) {
//         collection[collectionKeys[j]].setMap(map);
//       }
//     }
//   }
//
//   /**
//    * Add listeners to map
//    */
//   attachMapListeners() {
//     google.maps.event.addListener(markerClusterer, 'clusterclick', (cluster) => {
//       const bounds = new google.maps.LatLngBounds();
//       const markers = cluster.getMarkers();
//
//       for (let i = 0; i < markers.length; i += 1) {
//         bounds.extend(markers[i].getPosition());
//       }
//
//       setMapView('cluster');
//       realignMap(cluster.getMarkers());
//     });
//
//     google.maps.event.addListener(map, 'click', () => {
//       // TODO Hide marker info window
//     });
//
//     google.maps.event.addListener(map, 'dragstart', () => {
//       // TODO Hide marker info window
//     });
//
//     google.maps.event.addListener(map, 'zoom_changed', () => {
//       // TODO Hide marker info window
//     });
//
//     google.maps.event.addListener(map, 'idle', () => {
//       toggleMapLabels();
//     });
//   }
//
//   /**
//    * Create map clusterer and add all map markers to it
//    */
//   createMarkerClusterer() {
//     markerClusterer = new MarkerClusterer(map, Object.keys(mapMarkers).map(key => mapMarkers[key]), {
//       gridSize: 24,
//       maxZoom: 17,
//       zoomOnClick: false,
//       singleSize: true,
//       averageCenter: true,
//       styles: [{
//         width: 22,
//         height: 22,
//         iconAnchor: [11, 11],
//         textSize: 11,
//         url: 'images/m.png',
//       }],
//     });
//   }
//
//   /**
//    * Create map, sets this map on all polygons, markers, lines, creates map clusterer and attaches listeners
//    * @param {Object} params - Parameters
//    * @param {Object} params.centerCoordinates - Long and lat coordinates
//    * @param {Number} params.centerCoordinates.latitude - Center latitude for the map
//    * @param {Number} params.centerCoordinates.longitude - Center longitude for the map
//    * @param {Number} params.zoomLevel - Default zoom level
//    * @param {string} params.elementId - Id of map element
//    */
//   createMap(params) {
//     const elementId = params.elementId;
//
//     map =
//
//     setMap([mapMarkers, mapPolygons, mapLines, mapLabels]);
//     createMarkerClusterer();
//     attachMapListeners(elementId);
//
//     /**
//      * Overlay is used to catch mouse clicks and easily retrieve x and y instead of lot and lang coordinates
//      */
//     overlay = new google.maps.OverlayView();
//     overlay.draw = () => {};
//     overlay.setMap(map);
//   }
//
//   /**
//    * Reset view port, which recreates all clusters
//    */
//   resetClusters() {
//     markerClusterer.resetViewport();
//   }
//
//   /**
//    * @static
//    * @returns {google.maps.Map} - worldMap
//    */
//   getMap() {
//     return map;
//   }
//
//   /**
//    * @static
//    * @param {{latitude: Number, longitude: Number}} position - Long and lat coordinates for the new map center
//    */
//   setMapCenter(position) {
//     if (map) {
//       map.setCenter(new google.maps.LatLng(parseFloat(position.latitude), parseFloat(position.longitude)));
//     }
//   }
//
//   /**
//    * Set corner coordinates of the bounds for the map
//    * @param {{longitude: Number, latitude: Number}} cornerOneCoords - Corner lat and long coordinates
//    * @param {{longitude: Number, latitude: Number}} cornerTwoCoords - Corner lat and long coordinates
//    */
//   setCornerCoords(cornerOneCoords, cornerTwoCoords) {
//     cornerCoords.cornerOne = cornerOneCoords;
//     cornerCoords.cornerTwo = cornerTwoCoords;
//   }
//
//   /**
//    * Increase the zoom level of the map by 1
//    */
//   increaseZoom() {
//     mapView = '';
//     map.setZoom(map.getZoom() + 1);
//   }
//
//   /**
//    * Decrease the zoom level of the map by 1
//    */
//   decreaseZoom() {
//     mapView = '';
//     map.setZoom(map.getZoom() - 1);
//   }
//
//   /**
//    * Get description from the map marker
//    * @static
//    * @param {Number} markerId - ID of the map marker
//    * @returns {{title: string, description: string}} - Title and escription of the map marker
//    */
//   getInfoText(markerId) {
//     const marker = mapMarkers[Object.keys(mapMarkers).find(markerName => mapMarkers[markerName].markerId === parseInt(markerId, 10))];
//
//     if (!marker) {
//       return null;
//     }
//
//     let description = marker.addedShortDesc;
//
//     if (marker.addedExpandedDesc) {
//       description = marker.addedShortDesc.slice(0, marker.addedShortDesc.length - 2) + marker.addedExpandedDesc;
//     }
//
//     return { title: marker.addedTitle, description };
//   }
//
//   /**
//    * Called on mapPositions emit. Adds new map positions
//    * @param {Object} params - Parameters
//    * @param {Object[]} params.positions - New map positions
//    * @param {string} [params.team] - Name of the team that the user in the position belongs to. Valid for user positions
//    * @param {Date} [params.currentTime] - Time of update of the positions
//    */
//   onMapPositions(params) {
//     const mapPositions = params.positions || [];
//     const team = params.team;
//     // TODO Get name of the user
//     const userName = '';
//
//     for (let i = 0; i < mapPositions.length; i += 1) {
//       const mapPosition = mapPositions[i];
//
//       if (mapPosition.positionName.toLowerCase() !== userName) {
//         const positionName = mapPosition.positionName;
//         const latitude = parseFloat(mapPosition.position.latitude);
//         const longitude = parseFloat(mapPosition.position.longitude);
//         const coordsCollection = mapPosition.position.coordsCollection;
//         const geometry = mapPosition.geometry;
//         const type = mapPosition.type;
//         const group = mapPosition.group;
//         const description = mapPosition.description;
//
//         if (geometry === 'line') {
//           setLinePosition({
//             coordsCollection,
//             positionName,
//           });
//         } else if (geometry === 'polygon') {
//           setPolygonPosition({
//             positionName,
//             coordsCollection,
//           });
//         } else if (geometry === 'point') {
//           setMarkerPosition({
//             positionName,
//             position: {
//               latitude,
//               longitude,
//             },
//             description,
//             markerType: 'location',
//           });
//         } else if (type && type === 'user' && mapPosition.lastUpdated) {
//           const currentTime = new Date(params.currentTime);
//           const lastUpdated = new Date(mapPosition.lastUpdated);
//
//           if (currentTime - lastUpdated < (20 * 60 * 1000)) {
//             // TODO Create time stamp
//             const userDescription = `Team: ${mapPosition.group || '-'}. Last seen: `;
//
//             setMarkerPosition({
//               lastUpdated,
//               positionName,
//               position: {
//                 latitude,
//                 longitude,
//               },
//               iconUrl: team && group && team === group ? 'images/mapiconteam.png' : 'images/mapiconuser.png',
//               hideLabel: true,
//               description: userDescription,
//               markerType: type,
//             });
//           }
//         }
//       }
//     }
//
//     toggleMapLabels();
//   }
// }
//
// module.exports = WorldMap;
