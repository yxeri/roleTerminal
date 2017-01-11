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

const View = require('./View');

/**
 * Create and return input element
 * @param {Object} input - Input
 * @returns {HTMLElement} - Input element
 */
function createInput(input) {
  const inputElement = document.createElement('INPUT');

  inputElement.setAttribute('placeholder', input.placeholder);
  inputElement.setAttribute('name', input.inputName);

  if (input.inputType) {
    inputElement.setAttribute('type', input.inputType);
  }

  if (input.required) {
    inputElement.addEventListener('blur', () => {
      if (inputElement.value === '') {
        inputElement.classList.add('markedInput');
      }
    });

    inputElement.addEventListener('input', () => {
      inputElement.classList.remove('markedInput');
    });
  }

  if (input.extraClass) {
    inputElement.classList.add(input.extraClass);
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
  constructor({ buttons, descriptionText, inputs = [] }) {
    super({ isFullscreen: false });

    this.descriptionContainer = document.createElement('DIV');
    this.descriptionContainer.classList.add('description');
    const paragraph = document.createElement('P');
    paragraph.appendChild(document.createTextNode(descriptionText));
    this.descriptionContainer.appendChild(paragraph);

    const closeButton = createButton({
      text: 'X',
      eventFunc: () => {
        this.removeView();
      },
    });
    closeButton.classList.add('closeButton');

    this.leftButton = createButton({
      text: `[${buttons.left.text.charAt(0).toUpperCase()}]${buttons.left.text.slice(1)}`,
      eventFunc: buttons.left.eventFunc,
    });
    this.rightButton = createButton({
      text: `[${buttons.right.text.charAt(0).toUpperCase()}]${buttons.right.text.slice(1)}`,
      eventFunc: buttons.right.eventFunc,
    });
    this.inputs = new Map();

    this.element.appendChild(closeButton);
    this.element.appendChild(this.descriptionContainer);

    for (const input of inputs) {
      const inputElement = createInput(input);

      this.inputs.set(input.inputName, inputElement);
      this.element.appendChild(inputElement);
    }

    this.element.appendChild(this.leftButton);
    this.element.appendChild(this.rightButton);
    this.element.classList.add('dialogBox');
  }

  addInput(input) {
    const inputElement = createInput(input);

    this.inputs.set(input.inputName, inputElement);
    this.element.insertBefore(inputElement, this.leftButton);
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
