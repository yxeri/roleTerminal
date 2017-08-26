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

const View = require('./View');
const elementCreator = require('../../ElementCreator');

class StandardView extends View {
  constructor({ isFullscreen, viewId }) {
    super({ isFullscreen, viewId });
    this.element.classList.add('container');
    this.viewer = elementCreator.createContainer({ classes: ['viewer'] });
    this.itemList = elementCreator.createContainer({ classes: ['list'] });

    this.element.append(elementCreator.createButton({
      text: 'Toggle menu',
      elementId: 'toggleButton',
      classes: ['listButton'],
      func: () => {
        this.itemList.classList.toggle('show');
        this.viewer.classList.toggle('toggledList');
      },
    }));
    this.element.append(this.itemList);
    this.element.append(this.viewer);
  }

  showList() {
    this.itemList.remove('hide');
  }

  hideList() {
    this.itemList.add('hide');
  }
}

module.exports = StandardView;
