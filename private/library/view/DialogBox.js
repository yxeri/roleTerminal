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
  constructor({ buttons, descriptionText, parentElement, inputs = [] }) {
    super({ isFullscreen: false });

    const descriptionContainer = document.createElement('DIV');
    descriptionContainer.classList.add('description');
    descriptionContainer.appendChild(document.createTextNode(descriptionText));

    this.leftButton = createButton({
      text: `[${buttons.left.text.charAt(0).toUpperCase()}]${buttons.left.text.slice(1)}`,
      eventFunc: buttons.left.eventFunc,
    });
    this.rightButton = createButton({
      text: `[${buttons.right.text.charAt(0).toUpperCase()}]${buttons.right.text.slice(1)}`,
      eventFunc: buttons.right.eventFunc,
    });
    this.inputs = [];

    this.element.appendChild(descriptionContainer);

    for (const input of inputs) {
      const inputElement = createInput(input);

      this.inputs.push(inputElement);
      this.element.appendChild(inputElement);
    }

    this.element.appendChild(this.leftButton);
    this.element.appendChild(this.rightButton);
    this.element.classList.add('dialogBox');

    if (parentElement) {
      this.appendTo(parentElement);
    }
  }

  addInput(input) {
    const inputElement = createInput(input);

    this.inputs.push(inputElement);
    this.element.appendChild(inputElement);
  }
}

module.exports = DialogBox;
