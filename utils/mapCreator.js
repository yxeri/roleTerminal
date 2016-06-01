'use strict';

const appConfig = require('../config/defaults/config').app;
const request = require('request');
const xml2json = require('xml2json');

function convertToJson(xml) {
  return JSON.parse(xml2json.toJson(xml));
}

function parseCoords(string) {
  return string.replace(/0\.0 |0\.0/g, '').replace(/,$/g, '').split(',');
}

function createCoordsCollection(coords) {
  const coordsCollection = [];

  for (let i = 0; i < coords.length; i += 2) {
    coordsCollection.push({
      lat: parseFloat(coords[i + 1]),
      lng: parseFloat(coords[i]),
    });
  }

  return coordsCollection;
}

function createPosition(placemark) {
  const position = {};
  let geometry = '';

  if (placemark.Polygon) {
    position.coordsCollection = createCoordsCollection(parseCoords(placemark.Polygon.outerBoundaryIs.LinearRing.coordinates));
    geometry = 'polygon';
  } else if (placemark.LineString) {
    position.coordsCollection = createCoordsCollection(parseCoords(placemark.LineString.coordinates));
    geometry = 'line';
  } else if (placemark.Point) {
    position.latitude = placemark.Point.coordinates.split(',')[1];
    position.longitude = placemark.Point.coordinates.split(',')[0];
    geometry = 'point';
  }

  return {
    positionName: placemark.name,
    position,
    isStatic: true,
    type: 'world',
    geometry,
  };
}

function getGooglePositions(callback) {
  request.get(appConfig.mapLayersPath, (err, response, body) => {
    if (err || response.statusCode !== 200) {
      callback(err || true);

      return;
    }

    const positions = [];
    const layers = convertToJson(body).kml.Document.Folder;

    for (const layerKey of Object.keys(layers)) {
      const layer = layers[layerKey];

      // Placemark can be either an object or an array with objects
      if (layer.Placemark) {
        if (layer.Placemark.length > 0) {
          for (let i = 0; i < layer.Placemark.length; i++) {
            positions.push(createPosition(layer.Placemark[i]));
          }
        } else {
          positions.push(createPosition(layer.Placemark));
        }
      }
    }

    callback(err, positions);
  });
}

exports.getGooglePositions = getGooglePositions;
