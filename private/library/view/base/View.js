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

const eventCentral = require('../../EventCentral');
const keyHandler = require('../../KeyHandler');
const storageManager = require('../../StorageManager');

class View {
  constructor({ isFullscreen, viewId, elementType, closeFunc }) {
    const element = document.createElement(elementType || 'DIV');

    if (isFullscreen) { element.classList.add('fullscreen'); }
    if (viewId) { element.setAttribute('id', viewId); }

    this.element = element;
    this.accessElements = [];
    this.keyTriggers = [];
    this.closeFunc = closeFunc;

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.ACCESS,
      func: ({ accessLevel }) => {
        this.toggleAccessElements(accessLevel);
      } });
  }

  hideView() { this.element.classList.add('hide'); }

  showView() { this.element.classList.remove('hide'); }

  goFullscreen() { this.element.classList.add('fullscreen'); }

  goWindowed() { this.element.classList.remove('fullscreen'); }

  appendTo(parentElement) { parentElement.appendChild(this.element); }

  removeView() {
    if (this.closeFunc) {
      this.closeFunc();
    }

    this.element.parentNode.removeChild(this.element);
  }

  toggleAccessElements(accessLevel) {
    this.accessElements.forEach((accessElement) => {
      if ((isNaN(accessElement.maxAccessLevel) || accessLevel <= accessElement.maxAccessLevel) && accessLevel >= accessElement.accessLevel) {
        accessElement.element.classList.remove('hide');
      } else {
        accessElement.element.classList.add('hide');
      }
    });
  }

  addKeyTrigger(keyTrigger) {
    const userAccessLevel = storageManager.getAccessLevel();

    this.keyTriggers.push(keyTrigger);

    if ((!keyTrigger.accessLevel || keyTrigger.accessLevel <= userAccessLevel) && (!keyTrigger.maxAccessLevel || keyTrigger.maxAccessLevel >= userAccessLevel)) {
      keyHandler.addKey(keyTrigger.charCode, keyTrigger.func, keyTrigger.triggerless);
    }
  }

  enableKeyTriggers() {
    const userAccessLevel = storageManager.getAccessLevel();

    this.keyTriggers.forEach(({ charCode, func, accessLevel, maxAccessLevel, triggerless }) => {
      if ((!accessLevel || accessLevel <= userAccessLevel) && (!maxAccessLevel || maxAccessLevel >= userAccessLevel)) {
        keyHandler.addKey(charCode, func, triggerless);
      }
    });
  }

  disableKeyTriggers() {
    this.keyTriggers.forEach(({ charCode }) => keyHandler.removeKey(charCode));
  }

  clearView() {
    this.element.innerHTML = '';
  }
}

module.exports = View;
