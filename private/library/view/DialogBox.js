/*
 Copyright 2016 Aleksandar Jankovic

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

const View = require('./base/View');

// TODO This should be a class
/**
 * Create and return input element
 * @param {Object} input - Input
 * @returns {HTMLElement} - Input element
 */
function createInput({ placeholder, inputName, inputType, required, extraClass }) {
  const inputElement = document.createElement('INPUT');

  inputElement.setAttribute('placeholder', placeholder);
  inputElement.setAttribute('name', inputName);

  if (inputType) {
    inputElement.setAttribute('type', inputType);
  }

  if (required) {
    inputElement.addEventListener('blur', () => {
      if (inputElement.value === '') {
        inputElement.classList.add('markedInput');
      }
    });

    inputElement.addEventListener('input', () => {
      inputElement.classList.remove('markedInput');
    });

    inputElement.setAttribute('required', 'true');
  }

  if (extraClass) {
    inputElement.classList.add(extraClass);
  }

  return inputElement;
}

/**
 * Create and return a button element
 * @param {string} text - Text in the button
 * @param {Function} eventFunc - Callback when button is clicked
 * @returns {Element} Button element
 */
function createButton({ text, eventFunc }) {
  const buttonElement = document.createElement('BUTTON');

  buttonElement.appendChild(document.createTextNode(text));
  buttonElement.addEventListener('click', eventFunc);

  return buttonElement;
}

/**
 * Creates and returns a paragraph element
 * @param {string} line - Line of text
 * @returns {Element} Paragraph
 */
function createParagraph(line) {
  const paragraph = document.createElement('P');

  paragraph.appendChild(document.createTextNode(line));

  return paragraph;
}

class DialogBox extends View {
  constructor({ buttons, description = [], extraDescription = [], keyHandler, inputs = [] }) {
    super({ isFullscreen: false });

    this.keyHandler = keyHandler;

    // TODO Duplicate code. Should this be moved into DialogBox?
    const leftCharCode = buttons.left.text.toUpperCase().charCodeAt(0);
    let rightCharCode = buttons.right.text.toUpperCase().charCodeAt(0);

    if (leftCharCode === rightCharCode) {
      rightCharCode = buttons.right.text.toUpperCase().charCodeAt(1);
    }

    this.keyTriggers = [
      { charCode: leftCharCode, func: buttons.left.eventFunc },
      { charCode: rightCharCode, func: buttons.right.eventFunc },
    ];

    this.keyTriggers.forEach(({ charCode, func }) => this.keyHandler.addKey(charCode, func));

    this.descriptionContainer = document.createElement('DIV');
    this.descriptionContainer.classList.add('description');
    description.forEach(line => this.descriptionContainer.appendChild(createParagraph(line)));

    this.extraDescription = document.createElement('DIV');
    extraDescription.forEach(line => this.extraDescription.appendChild(createParagraph(line)));

    this.descriptionContainer.appendChild(this.extraDescription);

    const closeButton = createButton({
      text: 'X',
      eventFunc: () => {
        this.removeView();
      },
    });
    closeButton.classList.add('closeButton');

    const leftButtonChar = buttons.left.text.charAt(0);
    let rightButtonChar = buttons.right.text.charAt(0);
    let rightButtonText = `[${rightButtonChar.toUpperCase()}]${buttons.right.text.slice(1)}`;

    if (leftButtonChar.toLowerCase() === rightButtonChar.toLowerCase()) {
      rightButtonChar = buttons.right.text.charAt(1);
      rightButtonText = `${buttons.right.text.charAt(0).toUpperCase()}[${buttons.right.text.charAt(1)}]${buttons.right.text.slice(2)}`;
    }

    this.buttonsContainer = document.createElement('DIV');
    this.buttonsContainer.classList.add('buttons');
    this.buttonsContainer.appendChild(createButton({
      text: `[${leftButtonChar.toUpperCase()}]${buttons.left.text.slice(1)}`,
      eventFunc: buttons.left.eventFunc,
    }));
    this.buttonsContainer.appendChild(createButton({
      text: rightButtonText,
      eventFunc: buttons.right.eventFunc,
    }));

    this.inputs = [];

    this.element.appendChild(closeButton);
    this.element.appendChild(this.descriptionContainer);

    inputs.forEach((input) => {
      const inputElement = createInput(input);

      this.inputs.push({ inputName: input.inputName, inputElement });
      this.element.appendChild(inputElement);
    });

    this.element.appendChild(this.buttonsContainer);
    this.element.classList.add('dialogBox');

    this.cover = document.createElement('DIV');
    this.cover.setAttribute('id', 'cover');
  }

  /**
   * Marks fields that are empty. Returns true if any of the fields were empty
   * @returns {boolean} Are any of the fields empty?
   */
  markEmptyFields() {
    const requiredFields = this.inputs.filter(({ inputElement }) => inputElement.getAttribute('required') === true);
    let emptyFields = false;

    requiredFields.forEach(({ inputElement: input }) => {
      if (input.value === '') {
        emptyFields = true;
        this.markInput(input.getAttribute('name'));
      }
    });

    return emptyFields;
  }

  appendTo(parentElement) {
    parentElement.appendChild(this.cover);
    super.appendTo(parentElement);
  }

  removeView() {
    this.element.parentNode.removeChild(this.cover);
    this.keyTriggers.forEach(({ charCode }) => this.keyHandler.removeKey(charCode));
    super.removeView();
  }

  addInput(input) {
    const inputElement = createInput(input);

    this.inputs.push({ inputName: input.inputName, inputElement });
    this.element.insertBefore(inputElement, this.buttonsContainer);
  }

  removeInput(sentInputName) {
    const inputIndex = this.inputs.findIndex(({ inputName }) => sentInputName === inputName);

    if (inputIndex > -1) {
      this.element.removeChild(this.inputs[inputIndex].inputElement);
      this.inputs.splice(inputIndex, 1);
    }
  }

  clearInput(sentInputName) {
    const input = this.inputs.find(({ inputName }) => sentInputName === inputName);

    if (input) {
      input.inputElement.value = '';
    }
  }

  focusInput(sentInputName) {
    const input = this.inputs.find(({ inputName }) => sentInputName === inputName);

    if (input) {
      input.inputElement.focus();
    }
  }

  markInput(sentInputName) {
    const input = this.inputs.find(({ inputName }) => sentInputName === inputName);

    if (input) {
      input.inputElement.classList.add('markedInput');
    }
  }

  changeExtraDescription({ text = [] }) {
    const fragment = document.createDocumentFragment();

    text.forEach((line) => {
      const paragraph = document.createElement('P');

      paragraph.appendChild(document.createTextNode(line));
      fragment.appendChild(paragraph);
    });

    this.extraDescription.innerHTML = ' ';
    this.extraDescription.appendChild(fragment);
  }
}

module.exports = DialogBox;
