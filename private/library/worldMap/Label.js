/*
 Copyright 2016 Aleksandar Jankovic

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
 * Uses and requires Google maps library
 */
class Label {
  /**
   * Creates a label at the location of another object
   * The name of the position will be used as text for the label
   * @param {string} params.positionName - Name of the position that the label is connected to
   * @param {{latitude: number, longitude: number}} params.position - Long and lat coordinates of the label
   * @param {string} params.labelText - Text that will be printed
   * @param {string} [params.align] - Text alignment (left|right)
   * @param {string} [params.fontFamily] - Font family
   * @param {string} [params.fontColor] - Font color
   * @param {string} [params.strokeColor] - Stroke color (around the text)
   * @param {number} [params.fontSize] - Font size
   * @param {WorldMap} [params.worldMap] - WorldMap that the label should be attached to
   */
  constructor({ positionName, position, labelText, align, fontFamily, fontColor, strokeColor, fontSize, worldMap }) {
    this.positionName = positionName.toLowerCase();
    this.worldMap = worldMap || null;
    this.mapLabel = new MapLabel({
      text: labelText,
      position: new google.maps.LatLng(position.latitude, position.longitude),
      align: align || 'right',
      fontFamily: fontFamily || 'GlassTTYVT220',
      fontColor: fontColor || '#00ffcc',
      strokeColor: strokeColor || '#001e15',
      fontSize: fontSize || 12,
      map: worldMap || null,
    });
  }

  set worldMap(map) {
    this.worldMap = map;
    this.mapLabel.setMap(map);
  }

  get worldMap() {
    return this.worldMap;
  }

  hideLabel() {
    this.mapLabel.setMap(null);
    this.worldMap.redraw();
  }

  showLabel() {
    this.mapLabel.setMap(this.worldMap.map);
    this.worldMap.redraw();
  }
}

module.exports = Label;
