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

const BaseView = require('../BaseView');

const dataHandler = require('../../../data/DataHandler');
const eventCentral = require('../../../EventCentral');
const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');

const ids = {
  UPPERTEXT: 'upperText',
  LOWERTEXT: 'lowerText',
  UPPERBUTTONS: 'upperButtons',
  LOWERBUTTONS: 'lowerButtons',
  INPUTCONTAINER: 'inContainer',
  COVER: 'dialogCover',
};

const cssClasses = {
  COVER: 'cover',
  EMPTYINPUT: 'emptyInput',
};

class BaseDialog extends BaseView {
  constructor({
    upperText,
    lowerText,
    upperButtons,
    lowerButtons,
    inputs,
    classes = [],
    elementId = `elem-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['dialog']),
    });

    this.inputs = inputs;

    const inputContainer = elementCreator.createContainer({
      elementId: `${this.elementId}${ids.INPUTCONTAINER}`,
    });

    this.inputs.forEach((input) => {
      inputContainer.appendChild(input);
    });

    this.element.appendChild(elementCreator.createContainer({
      elementId: ids.UPPERBUTTONS,
      elements: upperButtons,
    }));

    this.element.appendChild(this.createTextContainer({
      text: upperText,
      elementId: ids.UPPERTEXT,
    }));

    this.element.appendChild(this.createTextContainer({
      text: lowerText,
      elementId: ids.LOWERTEXT,
    }));

    this.element.appendChild(inputContainer);

    this.element.appendChild(elementCreator.createContainer({
      elementId: ids.LOWERBUTTONS,
      elements: lowerButtons,
    }));
  }

  addToView({
    element,
    insertBeforeElement,
    shouldPrepend,
  }) {
    super.addToView({
      element,
      insertBeforeElement,
      shouldPrepend,
    });

    element.appendChild(elementCreator.createContainer({
      elementId: ids.COVER,
      classes: [cssClasses.COVER],
    }));
  }

  removeFromView() {
    const parentElement = this.getParentElement();

    super.removeFromView();

    parentElement.removeChild(document.getElementById(ids.COVER));
  }

  createTextContainer({ elementId, text = [] }) {
    const paragraphs = text.map((line) => {
      return elementCreator.createParagraph({
        elements: [elementCreator.createSpan({ text: line })],
      });
    });

    return elementCreator.createContainer({
      elementId: `${this.elementId}${elementId}`,
      classes: [elementId],
      elements: paragraphs,
    });
  }

  hasEmptyRequiredInputs() {
    const emptyInputs = this.inputs
      .filter(input => input.getAttribute('required') === 'true')
      .filter(input => input.value === '');

    emptyInputs.forEach((input) => {
      input.classList.add(cssClasses.EMPTYINPUT);
    });

    return emptyInputs.length > 0;
  }

  updateUpperText({ text, shouldAppend }) {
    if (shouldAppend) {
      this.getElement(ids.UPPERTEXT).appendChild(elementCreator.createParagraph({ text }));
    } else {
      this.element.replaceChild(this.createTextContainer({ text, elementId: ids.UPPERTEXT }), this.getElement(ids.UPPERTEXT));
    }
  }

  updateLowerText({ text, shouldAppend }) {
    if (shouldAppend) {
      this.getElement(ids.LOWERTEXT).appendChild(elementCreator.createParagraph({ text }));
    } else {
      this.element.replaceChild(this.createTextContainer({ text, elementId: ids.LOWERTEXT }), this.getElement(ids.LOWERTEXT));
    }
  }

  addInput({ input }) {
    const inputContainer = `${this.elementId}${ids.INPUTCONTAINER}`;

    inputContainer.appendChild(input);
    this.inputs.push(input);
  }

  getInputValue(elementId) {
    const input = this.getElement(elementId);

    return input ? input.value || '' : '';
  }

  setInputValue({ elementId, value }) {
    const input = this.getElement(elementId);

    if (input) {
      input.setAttribute('value', value);
    }
  }
}

module.exports = BaseDialog;
