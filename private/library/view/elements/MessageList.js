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

const viewTools = require('../../ViewTools');
const elementCreator = require('../../ElementCreator');
const eventCentral = require('../../EventCentral');

/**
 * Create and return header paragraph
 * @param {{textLine: string, extraClass: string, clickFunc: Function}[]} headerItems - Items to be appended to the header
 * @param {boolean} printable - Should the item that the header is part of be printable
 * @returns {Element} Header paragraph
 */
function createHeader({ headerItems, printable, parentElement }) {
  const paragraph = document.createElement('P');
  paragraph.classList.add('header');

  headerItems.forEach(({ textLine, extraClass, clickFunc }) => {
    const span = document.createElement('SPAN');
    span.appendChild(document.createTextNode(`${textLine.charAt(0).toUpperCase()}${textLine.slice(1)}`));

    if (clickFunc) { span.addEventListener('click', clickFunc); }
    if (extraClass) { span.classList.add(extraClass); }

    paragraph.appendChild(span);
  });

  if (printable) {
    const button = elementCreator.createButton({
      func: () => {
        parentElement.classList.add('print');
        window.print();
        setTimeout(() => { parentElement.classList.remove('print'); }, 500);
      },
      text: 'Print',
    });

    paragraph.appendChild(button);
  }

  return paragraph;
}

class MessageList {
  constructor({ isTopDown = false }) {
    this.isTopDown = isTopDown;
    this.element = document.createElement('UL');
    this.lastItem = { headerItems: [''] };

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.SWITCHROOM,
      func: () => { this.lastItem = { headerItems: [''] }; },
    });
  }

  addItems(items, { shouldScroll, animation, isHistory }) {
    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const listItemOptions = {};

      listItemOptions.skipHeader = item.headerItems[0].textLine === this.lastItem.headerItems[0].textLine;

      if (!isHistory) { listItemOptions.animation = animation; }

      const listItem = this.createItem(item, listItemOptions);

      if (this.isTopDown) {
        fragment.insertBefore(listItem, fragment.firstChild);
      } else {
        fragment.appendChild(listItem);
      }

      this.lastItem = item;
    });

    if (this.isTopDown) {
      this.element.insertBefore(fragment, this.element.firstChild);
    } else {
      this.element.appendChild(fragment);

      if (!this.scrolledToBottom(shouldScroll)) {
        console.log('New messages!');
      }
    }
  }

  /**
   * Creates and returns list item
   * @param {{textLine: string, extraClass: string, clickFunc: Function}[]} headerItems - Items to be appended to the header
   * @param {string[]} text - Item text
   * @param {boolean} printable - Should the item be printable
   * @returns {Element} List item
   */
  createItem({ headerItems, text, printable, image }, { animation, skipHeader }) {
    const listItem = document.createElement('LI');

    if (!skipHeader) {
      listItem.appendChild(createHeader({ parentElement: listItem, headerItems, printable }));
    }

    if (animation) { listItem.classList.add(animation); }

    text.forEach((line) => {
      const paragraph = document.createElement('P');

      if (line === '') {
        paragraph.appendChild(document.createElement('BR'));
      } else {
        paragraph.appendChild(document.createTextNode(line));
      }

      listItem.appendChild(paragraph);
    });

    if (image) {
      const paragraph = document.createElement('P');
      paragraph.classList.add('image');
      const imageObj = new Image();

      imageObj.addEventListener('error', () => { paragraph.classList.add('hide'); });
      imageObj.addEventListener('load', () => { imageObj.classList.add('autoHeight'); });

      imageObj.setAttribute('src', `images/${image.fileName}`);
      imageObj.setAttribute('width', image.width);
      imageObj.setAttribute('height', image.height);

      paragraph.appendChild(imageObj);
      listItem.appendChild(paragraph);

      if (listItem.isSameNode(this.element.lastChild)) { this.scrolledToBottom(); }
    }

    return listItem;
  }

  scrolledToBottom(shouldScroll) {
    if (shouldScroll || viewTools.isCloseToEnd(this.element, this.element.lastChild.getBoundingClientRect().height)) {
      this.scroll(false);

      return true;
    }

    return false;
  }

  scroll() {
    if (!this.isTopDown && this.element.lastChild) {
      this.element.lastChild.scrollIntoView();
    }
  }
}

module.exports = MessageList;
