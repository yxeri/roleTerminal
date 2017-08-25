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

const View = require('../base/View');
const elementCreator = require('../../ElementCreator');

class ButtonBox extends View {
  constructor({ isFullscreen, description, buttons }) {
    super({ isFullscreen });
    this.element.classList.add('dialogBox');
    this.element.classList.add('buttonBox');
    this.descriptionContainer = elementCreator.createContainer({});
    this.cover = elementCreator.createContainer({ elementId: 'cover' });
    this.buttonList = elementCreator.createList({});
    this.addButtons({ buttons });

    if (description) {
      description.forEach(text => this.descriptionContainer.appendChild(elementCreator.createParagraph({ text })));
    }

    this.element.appendChild(this.descriptionContainer);
    this.element.appendChild(this.buttonList);
  }

  addButtons({ buttons = [] }) {
    if (buttons.length > 0) {
      const fragment = document.createDocumentFragment();

      buttons.forEach(button => fragment.appendChild(elementCreator.createListItem({ element: button })));
      this.buttonList.appendChild(fragment);
    }
  }

  replaceButtons({ buttons }) {
    if (buttons && buttons.length > 0) {
      this.buttonList.innerHTML = '';
      this.addButtons({ buttons });
    }
  }

  changeDescription({ text = [] }) {
    const fragment = document.createDocumentFragment();

    text.forEach((line) => {
      const paragraph = document.createElement('P');

      paragraph.classList.add('flash');
      paragraph.appendChild(document.createTextNode(line));
      fragment.appendChild(paragraph);
    });

    this.descriptionContainer.innerHTML = '';
    this.descriptionContainer.appendChild(fragment);
  }

  appendTo(parentElement) {
    parentElement.appendChild(this.cover);
    super.appendTo(parentElement);
  }

  removeView() {
    this.element.parentNode.removeChild(this.cover);
    super.removeView();
  }
}

module.exports = ButtonBox;
