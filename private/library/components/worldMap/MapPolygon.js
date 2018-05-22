/*
 Copyright 2018 Aleksandar Jankovic
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

const MapObject = require('./MapObject');

/**
 * Requires Google maps library
 */
class MapPolygon extends MapObject {
  constructor({
    position,
    clickFuncs,
    alwaysShowLabel = false,
    shouldCluster = true,
    styles = {},
  }) {
    const { coordinatesHistory } = position;
    const latestCoordinates = coordinatesHistory[coordinatesHistory.length - 1];
    const allPoints = [new google.maps.LatLng(latestCoordinates.latitude, latestCoordinates.longitude)]
      .concat(latestCoordinates.extraCoordinates.map(coords => new google.maps.LatLng(coords.latitude, coords.longitude)));

    super({
      alwaysShowLabel,
      shouldCluster,
      position,
      clickFuncs,
      // TODO Combine with MapLine
      dragEndFunc: () => {
        const extraCoordinates = this.mapObject.getPath().getArray();
        const firstCoordinates = extraCoordinates.shift();

        this.setCurrentCoordinates({
          coordinates: {
            longitude: firstCoordinates.lng(),
            latitude: firstCoordinates.lat(),
            extraCoordinates: extraCoordinates.map((coordinates) => {
              return {
                latitude: coordinates.lat(),
                longitude: coordinates.lng(),
              };
            }),
          },
        });
      },
      mapObject: new google.maps.Polygon({
        paths: new google.maps.MVCArray(allPoints),
        opacity: styles.opacity || 1,
        strokeColor: styles.strokeColor || '#000000',
        strokeOpacity: styles.strokeOpacity || 0.8,
        strokeWeight: styles.strokeWeight || 3,
        fillColor: styles.fillColor || '#000000',
        fillOpacity: styles.fillOpacity || 0.35,
      }),
    });

    this.mapObject.getPath().forEach((data) => { console.log('data', data); });
  }

  // TODO Combine with MapLine
  setCurrentCoordinates({ coordinates }) {
    const allPoints = [new google.maps.LatLng(coordinates.latitude, coordinates.longitude)]
      .concat(coordinates.extraCoordinates.map(coords => new google.maps.LatLng(coords.latitude, coords.longitude)));

    super.setCurrentCoordinates({ coordinates });

    this.mapObject.setPath(new google.maps.MVCArray(allPoints));
  }
}

module.exports = MapPolygon;
