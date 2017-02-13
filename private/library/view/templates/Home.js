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

class Home extends View {
  constructor() {
    super({ isFullscreen: false });

    this.element.setAttribute('id', 'home');
    this.element.appendChild(document.createElement('DIV'));
    this.links = [];
    this.previousLink = '';
    this.activeLink = '';
  }

  addLink({ linkName, startFunc, endFunc }) {
    this.links.push({ linkName, startFunc, endFunc });

    const button = document.createElement('BUTTON');
    button.setAttribute('id', `${linkName}_link`);
    button.appendChild(document.createTextNode(linkName.toUpperCase()));
    button.addEventListener('click', () => {
      this.triggerLink(linkName);
    });

    this.element.firstChild.appendChild(button);
  }

  triggerLink(linkName) {
    if (this.activeLink !== '') { this.endLink(linkName); }

    this.removeView();
    this.links.find(link => link.linkName === linkName).startFunc();
    this.activeLink = linkName;
  }

  endLink(linkName) {
    this.links.find(link => link.linkName === linkName).endFunc();
    this.previousLink = this.activeLink;
    this.activeLink = '';
  }

  appendTo(parentElement) {
    if (this.activeLink === '' && this.previousLink !== '') {
      this.triggerLink(this.previousLink);
    } else {
      if (this.activeLink !== '') { this.endLink(this.activeLink); }

      super.appendTo(parentElement);
    }
  }
}

module.exports = Home;
