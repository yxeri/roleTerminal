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
 * @param {HTMLLIElement} [newItem] - New item to append
 * @returns {DocumentFragment} Sorted list
 */
function createSortedList(list, newItem) {
  const newList = elementCreator.createList({});
  newList.classList = list.classList;

  if (newItem) { list.appendChild(newItem); }

  const array = Array.from(list.childNodes);

  array.sort((a, b) => {
    const aValue = a.firstElementChild.textContent.toLowerCase();
    const bValue = b.firstElementChild.textContent.toLowerCase();

    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    }

    return 0;
  });

  array.forEach(item => newList.appendChild(item));

  return newList;
}

class List extends View {
  constructor({ isFullscreen, viewId, shouldSort, items = [], title, showingList = false, minimumToShow = 1, showTitle = false, titleCallback = () => {}, alwaysShow = false }) {
    super({ isFullscreen, viewId });

    this.element.classList.add('menuList');
    this.shouldSort = shouldSort;
    this.alwaysShow = alwaysShow;
    this.showingList = showingList;
    this.minimumToShow = minimumToShow;
    this.toggleElement = elementCreator.createContainer({});

    if (!showTitle) {
      this.element.classList.add('hide');
    }

    if (title) {
      if (!this.showingList) {
        this.toggleElement.classList.add('collapsedIcon');
      } else {
        this.toggleElement.classList.add('expandedIcon');
      }

      const titleContainer = elementCreator.createContainer({
        classes: ['button'],
        func: () => {
          titleCallback();
          this.toggleList();
        },
      });
      titleContainer.appendChild(elementCreator.createContainer({ classes: ['buttonLeftCorner'] }));
      titleContainer.appendChild(elementCreator.createContainer({ classes: ['buttonUpperRightCorner'] }));
      titleContainer.appendChild(elementCreator.createSpan({ text: title }));

      this.element.appendChild(titleContainer);
    } else {
      this.showingList = true;
    }

    const list = elementCreator.createList({ elements: items });
    list.addEventListener('scroll', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    if (!this.showingList && !this.alwaysShow) {
      list.classList.add('hide');
    }

    this.element.appendChild(list);
  }

  addItem({ item, shouldReplace, oldTitle }) {
    if (shouldReplace && oldTitle) {
      const oldButton = this.getItem({ name: oldTitle });

      if (oldButton && oldButton.getAttribute('data')) {
        item.setAttribute('data', oldButton.getAttribute('data'));
      }

      this.removeItem({ name: oldTitle });
    }

    if (this.shouldSort) {
      const list = createSortedList(this.element.lastElementChild, elementCreator.createListItem({ element: item }));
      list.classList.add('userList');
      list.addEventListener('scroll', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      this.element.replaceChild(list, this.element.lastElementChild);
    } else {
      this.element.lastElementChild.appendChild(elementCreator.createListItem({ element: item }));
    }

    this.toggleView();
  }

  addItems({ items }) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => fragment.appendChild(elementCreator.createListItem({ element: item })));
    this.element.lastElementChild.appendChild(fragment);
    this.element.lastElementChild.classList.add('userList');
    this.toggleView();
  }

  removeItem({ name }) {
    const lowerName = name.toLowerCase();

    const newList = elementCreator.createList({
      elements: Array.from(this.element.lastElementChild.childNodes).map(element => element.firstElementChild).filter(element => (!element.getAttribute('data') || element.getAttribute('data') !== lowerName) && element.textContent.toLowerCase() !== lowerName),
    });

    this.element.replaceChild(newList, this.element.lastElementChild);
  }

  getItem({ name }) {
    const lowerName = name.toLowerCase();

    return Array.from(this.element.lastElementChild.childNodes).map(element => element.firstElementChild).find(element => element.getAttribute('data') === lowerName || element.textContent.toLowerCase() === lowerName);
  }

  replaceAllItems({ items }) {
    const list = this.shouldSort ? createSortedList(elementCreator.createList({ elements: items })) : elementCreator.createList({ elements: items });

    if (!this.showingList && !this.alwaysShow) {
      list.classList.add('hide');
    }

    list.classList.add('userList');
    list.addEventListener('scroll', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    this.element.replaceChild(list, this.element.lastElementChild);
    this.toggleView();
  }

  toggleView() {
    if (this.element.lastElementChild.childNodes.length > (this.minimumToShow - 1)) {
      this.element.classList.remove('hide');
    } else {
      this.element.classList.add('hide');
    }
  }

  hideList() {
    this.showingList = false;

    if (!this.alwaysShow) {
      this.element.lastElementChild.classList.add('hide');
    }
  }

  toggleList(show) {
    if (!this.showingList || show || this.alwaysShow) {
      this.toggleElement.classList.remove('collapsedIcon');
      this.toggleElement.classList.add('expandedIcon');
      this.element.lastElementChild.classList.remove('hide');
      this.showingList = true;
    } else {
      this.toggleElement.classList.remove('expandedIcon');
      this.toggleElement.classList.add('collapsedIcon');
      this.element.lastElementChild.classList.add('hide');
      this.showingList = false;
    }
  }
}

module.exports = List;
