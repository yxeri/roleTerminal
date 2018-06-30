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
    choosableStyles = [],
    zIndex = 4,
    alwaysShowLabel = false,
    shouldCluster = true,
    styles = {
      icon: {},
    },
  }) {
    const { coordinatesHistory } = position;
    const latestCoordinates = coordinatesHistory[coordinatesHistory.length - 1];
    const markerStyles = styles;
    let chosenStyle = {};

    if (position.styleName) {
      chosenStyle = choosableStyles.find(style => style.styleName === position.styleName);

      chosenStyle.icon = chosenStyle.icon ||
    } else {
      chosenStyle = { icon: {} };
    }

    super({
      choosableStyles,
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
        opacity: chosenStyle.opacity || styles.opacity || 1,
        position: {
          lat: latestCoordinates.latitude,
          lng: latestCoordinates.longitude,
        },
        icon: {
          url: chosenStyle.icon.url || markerStyles.icon.url || '/images/mapicon.png',
          size: chosenStyle.icon.size || markerStyles.icon.size || new google.maps.Size(14, 14),
          origin: chosenStyle.icon.origin || markerStyles.icon.origin || new google.maps.Point(0, 0),
          anchor: chosenStyle.icon.anchor || markerStyles.icon.anchor || new google.maps.Point(7, 7),
        },
      }),
    });

    this.accuracyCircle = new MapCircle({
      position,
      radius: latestCoordinates.accuracy,
    });
  }

  changeStyle({ styleName, style }) {
    const {
      icon,
    } = style;
    const options = {};

    if (icon) { options.icon = icon; }

    super.changeStyle({ styleName, style: options });
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
