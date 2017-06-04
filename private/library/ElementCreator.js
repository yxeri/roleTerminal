/*
 Copyright 2017 Aleksandar Jankovic

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

const soundLibrary = require('./audio/SoundLibrary');

class ElementCreator {
  static createContainer({ classes = [], elementId }) {
    const container = document.createElement('DIV');
    this.setClasses(container, classes);
    this.setElementId(container, elementId);

    return container;
  }

  static createListItem({ element, func, classes }) {
    const listItem = document.createElement('LI');

    if (element) {
      listItem.appendChild(element);
    }

    if (func) {
      listItem.addEventListener('click', func);
    }

    this.setClasses(listItem, classes);

    return listItem;
  }

  static createButton({ func = () => {}, text, classes = [], data }) {
    const button = document.createElement('BUTTON');
    button.appendChild(document.createTextNode(text));
    this.setClasses(button, classes);

    button.addEventListener('click', () => {
      soundLibrary.playSound('button');
      func();
    });

    if (data) {
      button.setAttribute('data', data);
    }

    return button;
  }

  static createList({ elements = [], classes = [], elementId }) {
    const list = document.createElement('UL');
    this.setClasses(list, classes);

    if (elementId) {
      list.setAttribute('id', elementId);
    }

    elements.forEach((item) => {
      list.appendChild(this.createListItem({ element: item }));
    });

    return list;
  }

  static createParagraph({ text, classes = [] }) {
    const paragraph = document.createElement('P');
    this.setClasses(paragraph, classes);
    paragraph.appendChild(document.createTextNode(text));

    return paragraph;
  }

  static createRadioSet({ title, optionName, options = [] }) {
    const fieldset = document.createElement('FIELDSET');
    const legend = document.createElement('LEGEND');
    legend.appendChild(document.createTextNode(title));
    fieldset.appendChild(legend);

    options.forEach((option) => {
      const inputLabel = document.createElement('LABEL');
      inputLabel.setAttribute('for', option.optionId);
      const input = document.createElement('INPUT');
      input.setAttribute('type', 'radio');
      input.setAttribute('id', option.optionId);
      input.setAttribute('name', optionName);

      inputLabel.appendChild(input);
      inputLabel.appendChild(document.createElement('SPAN'));
      inputLabel.appendChild(document.createTextNode(option.optionLabel));
      fieldset.appendChild(inputLabel);
    });

    return fieldset;
  }

  static createInput({ type, placeholder, inputName, isRequired, classes = [], multiLine, maxLength }) {
    const input = multiLine ? document.createElement('TEXTAREA') : document.createElement('INPUT');

    input.setAttribute('placeholder', placeholder);
    input.setAttribute('name', inputName);
    input.setAttribute('type', 'text');

    if (maxLength) { input.setAttribute('maxlength', maxLength); }
    if (type) { input.setAttribute('type', type); }

    if (isRequired) {
      input.addEventListener('blur', () => {
        if (input.value === '') { input.classList.add('markedInput'); }
      });
      input.addEventListener('input', () => { input.classList.remove('markedInput'); });

      input.setAttribute('required', 'true');
    }

    this.setClasses(input, classes);

    return input;
  }

  static createSpan({ text, classes = [], func }) {
    const span = document.createElement('SPAN');

    if (text) {
      span.appendChild(document.createTextNode(text));
    }

    if (func) {
      span.addEventListener('click', () => {
        soundLibrary.playSound('button');
        func();
      });
    }

    this.setClasses(span, classes);

    return span;
  }

  static setElementId(element, id) {
    if (id) { element.setAttribute('id', id); }
  }

  static setButtonText(button, text) { this.replaceOnlyChild(button, document.createTextNode(text)); }

  static setClasses(element, classes = []) {
    classes.forEach(cssClass => element.classList.add(cssClass));
  }

  static replaceOnlyChild(element, newChild) {
    if (element.firstChild) {
      element.replaceChild(newChild, element.firstChild);
    } else {
      element.appendChild(newChild);
    }
  }
}

module.exports = ElementCreator;
