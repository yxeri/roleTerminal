/*
 Copyright 2018 Carmilla Mina Jankovic

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
 * A list item field is a value that will be printed into an element in the list.
 * @typedef {Object} ListItemField
 * @property {string} paramName Name of the parameter to retrieve the value from and print.
 * @property {string} [fallbackTo] Name of the parameter that will be used if paramName does not exist in the object.
 * @property {Function} [func] Function that will be called if the item is clicked.
 * @property {Function} [convertFunc] Function that will be called when printing the field. It can be used to convert IDs of objects to human-readable names.
 */

/**
 * A list item field is a value that will be printed into an element in the list.
 * @typedef {Object} ListItemClickFuncs
 * @property {Function} [params.listItemClickFuncs.leftFunc] Function to call on left clicks.
 * @property {Function} [params.listItemClickFuncs.right] Function to call on right clicks.
 */

/**
 * A filter will be used to filter out the items shown against the current user's properties. Only those who match the filter will be accepted.
 * @typedef {Object} UserFilter
 * @property {boolean} [orCheck] Is it enough for only one sent value to match?
 * @property {Object[]} rules Rules.
 * @property {string} rules.paramName Name of the parameter on the user.
 * @property {string} rules.objectParamName Name of the parameter on the object.
 * @property {boolean} [rules.shouldInclude] Should a collection include the sent value?
 * @property {boolean} [rules.shouldBeTrue] Should the test be true?
 */

const BaseView = require('../views/BaseView');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const userComposer = require('../../data/composers/UserComposer');
const storageManager = require('../../StorageManager');
const textTools = require('../../TextTools');

const cssClasses = {
  focusListItem: 'focusListItem',
  markListItem: 'markListItem',
  newListItem: 'newListItem',
  removeListItem: 'removeListItem',
};

