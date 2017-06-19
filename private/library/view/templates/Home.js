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

const View = require('../base/View');
const elementCreator = require('../../ElementCreator');
const soundLibrary = require('../../audio/SoundLibrary');
const eventCentral = require('../../EventCentral');

/**
 * Adds [] to show which character is used as the shortcut character
 * @param {string} text Whole string
 * @param {number} index Index of the character
 * @returns {string} String with added [] around one character
 */
function wrapChar(text, index) {
  if (index === 0) {
    return `[${text.charAt(0)}]${text.slice(1)}`;
  }

  return `${text.slice(0, index)}[${text.charAt(index)}]${text.slice(index + 1)}`;
}

class Home extends View {
  constructor({ introText = [] }) {
    super({ isFullscreen: false, viewId: 'home' });

    this.links = [];
    this.previousLink = '';
    this.activeLink = '';
    this.introText = introText;
    this.introDiv = elementCreator.createContainer({
      elementId: 'introText',
    });
    this.element.appendChild(this.introDiv);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.SERVERMODE,
      func: ({ mode }) => {
        if (mode === 'dev') {
          const fragment = document.createDocumentFragment();

          this.introText.forEach((element) => { fragment.appendChild(element); });
          this.introDiv.appendChild(fragment);
        }
      },
    });
  }

  addLink({ linkName, startFunc, endFunc, accessLevel, maxAccessLevel, keepHome, classes, shortcut }) {
    this.links.push({ linkName, startFunc, endFunc });

    const text = linkName.toUpperCase();
    const button = elementCreator.createButton({
      text,
      classes,
      func: () => { this.triggerLink(linkName, keepHome); },
    });

    if (shortcut) {
      const getChar = (stringArray, iteration) => {
        if (stringArray) {
          const charCode = stringArray.shift().charCodeAt(0);

          if (this.keyTriggers.map(keyTrigger => keyTrigger.charCode).indexOf(charCode) > -1) {
            getChar(stringArray, iteration + 1);
          } else {
            this.addKeyTrigger({ accessLevel, maxAccessLevel, charCode, func: () => { this.triggerLink(linkName, keepHome); } });
            button.innerHTML = '';
            button.appendChild(document.createTextNode(wrapChar(text, iteration)));
          }
        }
      };

      getChar(Array.from(text), 0);
    }

    if (!isNaN(accessLevel)) {
      this.accessElements.push({
        accessLevel,
        maxAccessLevel,
        element: button,
      });
    }

    this.element.appendChild(button);
  }

  triggerLink(linkName, keepHome) {
    const foundLink = this.links.find(link => link.linkName === linkName);

    if (this.activeLink !== '') {
      this.endLink(linkName);
    } else {
      this.disableKeyTriggers();
    }

    if (foundLink.startFunc) { foundLink.startFunc(); }

    if (!keepHome) {
      this.removeView();
      this.activeLink = linkName;
    }
  }

  endLink(linkName) {
    const foundLink = this.links.find(link => link.linkName === linkName);

    this.enableKeyTriggers();

    if (foundLink.endFunc) { foundLink.endFunc(); }

    this.previousLink = this.activeLink;
    this.activeLink = '';
  }

  appendTo(parentElement) {
    soundLibrary.playSound('topBar');

    if (this.activeLink === '' && this.previousLink !== '') {
      this.triggerLink(this.previousLink);
    } else {
      if (this.activeLink !== '') { this.endLink(this.activeLink); }

      super.appendTo(parentElement);
    }
  }
}

module.exports = Home;
