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
  constructor({ isFullscreen, viewId, shouldSort, listItems }) {
    super({ isFullscreen, viewId });

    this.element.classList.add('menuList');
    this.shouldSort = shouldSort;

    this.element.appendChild(elementCreator.createList({ elements: listItems }));
  }

  addItem({ listItem }) {
    if (this.shouldSort) {
      this.element.replaceChild(this.list, createSortedList(this.element.firstChild, listItem));
    } else {
      this.element.firstChild.appendChild(listItem);
    }
  }

  replaceAllItems({ list }) {
    this.element.replaceChild(this.element.firstChild, list);
  }
}

module.exports = List;
