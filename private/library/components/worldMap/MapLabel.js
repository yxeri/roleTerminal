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

/**
 * Requires Google maps library
 */
class Label {
  /**
   * Creates a label at the location of another object.
   * The name of the position will be used as text for the label.
   * @param {Object} params Parameters.
   * @param {{latitude: number, longitude: number}} params.coordinates Long and lat coordinates of the label.
   * @param {string} params.text Text that will be printed.
   * @param {string} [params.align] Text alignment (left|right).
   * @param {string} [params.fontFamily] Font family.
   * @param {string} [params.fontColor] Font color.
   * @param {string} [params.strokeColor] Stroke color (around the text).
   * @param {number} [params.fontSize] Font size.
   * @param {WorldMap} [params.map] Map that the label should be attached to.
   */
  constructor({
    coordinates,
    text,
    shouldShowLabel = true,
    labelStyle = {},
    map = null,
  }) {
    this.shouldShowLabel = shouldShowLabel;
    this.mapLabel = new MapLabel({
      map,
      text: `< ${text}`,
      align: labelStyle.align || 'right',
      fontFamily: labelStyle.fontFamily || 'monospace',
      fontColor: labelStyle.fontColor || '#ffffff',
      strokeColor: labelStyle.strokeColor || '#000000',
      fontSize: labelStyle.fontSize || 12,
      position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
    });
  }

  setMap(map) {
    this.mapLabel.setMap(map);
  }

  hideLabel() {
    this.mapLabel.setMap(null);
  }

  showLabel(map) {
    if (this.shouldShowLabel) {
      this.mapLabel.setMap(map);
    }
  }

  setCurrentCoordinates({ coordinates }) {
    this.mapLabel.set('position', new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
  }

  setText({ text }) {
    this.mapLabel.set('text', text);
  }
}

module.exports = Label;
