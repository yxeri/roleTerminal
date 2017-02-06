/*
 Copyright 2017 Aleksandar Jankovic

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

class ViewTools {
  /**
   * Is the element inside the view or close to the end of the view?
   * @static
   * @param {HTMLElement} element - The element that will be checked
   * @param {number} [newElementHeight] - Value will be added to check if an element is close to the edge
   * @returns {boolean} - Is the element in view or close to the edge?
   */
  static isCloseToEnd(element, newElementHeight) {
    const elementBottom = element.getBoundingClientRect().bottom;

    return elementBottom <= window.innerHeight + 100 + (newElementHeight || 0);
  }

  /**
   * Goes into full screen
   * This is not supported in iOS Safari
   * @static
   */
  static goFullScreen() {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }

  /**
   * Is the view wider than the height?
   * @static
   * @returns {boolean} Is the view wider than the height?
   */
  static isLandscape() {
    return window.innerWidth > window.innerHeight;
  }
}

module.exports = ViewTools;
