'use strict';

const appConfig = require('../config/defaults/config').app;
const request = require('request');
const xml2json = require('xml2json');

function convertToJson(xml) {
  return JSON.parse(xml2json.toJson(xml));
}

function createPosition(placemark) {
  const position = {};

  if (placemark.Polygon) {
    const coords = placemark.Polygon.outerBoundaryIs.LinearRing.coordinates.replace(/0\.0 |0\.0/g, '').replace(/,$/g, '').split(',');
    const polygon = [];

    for (let pol = 0; pol < coords.length; pol += 2) {
      polygon.push({
        lat: parseFloat(coords[pol + 1]),
        lng: parseFloat(coords[pol]),
      });
    }

    position.polygon = polygon;
  } else if (placemark.Point) {
    position.latitude = placemark.Point.coordinates.split(',')[1];
    position.longitude = placemark.Point.coordinates.split(',')[0];
  }

  return {
    positionName: placemark.name,
    position,
    isStatic: true,
    type: 'world',
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
