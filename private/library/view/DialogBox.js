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
const keyHandler = require('../KeyHandler');
const elementCreator = require('../ElementCreator');

class DialogBox extends View {
  constructor({ buttons, description = [], extraDescription = [], inputs = [] }) {
    super({ isFullscreen: false });

    const leftCharCode = buttons.left.text.toUpperCase().charCodeAt(0);
    let rightCharCode = buttons.right.text.toUpperCase().charCodeAt(0);

    if (leftCharCode === rightCharCode) { rightCharCode = buttons.right.text.toUpperCase().charCodeAt(1); }

    this.keyTriggers = [
      { charCode: leftCharCode, func: buttons.left.eventFunc },
      { charCode: rightCharCode, func: buttons.right.eventFunc },
    ];

    this.keyTriggers.forEach(({ charCode, func }) => keyHandler.addKey(charCode, func));

    this.descriptionContainer = document.createElement('DIV');
    this.descriptionContainer.classList.add('description');
    description.forEach(text => this.descriptionContainer.appendChild(elementCreator.createParagraph({ text })));

    this.extraDescription = document.createElement('DIV');
    extraDescription.forEach(text => this.extraDescription.appendChild(elementCreator.createParagraph({ text })));

    this.descriptionContainer.appendChild(this.extraDescription);

    const closeButton = elementCreator.createButton({
      text: 'X',
      func: () => { this.removeView(); },
      classes: ['closeButton'],
    });

    const leftButtonChar = buttons.left.text.charAt(0);
    let rightButtonChar = buttons.right.text.charAt(0);
    let rightButtonText = `[${rightButtonChar.toUpperCase()}]${buttons.right.text.slice(1)}`;

    if (leftButtonChar.toLowerCase() === rightButtonChar.toLowerCase()) {
      rightButtonChar = buttons.right.text.charAt(1);
      rightButtonText = `${buttons.right.text.charAt(0).toUpperCase()}[${buttons.right.text.charAt(1)}]${buttons.right.text.slice(2)}`;
    }

    this.buttonsContainer = document.createElement('DIV');
    this.buttonsContainer.classList.add('buttons');
    this.buttonsContainer.appendChild(elementCreator.createButton({
      text: `[${leftButtonChar.toUpperCase()}]${buttons.left.text.slice(1)}`,
      func: buttons.left.eventFunc,
    }));
    this.buttonsContainer.appendChild(elementCreator.createButton({
      text: rightButtonText,
      func: buttons.right.eventFunc,
    }));

    this.inputs = [];

    this.element.appendChild(closeButton);
    this.element.appendChild(this.descriptionContainer);

    inputs.forEach((input) => {
      const inputElement = elementCreator.createInput(input);

      if (inputElement.type === 'textarea') {
        inputElement.addEventListener('input', () => {
          inputElement.style.height = 'auto';
          inputElement.style.height = `${inputElement.scrollHeight}px`;
        });
      }

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
    const requiredFields = this.inputs.filter(({ inputElement }) => inputElement.getAttribute('required') === 'true');
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
    this.inputs[0].inputElement.focus();
  }

  removeView() {
    this.element.parentNode.removeChild(this.cover);
    this.keyTriggers.forEach(({ charCode }) => keyHandler.removeKey(charCode));
    super.removeView();
  }

  addInput(input) {
    const inputElement = elementCreator.createInput(input);

    this.inputs.push({ inputName: input.inputName, inputElement });
    this.element.insertBefore(inputElement, this.buttonsContainer);
  }

  findInput(sentInputName) {
    return this.inputs.find(({ inputName }) => sentInputName === inputName);
  }

  removeInput(sentInputName) {
    const inputIndex = this.inputs.findIndex(({ inputName }) => sentInputName === inputName);

    if (inputIndex > -1) {
      this.element.removeChild(this.inputs[inputIndex].inputElement);
      this.inputs.splice(inputIndex, 1);
    }
  }

  clearInput(sentInputName) {
    const input = this.findInput(sentInputName);

    if (input) { input.inputElement.value = ''; }
  }

  focusInput(sentInputName) {
    const input = this.findInput(sentInputName);

    if (input) { input.inputElement.focus(); }
  }

  markInput(sentInputName) {
    const input = this.findInput(sentInputName);

    if (input) { input.inputElement.classList.add('markedInput'); }
  }

  changeExtraDescription({ text = [] }) {
    const fragment = document.createDocumentFragment();

    text.forEach((line) => {
      const paragraph = document.createElement('P');

      paragraph.classList.add('flash');
      paragraph.appendChild(document.createTextNode(line));
      fragment.appendChild(paragraph);
    });

    this.extraDescription.innerHTML = ' ';
    this.extraDescription.appendChild(fragment);
  }
}

module.exports = DialogBox;
