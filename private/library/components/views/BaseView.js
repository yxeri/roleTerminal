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

const elementCreator = require('../../ElementCreator');
const accessCentral = require('../../AccessCentral');
const storageManager = require('../../StorageManager');

const cssClasses = {
  focusElement: 'focusElement',
  markElement: 'markElement',
  newElement: 'newElement',
  removeElement: 'removeElement',
};

class BaseView {
  constructor({
    classes,
    minimumAccessLevel,
    corners = [],
    elementId = `elem-${Date.now()}`,
  }) {
    this.itemChangeTimeout = 800;
    this.minimumAccessLevel = minimumAccessLevel;
    this.classes = classes;
    this.elementId = elementId;
    this.element = elementCreator.createContainer({
      classes,
      elementId,
    });

    corners.forEach((corner) => this.element.appendChild(elementCreator.createContainer({ classes: [corner] })));

    if (minimumAccessLevel) {
      accessCentral.addAccessElement({
        element: this.element,
        minimumAccessLevel: this.minimumAccessLevel,
      });
    }
  }

  replaceOnParent({ element }) {
    const parentElement = this.getParentElement();

    if (parentElement) {
      parentElement.replaceChild(element, this.getThisElement());
    }

    this.element = element;
  }

  addToView({
    element,
    insertBeforeElement,
    shouldPrepend,
  }) {
    if (insertBeforeElement) {
      element.insertBefore(this.element, insertBeforeElement);
    } else if (shouldPrepend) {
      element.insertBefore(this.element, element.firstElementChild);
    } else {
      element.appendChild(this.element);
    }
  }

  getThisElement() {
    return document.getElementById(this.elementId);
  }

  getParentElement() {
    const thisElement = this.getThisElement();

    if (thisElement) {
      return this.getThisElement().parentNode;
    }

    return undefined;
  }

  removeFromView() {
    this.getParentElement().removeChild(this.getThisElement());
  }

  showView() {
    if (this.minimumAccessLevel && this.minimumAccessLevel > storageManager.getAccessLevel()) {
      return;
    }

    this.element.classList.remove('hide');
  }

  hideView() {
    this.element.classList.add('hide');
  }

  toggleView() {
    if (this.minimumAccessLevel && this.minimumAccessLevel > storageManager.getAccessLevel()) {
      return;
    }

    this.element.classList.toggle('hide');
  }

  getElement(elementId) {
    return document.getElementById(`${this.elementId}${elementId}`);
  }

  getElementId() {
    return this.elementId;
  }

  hasAccess({ object, user }) { // eslint-disable-line
    return accessCentral.hasAccessTo({
      objectToAccess: object,
      toAuth: user,
    });
  }

  static findClosestElementId({
    paramName,
    fallbackParamName,
    objects,
    reverse,
    targetVar,
  }) {
    const isNumber = typeof paramName === 'number';
    const closest = isNumber
      ? objects.reduce((previous, current) => {
        const prevVar = previous[paramName] || previous[fallbackParamName];
        const currVar = current[paramName] || current[fallbackParamName];

        if (reverse) {
          return (Math.abs(currVar - targetVar) < Math.abs(prevVar - targetVar))
            ? previous
            : current;
        }

        return (Math.abs(currVar - targetVar) < Math.abs(prevVar - targetVar))
          ? current
          : previous;
      })
      : objects.find((closeObject, index) => {
        if (index >= (objects.length - 1)) {
          return true;
        }

        const closeVar = objects[index][paramName] || objects[index][fallbackParamName];

        if (reverse) {
          return closeVar < targetVar;
        }

        return closeVar > targetVar;
      });

    return closest.objectId;
  }

  removeElement({
    object,
    shouldAnimate = false,
  }) {
    const { objectId } = object;
    const toRemove = this.getElement(objectId);

    if (toRemove) {
      if (shouldAnimate) {
        toRemove.classList.add(cssClasses.removeElement);

        setTimeout(() => {
          const element = this.getElement(objectId);

          if (element) {
            toRemove.parentElement.removeChild(element);
          }
        }, this.itemChangeTimeout / 4);

        return;
      }

      toRemove.parentElement.removeChild(toRemove);
    }
  }

  animateElement({
    elementId,
    element,
  }) {
    const elementToAnimate = element || this.getElement(elementId);

    if (elementToAnimate) {
      elementToAnimate.classList.add(cssClasses.newElement);
      setTimeout(() => { elementToAnimate.classList.remove(cssClasses.newElement); }, this.itemChangeTimeout);
    }
  }
}

module.exports = BaseView;
