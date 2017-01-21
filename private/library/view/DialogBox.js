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

class DialogBox extends View {
  constructor({ buttons, text, keyHandler, keyTriggers = new Map(), inputs = [] }) {
    super({ isFullscreen: false });

    this.keyHandler = keyHandler;
    this.keyTriggers = keyTriggers;

    this.keyTriggers.forEach((value, key) => this.keyHandler.addKey(key, value));

    this.descriptionContainer = document.createElement('DIV');
    this.descriptionContainer.classList.add('description');

    for (const line of text) {
      const paragraph = document.createElement('P');

      paragraph.appendChild(document.createTextNode(line));
      this.descriptionContainer.appendChild(paragraph);
    }

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

    this.inputs = new Map();

    this.element.appendChild(closeButton);
    this.element.appendChild(this.descriptionContainer);

    for (const input of inputs) {
      const inputElement = createInput(input);

      this.inputs.set(input.inputName, inputElement);
      this.element.appendChild(inputElement);
    }

    this.element.appendChild(this.buttonsContainer);
    this.element.classList.add('dialogBox');

    this.cover = document.createElement('DIV');
    this.cover.setAttribute('id', 'cover');
  }

  appendTo(parentElement) {
    parentElement.appendChild(this.cover);
    super.appendTo(parentElement);
  }

  removeView() {
    this.element.parentNode.removeChild(this.cover);
    this.keyTriggers.forEach((value, key) => this.keyHandler.removeKey(key));
    super.removeView();
  }

  addInput(input) {
    const inputElement = createInput(input);

    this.inputs.set(input.inputName, inputElement);
    this.element.insertBefore(inputElement, this.buttonsContainer);
  }

  removeInput(inputName) {
    const input = this.inputs.get(inputName);

    if (input) {
      this.element.removeChild(input);
      this.inputs.delete(inputName);
    }
  }

  clearInput(inputName) {
    const input = this.inputs.get(inputName);

    if (input) {
      input.value = '';
    }
  }

  focusInput(inputName) {
    const input = this.inputs.get(inputName);

    if (input) {
      input.focus();
    }
  }

  markInput(inputName) {
    const input = this.inputs.get(inputName);

    if (input) {
      input.classList.add('markedInput');
    }
  }

  changeDescription({ text, shouldAppend }) {
    if (shouldAppend) {
      const newParagraph = document.createElement('P');
      newParagraph.appendChild(document.createTextNode(text));
      newParagraph.setAttribute('name', 'info');

      const lastChildName = this.descriptionContainer.lastChild.getAttribute('name');

      console.log('name:', lastChildName);
      console.log(this.descriptionContainer.lastChild);

      console.log(lastChildName !== null);
      console.log(lastChildName === 'info');

      if (lastChildName !== null && lastChildName === 'info') {
        this.descriptionContainer.replaceChild(newParagraph, this.descriptionContainer.lastChild);
      } else {
        this.descriptionContainer.appendChild(newParagraph);
      }
    } else {
      this.descriptionContainer.replaceChild(document.createTextNode(text), this.descriptionContainer.firstChild);
    }
  }
}

module.exports = DialogBox;
