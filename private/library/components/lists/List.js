/*
 Copyright 2018 Aleksandar Jankovic

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

/**
 * A filter will be used to filter out the objects retrieved or received. Only those who match the filter will be accepted.
 * @typedef {Object} Filter
 * @property {string} paramName - Name of the parameter.
 * @property {string} paramValue - Value of the parameter.
 */

/**
 * A list item field is a value that will be printed into an element in the list.
 * @typedef {Object} ListItemField
 * @property {string} paramName - Name of the parameter to retrieve the value from and print.
 * @property {string} [fallbackTo] - Name of the parameter that will be used if paramName does not exist in the object.
 * @property {Function} [func] - Function that will be called if the item is clicked.
 * @property {Function} [convertFunc] - Function that will be called when printing the field. It can be used to convert IDs of objects to human-readable names.
 *
 */

const BaseView = require('../views/BaseView');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');

const cssClasses = {
  focusListItem: 'focusListItem',
  markListItem: 'markListItem',
  newListItem: 'newListItem',
  removeListItem: 'removeListItem',
};
const itemChangeTimeout = 800;

class List extends BaseView {
  /**
   * List constructor.
   * @param {Object} params - Parameters.
   * @param {Object} params.collector - Data handler to use for object retrieval.
   * @param {ListItemField[]} [params.listItemFields] - The object parameters to get and output. Leaving this and fieldToAppend empty will output a list of objectIds.
   * @param {string} [params.fieldToAppend] - The object parameter to output after listItemFields. Leaving this and listItemFields will output a list of objectIds.
   * @param {Object} [params.listItemClickFuncs] - Functions to call on clicks on the list item.
   * @param {Object} [params.listItemClickFuncs.leftFunc] - Function to call on left clicks.
   * @param {Object} [params.listItemClickFuncs.right] - Function to call on right clicks.
   * @param {Object} [params.filter] - Filters to use on object retrieval.
   * @param {boolean} [params.shouldFocusOnClick] - Should list items that are clicked be focused?
   * @param {string[]} [params.classes] - CSS classes.
   * @param {string} [params.elementId] - Id of the list element.
   * @param {string} [params.focusedId] - Id of the list item that will be focused from the start.
   * @param {Object} [params.dependencies] - Data handler dependencies. The creation of the list will only run when all the handlers have retrieved their objects.
   */
  constructor({
    collector,
    listItemFields,
    fieldToAppend,
    filter,
    appendClasses,
    listItemFieldsClasses,
    listItemClickFuncs = {},
    dependencies = [],
    focusedId = '-1',
    shouldFocusOnClick = true,
    classes = [],
    elementId = `list-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['list']),
    });

    this.dependencies = dependencies;
    this.listItemClickFuncs = listItemClickFuncs;
    this.collector = collector;
    this.listItemFieldsClasses = listItemFieldsClasses;
    this.listItemFields = listItemFields;
    this.appendClasses = appendClasses;
    this.fieldToAppend = fieldToAppend;
    this.focusedId = focusedId;
    this.markedIds = [];
    this.shouldFocusOnClick = shouldFocusOnClick;
    this.filter = filter;

    if (collector.eventTypes.one) {
      eventCentral.addWatcher({
        event: collector.eventTypes.one,
        func: (data) => {
          const object = data[collector.objectTypes.one];
          const { objectId } = object;
          const { changeType } = data;

          if (this.filter && !this.filter.rules.every(rule => rule.paramValue === object[rule.paramName])) {
            return;
          }

          switch (changeType) {
            case socketManager.ChangeTypes.UPDATE: {
              this.addOneItem({
                object,
                shouldAnimate: true,
                shouldReplace: true,
              });

              break;
            }
            case socketManager.ChangeTypes.CREATE: {
              this.addOneItem({
                object,
                shouldAnimate: true,
              });

              break;
            }
            case socketManager.ChangeTypes.REMOVE: {
              this.removeOneItem({ object });

              break;
            }
            default: {
              break;
            }
          }
        },
      });
    }

    if (collector.eventTypes.many) {
      eventCentral.addWatcher({
        event: collector.eventTypes.many,
        func: () => {
          this.appendList();
        },
      });
    }
  }

  addToView(params) {
    this.appendList();

    super.addToView(params);
  }

  appendList() {
    if (!this.dependencies.every(dependency => dependency.hasFetched)) {
      setTimeout(() => {
        this.appendList();
      }, 200);

      return;
    }

    const listElement = this.createList();

    this.replaceOnParent({ element: listElement });
  }

  removeListItem({ objectId }) {
    const existingItem = this.getElement(objectId);

    this.element.removeChild(existingItem);
  }

  createList() {
    const listElement = elementCreator.createList({
      elementId: this.elementId,
      classes: this.classes,
    });
    const allObjects = this.collector.getObjects({ filter: this.filter });

    Object.keys(allObjects).forEach((objectId) => {
      const object = allObjects[objectId];

      listElement.appendChild(this.createListItem({ object }));
    });

    return listElement;
  }

  getFocusedListItem() {
    return this.getElement(this.focusedId);
  }

  setFocusedListItem(elementId) {
    if (!this.shouldFocusOnClick) {
      return;
    }

    const focused = this.getFocusedListItem();
    const toFocus = this.getElement(elementId);

    if (focused) {
      focused.classList.remove(cssClasses.focusListItem);
    }

    if (toFocus) {
      this.focusedId = elementId;

      toFocus.classList.add(cssClasses.focusListItem);
    }
  }

  markListItem(elementId) {
    const toMark = this.getElement(elementId);

    if (toMark) {
      toMark.classList.add(cssClasses.markListItem);

      if (!this.markedIds.includes(elementId)) {
        this.markedIds.push(elementId);
      }
    }
  }

  unmarkListItem(elementId) {
    const markedIndex = this.markedIds.indexOf(elementId);

    if (markedIndex > -1) {
      const element = this.getElement(elementId);

      element.classList.remove(cssClasses.markListItem);

      this.markedIds.splice(markedIndex, 1);
    }
  }

  createListItem({ object }) {
    const { objectId } = object;
    const classes = this.focusedId === objectId ? [cssClasses.focusListItem] : [];
    const listItemElements = [];
    const clickFuncs = {
      leftFunc: () => {
        this.setFocusedListItem(objectId);
        this.unmarkListItem(objectId);

        if (this.listItemClickFuncs.leftFunc) {
          this.listItemClickFuncs.leftFunc(objectId);
        }
      },
    };

    if (this.listItemClickFuncs.right) {
      clickFuncs.right = () => {
        this.listItemClickFuncs.right(objectId);
      };
    }

    if (this.listItemFields || this.fieldToAppend) {
      /**
       * Add item fields to the list item.
       */
      if (this.listItemFields) {
        const elements = this.listItemFields
          .filter(field => typeof object[field.paramName] !== 'undefined' || typeof object[field.fallbackTo] !== 'undefined')
          .map((field) => {
            const {
              paramName,
              fallbackTo,
              convertFunc,
              func,
              classes: fieldClasses,
            } = field;
            const value = object[paramName] || object[fallbackTo];
            const text = convertFunc ? convertFunc(value) : value;
            const spanParams = {
              text,
              classes: fieldClasses,
              clickFuncs: {},
            };

            if (func) {
              spanParams.clickFuncs.leftFunc = () => {
                func(objectId);
              };
            }

            return elementCreator.createSpan(spanParams);
          });

        listItemElements.push(elementCreator.createParagraph({
          elements,
          classes: this.listItemFieldsClasses,
        }));
      }

      /**
       * Append field after the item fields.
       */
      if (this.fieldToAppend) {
        const field = object[this.fieldToAppend];

        if (Array.isArray(field)) {
          field.forEach((value) => {
            listItemElements.push(elementCreator.createParagraph({
              classes: this.appendClasses,
              elements: [elementCreator.createSpan({ text: value })],
            }));
          });
        } else {
          listItemElements.push(elementCreator.createParagraph({
            classes: this.appendClasses,
            elements: [elementCreator.createSpan({ text: field })],
          }));
        }
      }
    } else { // Fallback. Create list item if none has been created.
      listItemElements.push(elementCreator.createParagraph({
        elements: [elementCreator.createSpan({ text: objectId })],
      }));
    }

    return elementCreator.createListItem({
      classes,
      clickFuncs,
      elementId: `${this.elementId}${objectId}`,
      elements: listItemElements,
    });
  }

  addOneItem({
    object,
    shouldReplace = false,
    shouldAnimate = false,
  }) {
    const { objectId } = object;
    const newItem = this.createListItem({ object });

    if (shouldAnimate) {
      newItem.classList.add(cssClasses.newListItem);
      setTimeout(() => { newItem.classList.remove(cssClasses.newListItem); }, itemChangeTimeout);
    }

    if (shouldReplace) {
      this.element.replaceChild(newItem, this.getElement(objectId));
    } else {
      this.element.appendChild(newItem);
    }
  }

  removeOneItem({
    object,
  }) {
    const { objectId } = object;
    const toRemove = this.getElement(objectId);

    toRemove.classList.add(cssClasses.removeListItem);

    setTimeout(() => {
      this.element.removeChild(this.getElement(objectId));
    }, itemChangeTimeout);
  }
}

module.exports = List;
