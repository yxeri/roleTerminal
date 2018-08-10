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

class BaseView {
  constructor({
    classes,
    minAccessLevel,
    elementId = `elem-${Date.now()}`,
  }) {
    this.minAccessLevel = minAccessLevel;
    this.classes = classes;
    this.elementId = elementId;
    this.element = elementCreator.createContainer({
      classes,
      elementId,
    });

    if (minAccessLevel) {
      accessCentral.addAccessElement({
        element: this.element,
        minimumAccessLevel: this.minAccessLevel,
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
    console.log('access show', this.minAccessLevel, this.element);

    if (this.minAccessLevel && this.minAccessLevel > storageManager.getAccessLevel()) {
      return;
    }

    this.element.classList.remove('hide');
  }

  hideView() {
    this.element.classList.add('hide');
  }

  toggleView() {
    if (this.minAccessLevel && this.minAccessLevel > storageManager.getAccessLevel()) {
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
}

module.exports = BaseView;
