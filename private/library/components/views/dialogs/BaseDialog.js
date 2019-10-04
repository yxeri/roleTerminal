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

const BaseView = require('../BaseView');

const elementCreator = require('../../../ElementCreator');
const keyHandler = require('../../../KeyHandler');
const viewSwitcher = require('../../../ViewSwitcher');
const voiceCommander = require('../../../VoiceCommander');

const ids = {
  UPPERTEXT: 'upperText',
  LOWERTEXT: 'lowerText',
  UPPERBUTTONS: 'upperButtons',
  LOWERBUTTONS: 'lowerButtons',
  INPUTCONTAINER: 'inContainer',
  COVER: 'dialogCover',
  IMAGES: 'imagesContainer',
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
    timeout,
    images = [],
    inputs = [],
    classes = [],
    elementId = `elem-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['dialog']),
    });

    this.timeout = timeout;
    this.inputs = inputs;

    this.inputContainer = elementCreator.createContainer({
      elementId: ids.INPUTCONTAINER,
      classes: [ids.INPUTCONTAINER],
    });

    this.inputs.forEach((input) => {
      this.appendInput({ container: this.inputContainer, input });
    });

    this.element.appendChild(elementCreator.createContainer({
      elementId: ids.UPPERBUTTONS,
      elements: upperButtons,
      classes: [ids.UPPERBUTTONS],
    }));

    this.element.appendChild(this.createTextContainer({
      text: upperText,
      elementId: ids.UPPERTEXT,
      classes: [ids.UPPERTEXT],
    }));

    this.element.appendChild(elementCreator.createContainer({
      elementId: ids.IMAGES,
      elements: images,
      classes: [ids.IMAGES],
    }));

    this.element.appendChild(this.createTextContainer({
      text: lowerText,
      elementId: ids.LOWERTEXT,
      classes: [ids.LOWERTEXT],
    }));

    this.element.appendChild(this.inputContainer);

    this.element.appendChild(elementCreator.createContainer({
      elementId: `${this.elementId}${ids.LOWERBUTTONS}`,
      elements: lowerButtons,
      classes: [ids.LOWERBUTTONS],
    }));
  }

  addToView({
    insertBeforeElement,
    shouldPrepend,
    element = viewSwitcher.getParentElement(),
  }) {
    element.appendChild(elementCreator.createContainer({
      elementId: ids.COVER,
      classes: [cssClasses.COVER],
    }));

    super.addToView({
      element,
      insertBeforeElement,
      shouldPrepend,
    });
    keyHandler.pause();
    voiceCommander.pause();

    if (this.inputs.length > 0) {
      this.inputs[0].focus();
    }

    if (this.timeout) {
      setTimeout(() => { this.removeFromView(); }, this.timeout);
    }
  }

  removeFromView() {
    const parent = this.getParentElement();

    if (parent) {
      parent.removeChild(document.getElementById(ids.COVER));

      super.removeFromView();
      keyHandler.unpause();
      voiceCommander.unpause();
    }
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
      .filter((input) => input.getAttribute('required') === 'true')
      .filter((input) => {
        return (input.value === '')
          || (input.tagName.toLowerCase() === 'select'
            && (!input.selectedOptions || Array.from(input.selectedOptions).every((selected) => selected.getAttribute('value') === '')));
      });

    emptyInputs.forEach((input) => {
      BaseDialog.markInput({ input });
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

  static markInput({ input }) {
    input.classList.add(cssClasses.EMPTYINPUT);
  }

  appendInput({ container, input }) {
    const inputToAdd = input;

    if (inputToAdd.tagName === 'LABEL') {
      const inputElement = inputToAdd.firstElementChild;

      inputElement.setAttribute('id', `${this.elementId}${inputElement.getAttribute('id')}`);
    } else {
      inputToAdd.setAttribute('id', `${this.elementId}${inputToAdd.getAttribute('id')}`);
    }

    container.appendChild(input);
  }

  getInputValue(elementId, type = '') {
    const input = this.getElement(elementId);

    if (input) {
      switch (type) {
        case 'select': {
          return Array.from(input.selectedOptions)
            .filter((selected) => selected.getAttribute('value') !== '')
            .map((selected) => selected.getAttribute('value'));
        }
        case 'checkBox': {
          const { checked } = input;

          return checked;
        }
        default: {
          const { value } = input;

          return value || '';
        }
      }
    }

    return '';
  }

  setInputValue({ elementId, value }) {
    const input = this.getElement(elementId);

    if (input) {
      input.setAttribute('value', value);
    }
  }

  addBottomButtons({ buttons = [] }) {
    const fragment = document.createDocumentFragment();

    buttons.forEach((button) => {
      fragment.appendChild(button);
    });

    this.getElement(ids.LOWERBUTTONS).appendChild(fragment);
  }
}

module.exports = BaseDialog;
