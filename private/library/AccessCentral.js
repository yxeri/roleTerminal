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

const eventCentral = require('./EventCentral');

class AccessCentral {
  constructor() {
    this.accessElements = {};

    eventCentral.addWatcher({
      event: eventCentral.Events.ACCESS_CHANGE,
      func: ({ accessLevel }) => {
        Object.keys(this.accessElements).forEach((level) => {
          const levelElements = this.accessElements[level] || [];

          levelElements.forEach((accessElement) => {
            const {
              minimumAccessLevel,
              maxAccessLevel,
            } = accessElement;

            if (accessLevel >= minimumAccessLevel && accessLevel <= maxAccessLevel) {
              accessElement.element.classList.remove('hide');
            } else {
              accessElement.element.classList.add('hide');
            }
          });
        });
      },
    });
  }

  addAccessElement({
    element,
    minimumAccessLevel = 0,
    maxAccessLevel = 999,
  }) {
    if (!this.accessElements[minimumAccessLevel]) { this.accessElements[minimumAccessLevel] = []; }

    this.accessElements[minimumAccessLevel].push({
      element,
      minimumAccessLevel,
      maxAccessLevel,
    });
  }

  removeAccessElement({
    minimumAccessLevel,
    element,
  }) {
    if (!this.accessElements[minimumAccessLevel]) { this.accessElements[minimumAccessLevel] = []; }

    const levelElements = this.accessElements[minimumAccessLevel];

    levelElements.splice(levelElements.findIndex((accessElement) => {
      return accessElement.element === element;
    }), 1);
  }
}

const accessCentral = new AccessCentral();

module.exports = accessCentral;
