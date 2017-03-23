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
const storageManager = require('../../StorageManager');

class Home extends View {
  constructor() {
    super({ isFullscreen: false });

    this.element.setAttribute('id', 'home');
    this.element.appendChild(document.createElement('DIV'));
    this.element.appendChild(document.createElement('DIV'));
    this.links = [];
    this.previousLink = '';
    this.activeLink = '';

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        this.element.lastElementChild.innerHTML = '';
        const userParagraph = document.createElement('P');
        userParagraph.appendChild(document.createTextNode(`User: ${storageManager.getUserName() || '-'}`));
        const teamParagraph = document.createElement('P');
        teamParagraph.appendChild(document.createTextNode(`Team: ${storageManager.getTeam() || '-'}`));
        const accessParagraph = document.createElement('P');
        accessParagraph.appendChild(document.createTextNode(`Access level: ${storageManager.getAccessLevel()}`));

        this.element.lastElementChild.appendChild(userParagraph);
        this.element.lastElementChild.appendChild(teamParagraph);
        this.element.lastElementChild.appendChild(accessParagraph);
      },
    });
  }

  addLink({ linkName, startFunc, endFunc, accessLevel, maxAccessLevel, keepHome, classes }) {
    this.links.push({ linkName, startFunc, endFunc });

    const button = elementCreator.createButton({
      func: () => { this.triggerLink(linkName, keepHome); },
      text: linkName.toUpperCase(),
      classes,
    });

    if (!isNaN(accessLevel)) {
      this.accessElements.push({
        element: button,
        accessLevel,
        maxAccessLevel,
      });
    }

    this.element.firstChild.appendChild(button);
  }

  triggerLink(linkName, keepHome) {
    if (this.activeLink !== '') { this.endLink(linkName); }

    this.links.find(link => link.linkName === linkName).startFunc();

    if (!keepHome) {
      this.removeView();
      this.activeLink = linkName;
    }
  }

  endLink(linkName) {
    this.links.find(link => link.linkName === linkName).endFunc();
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