class List extends BaseView {
  /**
   * List constructor.
   * @param {Object} params Parameters.
   * @param {Object} params.collector Data handler to use for object retrieval.
   * @param {number} [params.minimumAccessLevel] Minimum required acccess level for the current user to see the list.
   * @param {UserFilter} [params.userFilter] Filter to check against the current user's properties.
   * @param {string} [params.listType] Type of list. Available choices: rooms, followedRooms, whisperRooms.
   * @param {string} [params.title] Title that will be shown with the list.
   * @param {boolean} [params.effect] Should all printed text have a typewriter effect?
   * @param {boolean} [params.shouldToggle] Should the visibility of the list toggle on clicks?
   * @param {ListItemField[]} [params.listItemFields] The object parameters to get and output. Leaving this and fieldToAppend empty will output a list of objectIds.
   * @param {string} [params.fieldToAppend] The object parameter to output after listItemFields. Leaving this and listItemFields will output a list of objectIds.
   * @param {ListItemClickFuncs} [params.listItemClickFuncs] Functions to call on clicks on the list item.
   * @param {Object} [params.listItemSpecificClasses] CSS classes that will be set on values in the object.
   * @param {Filter} [params.filter] Filters to use on object retrieval.
   * @param {boolean} [params.shouldFocusOnClick] Should list items that are clicked be focused?
   * @param {string[]} [params.classes] CSS classes.
   * @param {string} [params.elementId] Id of the list element.
   * @param {string} [params.focusedId] Id of the list item that will be focused from the start.
   * @param {Object[]} [params.dependencies] Data handler dependencies. The creation of the list will only run when all the handlers have retrieved their objects.
   * @param {boolean} [params.shouldPaginate] Should the list be appended in pieces?
   */
  constructor({
    collector,
    listItemFields,
    fieldToAppend,
    shouldAppendImage,
    filter,
    appendClasses,
    sorting,
    title,
    listItemSpecificClasses,
    userFilter,
    minimumAccessLevel,
    listType,
    collapseEqual,
    listItemFieldsClasses = [],
    imageInfo = {},
    effect = false,
    shouldToggle = false,
    onCreateFunc = () => {},
    shouldPaginate = false,
    shouldScrollToBottom = false,
    listItemClickFuncs = {},
    dependencies = [],
    focusedId = '-1',
    shouldFocusOnClick = true,
    classes = [],
    elementId = `list-${Date.now()}`,
  }) {
    super({
      elementId,
      minimumAccessLevel,
      classes: classes.concat(['list']),
    });

    this.onCreateFunc = onCreateFunc;
    this.ListTypes = {
      ROOMS: 'rooms',
      FOLLOWEDROOMS: 'followedRooms',
      WHISPERROOMS: 'whisperRooms',
    };
    this.effect = effect;
    this.dependencies = dependencies;
    this.listItemClickFuncs = listItemClickFuncs;
    this.collector = collector;
    this.listItemFieldsClasses = listItemFieldsClasses;
    this.listItemFields = listItemFields;
    this.appendClasses = appendClasses;
    this.fieldToAppend = fieldToAppend;
    this.shouldAppendImage = shouldAppendImage;
    this.focusedId = focusedId;
    this.markedIds = [];
    this.shouldFocusOnClick = shouldFocusOnClick;
    this.filter = filter;
    this.userFilter = userFilter;
    this.shouldScrollToBottom = shouldScrollToBottom;
    this.sorting = sorting;
    this.title = title;
    this.shouldPaginate = shouldPaginate;
    this.listItemSpecificClasses = listItemSpecificClasses;
    this.shouldToggle = shouldToggle;
    this.listType = listType;
    this.itemQueue = [];
    this.collapseEqual = collapseEqual;
    this.lastObject = null;
    this.imageInfo = imageInfo;

    if (collector.eventTypes.one) {
      /**
       * On one new event (update/create/remove)
       */
      eventCentral.addWatcher({
        event: collector.eventTypes.one,
        func: (data) => {
          const object = data[collector.objectTypes.one];
          const { changeType } = data;
          const user = userComposer.getCurrentUser();

          if (!this.shouldFilterItem({
            changeType,
            object,
            user,
          })) {
            return;
          }

          switch (changeType) {
            case socketManager.ChangeTypes.UPDATE: {
              if (this.hasAccess({ object, user }).canSee) {
                this.addOneItem({
                  object,
                  shouldFlash: true,
                  shouldReplace: true,
                });
              } else {
                this.removeElement({ object });
              }

              break;
            }
            case socketManager.ChangeTypes.CREATE: {
              if (this.hasAccess({ object, user }).canSee) {
                this.onCreateFunc({ object });

                this.addOneItem({
                  object,
                  effect: this.effect,
                  shouldFlash: true,
                });
                this.scrollList();
              }

              break;
            }
            case socketManager.ChangeTypes.REMOVE: {
              console.log('going to remove object', object, collector.objectTypes.one);

              this.removeElement({ object });

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
      /**
       * On multiple events
       */
      eventCentral.addWatcher({
        event: collector.eventTypes.many,
        func: () => {
          this.appendList();
        },
      });
    }

    /**
     * On reconnect
     */
    eventCentral.addWatcher({
      event: eventCentral.Events.RECONNECT,
      func: () => {
        this.appendList();
      },
    });
  }

  /**
   * Scroll the list to the bottom item.
   */
  scrollList() {
    if (this.shouldScrollToBottom && this.listElement && this.listElement.lastElementChild) {
      this.listElement.lastElementChild.scrollIntoView(false);
    }
  }

  /**
   * Add the list to the view.
   * @param {Object} params Params.
   */
  addToView(params) {
    this.appendList();

    super.addToView(params);
  }

  /**
   * Build and attach the DOM for the list.
   */
  appendList() {
    if (!this.dependencies.every(dependency => dependency.hasFetched)) {
      setTimeout(() => {
        this.appendList();
      }, 200);

      return;
    }

    const elements = [];
    const listClasses = [];
    this.lastObject = null;

    if (this.shouldToggle) {
      listClasses.push('hide');
    }

    if (this.title) {
      const clickFuncs = {
        leftFunc: () => {
          this.listElement.classList.toggle('hide');
        },
      };

      elements.push(elementCreator.createHeader({
        clickFuncs,
        classes: ['toggle'],
        elements: [elementCreator.createSpan({ text: this.title, classes: ['listTitle'] })],
      }));
    }

    this.listElement = elementCreator.createList({
      classes: listClasses,
    });

    elements.push(this.listElement);

    const container = elementCreator.createContainer({
      elements,
      elementId: this.elementId,
      classes: this.classes,
    });
    const allObjects = this.getCollectorObjects();

    if (this.shouldPaginate) {
      this.listElement.appendChild(this.createListFragment({ objects: allObjects.slice(50, allObjects.length) }));
    } else {
      this.listElement.appendChild(this.createListFragment({ objects: allObjects }));
    }

    this.replaceOnParent({ element: container });
    this.scrollList();
  }

  /**
   * Remove one list item.
   * @param {Object} object Object to remove.
   */
  removeListItem(object) {
    super.removeElement({
      object,
      shouldFlash: false,
      parentElement: this.listElement,
    });
  }

  /**
   * Create document fragment with list items.
   * @param {Object[]} objects Objects to add as list items.
   * @return {DocumentFragment} Document fragment with list items.
   */
  createListFragment({ objects }) {
    const user = userComposer.getCurrentUser();
    const fragment = document.createDocumentFragment();
    const marked = storageManager.getMarked();

    objects.forEach((object) => {
      const { canSee } = this.hasAccess({ object, user });

      if (canSee) {
        const listItem = this.createListItem({
          object,
          isMarked: marked[this.listType]
            ? marked[this.listType].map(mark => mark.objectId).includes(object.objectId)
            : false,
        });

        fragment.appendChild(listItem);

        this.lastObject = object;
      }
    });

    return fragment;
  }

  /**
   * Get stored objects.
   * @return {Object[]} Stored objects.
   */
  getCollectorObjects() {
    return this.collector.getObjects({
      user: userComposer.getCurrentUser(),
      filter: this.filter,
      sorting: this.sorting,
    });
  }

  /**
   * Get the list item that is focused.
   * @return {HTMLElement} Focused list item.
   */
  getFocusedListItem() {
    return this.getElement(this.focusedId);
  }

  /**
   * Set focused list item.
   * @param {string} elementId Id of the item.
   */
  setFocusedListItem(elementId) {
    if (!this.shouldFocusOnClick) {
      return;
    }

    const toFocus = this.getElement(elementId);

    this.removeFocusOnItem();

    if (toFocus) {
      this.focusedId = elementId;

      toFocus.classList.add(cssClasses.focusListItem);
    }
  }

  /**
   * Remove focus from list item.
   */
  removeFocusOnItem() {
    const focused = this.getFocusedListItem();

    if (focused) {
      focused.classList.remove(cssClasses.focusListItem);
    }

    this.focusedId = undefined;
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

  /**
   * Create a list item.
   * @param {Object} params Parameters.
   * @param {Object} params.object Object to create a list item for.
   * @param {boolean} [params.isMarked] Should the list item be visually marked?
   * @return {HTMLElement} List item.
   */
  createListItem({
    object,
    isMarked = false,
  }) {
    const { objectId } = object;
    const classes = this.focusedId === objectId
      ? [cssClasses.focusListItem]
      : [];
    const listItemElements = [];
    const clickFuncs = {
      leftFunc: () => {
        this.setFocusedListItem(objectId);
        this.unmarkListItem(objectId);

        if (this.listItemClickFuncs.leftFunc) {
          this.listItemClickFuncs.leftFunc(objectId);
        }

        socketManager.checkAndReconnect();
      },
    };

    if (this.listItemSpecificClasses) {
      this.listItemSpecificClasses.forEach((item) => {
        const { classes: itemClasses = [], paramName, paramValue } = item;
        const objectValue = object[paramName];

        if ((objectValue && objectValue === paramValue) || (!objectValue && !paramValue)) {
          itemClasses.forEach((cssClass) => {
            classes.push(cssClass);
          });
        }
      });
    }

    if (this.listItemClickFuncs.right) {
      clickFuncs.right = () => {
        this.listItemClickFuncs.right(objectId);
      };
    }

    if (this.listItemFields || this.fieldToAppend) {
      /**
       * Add item fields to the list item.
       */
      if (this.listItemFields
        && (!this.collapseEqual
          || !this.lastObject
          || !(
            (object[this.collapseEqual.paramName] && object[this.collapseEqual.paramName] === this.lastObject[this.collapseEqual.paramName])
            || (!object[this.collapseEqual.paramName] && !this.lastObject[this.collapseEqual.paramName] && object[this.collapseEqual.fallbackTo] && object[this.collapseEqual.fallbackTo] === this.lastObject[this.collapseEqual.fallbackTo])
          )
        )
      ) {
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
            const text = convertFunc
              ? convertFunc(value)
              : value;
            const spanParams = {
              text,
              effect: this.effect,
              classes: fieldClasses,
            };

            if (func) {
              spanParams.clickFuncs = {
                leftFunc: () => {
                  func(objectId);
                },
              };
            }

            return text !== ''
              ? elementCreator.createSpan(spanParams)
              : document.createTextNode('');
          });

        const paragraphParams = {
          elements,
          classes: this.listItemFieldsClasses,
        };

        if (this.listItemClickFuncs.onlyListItemFields) {
          paragraphParams.clickFuncs = clickFuncs;
        }

        if (this.imageInfo && this.imageInfo.show) {
          const image = this.imageInfo.getImage(object[this.imageInfo.paramName])
            || !object[this.imageInfo.paramName]
            ? this.imageInfo.getImage(object[this.imageInfo.fallbackTo])
            : undefined;

          if (image) {
            listItemElements.push(elementCreator.createPicture({
              isThumb: true,
              picture: image,
              classes: ['listItemImage'],
            }));
            paragraphParams.classes.push('listItemWithImage');
          }
        }

        listItemElements.push(elementCreator.createParagraph(paragraphParams));
      }

      if (this.shouldAppendImage && object.image && object.image.imageName) {
        listItemElements.push(elementCreator.createPicture({
          picture: object.image,
          classes: ['attachedImage'],
        }));
      }

      /**
       * Append field after the item fields.
       */
      if (this.fieldToAppend) {
        const field = object[this.fieldToAppend];

        field.forEach((value) => {
          listItemElements.push(elementCreator.createParagraph({
            classes: this.appendClasses,
            elements: [elementCreator.createSpan({
              effect: this.effect,
              text: value,
            })],
          }));
        });
      }
    } else { // Fallback. Create list item if none has been created.
      listItemElements.push(elementCreator.createParagraph({
        elements: [elementCreator.createSpan({
          effect: this.effect,
          text: objectId,
        })],
      }));
    }

    const listItemParams = {
      classes,
      elementId: `${this.elementId}${objectId}`,
      elements: listItemElements,
    };

    if (!this.listItemClickFuncs.onlyListItemFields) {
      listItemParams.clickFuncs = clickFuncs;
    }

    if (isMarked) {
      listItemParams.classes.push(cssClasses.markListItem);
    }

    return elementCreator.createListItem(listItemParams);
  }

  /**
   * Add one new list item to the list.
   * @param {Object} params Parameters.
   * @param {Object} params.object Object to create an item from.
   * @param {boolean} [params.effect] Should the text printed have a typewriter effect?
   * @param {boolean} [params.shouldReplace] Should the list item replace an existing item?
   * @param {boolean} [params.shouldFlash] Should the list item visually flash when added to the DOM?
   */
  addOneItem({
    object,
    effect,
    shouldReplace = false,
    shouldFlash = false,
  }) {
    const { objectId } = object;
    const newItem = this.createListItem({ object });
    const element = this.getElement(objectId);

    if (effect) {
      const children = Array.from(newItem.childNodes);
      const dumpFragment = document.createDocumentFragment();

      children.forEach(child => dumpFragment.appendChild(child));

      textTools.typewriter({
        paragraphs: children,
        target: newItem,
        charFunc: () => { this.scrollList(); },
      });
    } else if (shouldFlash) {
      newItem.classList.add(cssClasses.newListItem);
      setTimeout(() => { newItem.classList.remove(cssClasses.newListItem); }, this.itemChangeTimeout);
    }

    if (shouldReplace && element) {
      this.listElement.replaceChild(newItem, this.getElement(objectId));
    } else if (this.sorting && this.sorting.paramName) {
      const firstChild = this.listElement.firstElementChild;
      this.lastObject = object;

      if (!firstChild) {
        this.listElement.appendChild(newItem);

        return;
      }

      const {
        paramName,
        fallbackParamName,
        reverse,
      } = this.sorting;

      const closestElement = this.getElement(BaseView.findClosestElementId({
        paramName,
        fallbackParamName,
        reverse,
        targetVar: object[paramName] || object[fallbackParamName],
        objects: this.getCollectorObjects(),
      }));

      this.listElement.insertBefore(newItem, closestElement);
    } else if (this.sorting && this.sorting.reverse) {
      const firstChild = this.listElement.firstElementChild;
      this.lastObject = object;

      if (!firstChild) {
        this.listElement.appendChild(newItem);

        return;
      }

      this.listElement.insertBefore(newItem, firstChild);
    } else {
      this.listElement.appendChild(newItem);

      this.lastObject = object;
    }
  }

  /**
   * Visually mark a list item.
   * @param {Object} params Parameters.
   * @param {string} params.objectId Id of the object.
   */
  markItem({ objectId }) {
    const element = this.getElement(objectId);

    storageManager.addMarked({
      objectId,
      listType: this.listType,
    });

    if (element) {
      this.animateElement({ elementId: objectId });
      element.classList.add(cssClasses.markListItem);
    }
  }

  /**
   * Visually unmark a list item.
   * @param {Object} params Parameters.
   * @param {string} params.objectId Id of the object.
   */
  unmarkItem({ objectId }) {
    const element = this.getElement(objectId);

    if (element) {
      storageManager.pullMarked({
        objectId,
        listType: this.listType,
      });

      element.classList.remove(cssClasses.markListItem);
    }
  }

  /**
   * Check if the object should be shown for the user.
   * @param {Object} params Parameters.
   * @param {string} params.changeType Event change type (create/update/remove).
   * @param {Object} params.object Object.
   * @param {Object} params.user Current user.
   * @return {boolean} Should the object be shown?
   */
  shouldFilterItem({
    changeType,
    object,
    user,
  }) {
    if (changeType !== socketManager.ChangeTypes.REMOVE && (this.filter || this.userFilter)) {
      const filterFunc = (rule) => {
        if (rule.shouldInclude) {
          return object[rule.paramName].includes(rule.paramValue);
        }

        return rule.paramValue === object[rule.paramName];
      };
      const userFilterFunc = (rule) => {
        const {
          shouldInclude,
          paramName,
          objectParamName,
          shouldBeTrue = true,
        } = rule;

        if (shouldInclude) {
          const isIncluded = user[paramName].includes(object[objectParamName]);

          return isIncluded === shouldBeTrue;
        }

        const isIncluded = user[paramName] === object[objectParamName];

        return isIncluded === shouldBeTrue;
      };

      if (this.filter) {
        if (this.filter.orCheck && !this.filter.rules.some(filterFunc)) {
          return false;
        }

        if (!this.filter.rules.every(filterFunc)) {
          return false;
        }
      }

      if (this.userFilter) {
        if (this.userFilter.orCheck && !this.userFilter.rules.some(userFilterFunc)) {
          return false;
        }

        if (!this.userFilter.rules.every(userFilterFunc)) {
          return false;
        }
      }
    }

    return true;
  }
}

module.exports = List;
