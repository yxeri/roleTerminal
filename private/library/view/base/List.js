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

/**
 * Sorts a list of items. Appends a new item if set
 * @param {HTMLUListElement} list - The list to sort
 * @param {HTMLLIElement} newItem - New item to append
 * @returns {HTMLUListElement} Sorted list
 */
function createSortedList(list, newItem) {
  const sortedList = list.cloneNode(true);

  if (newItem) { sortedList.appendChild(newItem); }

  sortedList.childNodes.sort((a, b) => {
    if (isNaN(a) && isNaN(b)) {
      const aValue = a.value.toLowerCase();
      const bValue = b.value.toLowerCase();

      if (aValue < bValue) {
        return -1;
      } else if (aValue > bValue) {
        return 1;
      }

      return 0;
    }

    return a.value - b.value;
  });

  return sortedList;
}

class List extends View {
  constructor({ isFullscreen, viewId, shouldSort, items = [], title }) {
    super({ isFullscreen, viewId });

    this.element.classList.add('menuList');
    this.element.classList.add('hide');
    this.shouldSort = shouldSort;

    if (title) {
      const titleElement = document.createElement('P');

      titleElement.classList.add('listTitle');
      titleElement.appendChild(document.createTextNode(title));
      this.element.appendChild(titleElement);
    }

    this.element.appendChild(elementCreator.createList({ elements: items }));
  }

  addItem({ item }) {
    if (this.shouldSort) {
      this.element.replaceChild(this.list, createSortedList(this.element.lastElementChild, elementCreator.createListItem({ element: item })));
    } else {
      this.element.lastElementChild.appendChild(elementCreator.createListItem({ element: item }));
    }

    this.toggleList();
  }

  addItems({ items }) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => fragment.appendChild(elementCreator.createListItem({ element: item })));
    this.addItem({ listItem: fragment });
    this.toggleList();
  }

  replaceAllItems({ items }) {
    const list = elementCreator.createList({ elements: items });

    this.element.replaceChild(list, this.element.lastElementChild);
    this.toggleList();
  }

  toggleList() {
    if (this.element.lastElementChild.childNodes.length > 0) {
      this.element.classList.remove('hide');
    } else {
      this.element.classList.add('hide');
    }
  }
}

module.exports = List;
