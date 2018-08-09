/*
 Copyright 2018 Carmilla Mina Jankovic
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
class MapCircle extends MapObject {
  constructor({
    position,
    clickFuncs,
    pulseOptions,
    zIndex = 4,
    radius = 10,
    styles = {},
    alwaysShowLabel = false,
    shouldCluster = false,
  }) {
    const { coordinatesHistory } = position;
    const latestCoordinates = coordinatesHistory[coordinatesHistory.length - 1];

    super({
      alwaysShowLabel,
      shouldCluster,
      position,
      clickFuncs,
      dragEndFunc: () => {
        this.currentCoordinates({
          coordinates: {
            latitude: this.mapObject.getCenter().lat(),
            longitude: this.mapObject.getCenter().lng(),
          },
        });
      },
      mapObject: new google.maps.Circle({
        radius,
        zIndex,
        center: new google.maps.LatLng(latestCoordinates.latitude, latestCoordinates.longitude),
        strokeColor: styles.strokeColor || '#FFFFFF',
        strokeOpacity: styles.strokeOpacity || 0.5,
        strokeWeight: styles.strokeWeight || 2,
        fillColor: styles.fillColor || '#000000',
        fillOpacity: styles.fillOpacity || 0.15,
      }),
    });

    this.shouldPulse = true;
    this.startRadius = radius;

    /**
     * Animation the circle by increasing or descreasing the radius of it.
     */
    function pulse() {
      const currentRadius = this.mapObject.getRadius();
      const maxRadiusPercentage = pulseOptions.maxRadiusPercentage || this.startRadius * 1.2;

      if (currentRadius < maxRadiusPercentage || currentRadius <= this.startRadius) {
        this.mapObject.setRadius(currentRadius + 1);
      } else {
        this.mapObject.setRadius(currentRadius - 1);
      }

      if (this.shouldPulse) {
        setTimeout(pulse, 20);
      } else {
        this.mapObject.setRadius(this.startRadius);
      }
    }

    if (pulseOptions) {
      setTimeout(pulse, 20);
    }
  }

  getCenter() {
    return this.mapObject.getCenter();
  }

  setCurrentCoordinates({ coordinates }) {
    super.setCurrentCoordinates({ coordinates });

    this.mapObject.setCenter(new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
  }
}

module.exports = MapCircle;
