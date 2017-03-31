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
 * @returns {DocumentFragment} Sorted list
 */
function createSortedList(list, newItem) {
  const fragment = document.createDocumentFragment();

  if (newItem) { list.appendChild(newItem); }

  const array = Array.from(list.childNodes);

  array.sort((a, b) => {
    const aValue = a.firstElementChild.innerText.toLowerCase();
    const bValue = b.firstElementChild.innerText.toLowerCase();

    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    }

    return 0;
  });

  array.forEach(item => fragment.appendChild(item));

  return fragment;
}

class List extends View {
  constructor({ isFullscreen, viewId, shouldSort, items = [], title, showingList = false }) {
    super({ isFullscreen, viewId });

    this.element.classList.add('menuList');
    this.element.classList.add('hide');
    this.shouldSort = shouldSort;
    this.showingList = showingList;
    this.toggleElement = elementCreator.createContainer({ });

    if (title) {
      const titleElement = document.createElement('P');
      titleElement.classList.add('listTitle');
      titleElement.classList.add('clickable');

      titleElement.addEventListener('click', () => {
        this.toggleList();
      });

      if (!this.showingList) {
        this.toggleElement.classList.add('collapsedIcon');
      } else {
        this.toggleElement.classList.add('expandedIcon');
      }

      titleElement.appendChild(this.toggleElement);
      titleElement.appendChild(document.createTextNode(title));
      this.element.appendChild(titleElement);
    } else {
      this.showingList = true;
    }

    const list = elementCreator.createList({ elements: items });

    if (!this.showingList) {
      list.classList.add('hide');
    }

    this.element.appendChild(list);
  }

  addItem({ item }) {
    if (this.shouldSort) {
      const fragment = createSortedList(this.element.lastElementChild, elementCreator.createListItem({ element: item }));

      this.element.lastElementChild.innerHTML = '';
      this.element.lastElementChild.appendChild(fragment);
    } else {
      this.element.lastElementChild.appendChild(elementCreator.createListItem({ element: item }));
    }

    this.toggleView();
  }

  addItems({ items }) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => fragment.appendChild(elementCreator.createListItem({ element: item })));
    this.element.lastElementChild.appendChild(fragment);
    this.toggleView();
  }

  replaceAllItems({ items }) {
    const list = elementCreator.createList({ elements: items });

    if (!this.showingList) {
      list.classList.add('hide');
    }

    this.element.replaceChild(list, this.element.lastElementChild);
    this.toggleView();
  }

  toggleView() {
    if (this.element.lastElementChild.childNodes.length > 0) {
      this.element.classList.remove('hide');
    } else {
      this.element.classList.add('hide');
    }
  }

  toggleList(show) {
    if (!this.showingList || show) {
      this.toggleElement.classList.remove('collapsedIcon');
      this.toggleElement.classList.add('expandedIcon');
      this.showingList = true;
    } else {
      this.toggleElement.classList.remove('expandedIcon');
      this.toggleElement.classList.add('collapsedIcon');
      this.showingList = false;
    }

    this.element.lastElementChild.classList.toggle('hide');
  }
}

module.exports = List;
