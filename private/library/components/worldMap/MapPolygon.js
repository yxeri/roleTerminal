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
class MapPolygon extends MapObject {
  constructor({
    position,
    clickFuncs,
    labelStyle,
    choosableStyles,
    triggeredStyles,
    zIndex = 3,
    descriptionOnClick,
    markedStyle = {
      strokeColor: '#009100',
      fillColor: '#009100',
      styleName: 'Marked',
    },
    alwaysShowLabel = false,
    shouldCluster = false,
    styles = {},
  }) {
    const { coordinatesHistory } = position;
    const latestCoordinates = coordinatesHistory[coordinatesHistory.length - 1];
    const allPoints = [new google.maps.LatLng(latestCoordinates.latitude, latestCoordinates.longitude)]
      .concat(latestCoordinates.extraCoordinates.map(coords => new google.maps.LatLng(coords.latitude, coords.longitude)));
    const chosenStyle = choosableStyles && position.styleName
      ? choosableStyles.find(style => style.styleName === position.styleName)
      : {};
    const style = {
      opacity: chosenStyle.opacity || styles.opacity || 1,
      strokeColor: chosenStyle.strokeColor || styles.strokeColor || '#000000',
      strokeOpacity: chosenStyle.strokeOpacity || styles.strokeOpacity || 0.8,
      strokeWeight: chosenStyle.strokeWeight || styles.strokeWeight || 1,
      fillColor: chosenStyle.fillColor || styles.fillColor || '#000000',
      fillOpacity: chosenStyle.fillOpacity || styles.fillOpacity || 0.35,
    };
    const options = Object.assign({
      zIndex,
      paths: new google.maps.MVCArray(allPoints),
    }, style);

    super({
      choosableStyles,
      descriptionOnClick,
      alwaysShowLabel,
      shouldCluster,
      position,
      clickFuncs,
      labelStyle,
      triggeredStyles,
      markedStyle,
      style,
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
      mapObject: new google.maps.Polygon(options),
    });
  }

  changeStyle({
    styleName,
    style,
    setCurrentStyle,
    shouldEmit,
  }) {
    const {
      strokeColor,
      strokeOpacity,
      strokeWeight,
      fillColor,
      fillOpacity,
      opacity,
    } = style;
    const options = {};

    if (strokeColor) { options.strokeColor = strokeColor; }
    if (strokeOpacity) { options.strokeOpacity = strokeOpacity; }
    if (strokeWeight) { options.strokeWeight = strokeWeight; }
    if (fillColor) { options.fillColor = fillColor; }
    if (fillOpacity) { options.fillOpacity = fillOpacity; }
    if (opacity) { options.opacity = opacity; }

    super.changeStyle({
      styleName,
      shouldEmit,
      setCurrentStyle,
      style: options,
    });
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
