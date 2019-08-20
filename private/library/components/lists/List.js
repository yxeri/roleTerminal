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
const accessCentral = require('../../AccessCentral');
const viewTools = require('../../ViewTools');

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
    onToggle,
    imageThumb,
    defaultImage,
    buttons,
    hasOffToggle = false,
    showOff = false,
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
    this.header = null;
    this.onToggle = onToggle;
    this.showOff = showOff;
    this.hasOffToggle = hasOffToggle;
    this.imageThumb = imageThumb;
    this.defaultImage = defaultImage;
    this.buttons = buttons;

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
    const buttons = [];
    this.lastObject = null;

    if (this.title) {
      this.header = elementCreator.createHeader({
        clickFuncs: {
          leftFunc: () => {
            if (this.onToggle) {
              this.onToggle();
            }

            this.listElement.classList.toggle('hide');
            this.header.classList.toggle('expanded');
          },
        },
        classes: ['toggle', 'expanded'],
        elements: [elementCreator.createSpan({ text: this.title, classes: ['listTitle'] })],
      });

      if (this.shouldToggle) {
        listClasses.push('hide');
        this.header.classList.toggle('expanded');
      }

      elements.push(this.header);
    }

    if (this.hasOffToggle && storageManager.getAccessLevel() >= storageManager.getPermissions().IncludeOff.accessLevel) {
      const offButton = elementCreator.createButton({
        image: {
          fileName: 'offgame.png',
          height: 20,
          width: 20,
        },
        clickFuncs: {
          leftFunc: () => {
            this.showOff = !this.showOff;
            this.shouldToggle = false;

            this.appendList();
          },
        },
      });

      buttons.push(offButton);
    }

    if (this.buttons) {
      buttons.push(...this.buttons);
    }

    this.listElement = elementCreator.createList({
      classes: listClasses,
    });

    this.listElement.addEventListener('click', () => {
      if (this.shouldToggle && !viewTools.isLandscape()) {
        this.listElement.classList.toggle('hide');
      }
    });


    if (buttons.length > 0 && storageManager.getAccessLevel() >= accessCentral.AccessLevels.STANDARD) {
      const item = elementCreator.createListItem({
        classes: ['listButtonsItem'],
        elements: [elementCreator.createContainer({ elements: buttons, classes: ['listButtons'] })],
      });

      this.listElement.appendChild(item);
    }

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

  hideList() {
    this.listElement.classList.add('hide');

    if (this.header) {
      this.header.classList.remove('expanded');
    }
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

    if (this.header && marked[this.listType] && marked[this.listType].length > 0) {
      console.log(this.listType, marked[this.listType]);
      this.header.classList.add(cssClasses.markListItem);
    }

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

        if (this.listItemClickFuncs.leftFunc) {
          this.listItemClickFuncs.leftFunc(objectId);
        }

        socketManager.checkAndReconnect();
      },
    };
    const { hasAccess } = accessCentral.hasAccessTo({
      objectToAccess: object,
      toAuth: userComposer.getCurrentUser(),
    });

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

    if (this.listItemClickFuncs.right && (!this.listItemClickFuncs.needsAccess || hasAccess)) {
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
          .filter((field) => {
            return ((this.showOff && field.isOff) || !field.isOff)
              && (typeof object[field.paramName] !== 'undefined' || typeof object[field.fallbackTo] !== 'undefined');
          })
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
            const fragment = document.createDocumentFragment();

            if (func) {
              spanParams.clickFuncs = {
                leftFunc: () => {
                  func(objectId);
                },
              };
            }

            fragment.appendChild(text !== ''
              ? elementCreator.createSpan(spanParams)
              : document.createTextNode(''));

            return fragment;
          });

        const paragraphParams = {
          elements,
          classes: [],
        };

        if (this.listItemClickFuncs.onlyListItemFields && (!this.listItemClickFuncs.needsAccess || hasAccess)) {
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

        paragraphParams.classes = paragraphParams.classes.concat(this.listItemFieldsClasses);

        listItemElements.push(elementCreator.createParagraph(paragraphParams));
      }

      if (this.shouldAppendImage
        && ((object.image && object.image.imageName)
          || (object.images && object.images[0] && object.images[0].imageName)
          || (this.defaultImage))) {
        listItemElements.push(elementCreator.createPicture({
          picture: object.image || object.images[0] || this.defaultImage,
          classes: ['attachedImage'],
          isThumb: this.imageThumb,
          isUploaded: typeof object.image !== 'undefined' || typeof object.images[0] !== 'undefined',
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

    if (!this.listItemClickFuncs.onlyListItemFields && (!this.listItemClickFuncs.needsAccess || hasAccess)) {
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
   * @param {boolean} [params.shouldReplace] Should the list item replace an existing item?
   * @param {boolean} [params.shouldFlash] Should the list item visually flash when added to the DOM?
   */
  addOneItem({
    object,
    shouldReplace = false,
    shouldFlash = false,
  }) {
    const { objectId } = object;
    const newItem = this.createListItem({ object });
    const element = this.getElement(objectId);

    if (shouldFlash) {
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

    if (element) {
      storageManager.addMarked({
        objectId,
        listType: this.listType,
      });

      this.animateElement({ elementId: objectId });
      element.classList.add(cssClasses.markListItem);

      console.log(this.header);

      if (this.header) {
        this.header.classList.add(cssClasses.markListItem);
      }
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

      if (this.header) {
        const marked = storageManager.getMarked();

        if (marked[this.listType] && marked[this.listType].length === 0) {
          this.header.classList.remove(cssClasses.markListItem);
        }
      }
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
