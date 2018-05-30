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

const MapCircle = require('./MapCircle');
const MapObject = require('./MapObject');

/**
 * Requires Google maps library
 */
class MapMarker extends MapObject {
  constructor({
    position,
    clickFuncs,
    labelStyle,
    zIndex = 4,
    icon = {},
    alwaysShowLabel = false,
    shouldCluster = true,
    styles = {},
  }) {
    const { coordinatesHistory } = position;
    const latestCoordinates = coordinatesHistory[coordinatesHistory.length - 1];

    super({
      alwaysShowLabel,
      shouldCluster,
      position,
      clickFuncs,
      labelStyle,
      dragEndFunc: () => {
        this.setCurrentCoordinates({
          coordinates: {
            latitude: this.mapObject.position.lat(),
            longitude: this.mapObject.position.lng(),
          },
        });
      },
      mapObject: new google.maps.Marker({
        zIndex,
        opacity: styles.opacity || 1,
        position: {
          lat: latestCoordinates.latitude,
          lng: latestCoordinates.longitude,
        },
        icon: {
          url: icon.url || '/images/mapicon.png',
          size: icon.size || new google.maps.Size(14, 14),
          origin: icon.origin || new google.maps.Point(0, 0),
          anchor: icon.anchor || new google.maps.Point(7, 7),
        },
      }),
    });

    this.accuracyCircle = new MapCircle({
      position,
      radius: latestCoordinates.accuracy,
    });
  }

  setCurrentCoordinates({ coordinates }) {
    super.setCurrentCoordinates({ coordinates });

    this.mapObject.setPosition(new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
    this.accuracyCircle.setCurrentCoordinates({ coordinates });
  }

  showAccuracy() {
    this.accuracyCircle.showObject();
  }

  hideAccuracy() {
    this.accuracyCircle.hideObject();
  }
}

module.exports = MapMarker;
