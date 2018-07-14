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

class MouseHandler {
  constructor() {
    this.longClick = false;
    this.touchTimeout = 500;
    this.allowRightClick = false;

    window.addEventListener('touchmove', () => {
      this.longClick = false;
    });

    window.addEventListener('contextmenu', (event) => {
      if (!this.allowRightClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  /**
   * Add a left and/or right click listener to the element. Right clicks on touch devices are simulated by holding the touch down for a set amount of time.
   * @param {Object} params - Parameters.
   * @param {HTMLElement} params.element - Element to add the listeners to.
   * @param {Function} [params.leftFunc] - Function that will be called on a left click.
   * @param {Function} [params.right] - Function that will be called on a right click
   */
  addClickListener({
    element,
    leftFunc,
    right,
  }) {
    if (leftFunc) {
      element.addEventListener('click', leftFunc);
    }

    if (right) {
      element.addEventListener('contextmenu', (event) => {
        this.longClick = false;

        right();

        event.preventDefault();
        event.stopPropagation();
      });

      element.addEventListener('mousedown', () => {
        this.longClick = true;

        setTimeout(() => {
          if (this.longClick) {
            right();
          }
        }, this.touchTimeout);
      });

      element.addEventListener('mouseup', () => {
        this.longClick = false;
      });
    }
  }

  addGMapsClickListener({
    element,
    leftFunc,
    right,
  }) {
    if (leftFunc) {
      google.maps.event.addListener(element, 'click', leftFunc);
    }

    if (right) {
      google.maps.event.addListener(element, 'rightclick', (event) => {
        this.longClick = false;

        right(event);
      });

      google.maps.event.addListener(element, 'mousedown', (event) => {
        this.longClick = true;

        setTimeout(() => {
          if (this.longClick) {
            right(event);
          }
        }, this.touchTimeout);
      });

      google.maps.event.addListener(element, 'mouseup', () => {
        this.longClick = false;
      });

      google.maps.event.addListener(element, 'drag', () => {
        this.longClick = false;
      });
    }
  }

  setAllowRightClick(allowRightClick) {
    this.allowRightClick = allowRightClick;
  }
}

const mouseHandler = new MouseHandler();

module.exports = mouseHandler;
