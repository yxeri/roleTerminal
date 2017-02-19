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

class ElementCreator {
  static createContainer({ classes = [], elementId }) {
    const container = document.createElement('DIV');
    this.setClasses(container, classes);
    this.setElementId(container, elementId);

    return container;
  }

  static createListItem({ element, func, classes }) {
    const listItem = document.createElement('LI');
    listItem.appendChild(element);
    this.setClasses(listItem, classes);

    if (func) { listItem.addEventListener('click', func); }

    return listItem;
  }

  static createButton({ func, text, classes = [] }) {
    const button = document.createElement('BUTTON');
    button.appendChild(document.createTextNode(text));
    this.setClasses(button, classes);

    if (func) { button.addEventListener('click', func); }

    return button;
  }

  static createList({ elements = [], classes = [] }) {
    const list = document.createElement('UL');
    this.setClasses(list, classes);

    elements.forEach((item) => { list.appendChild(this.createListItem({ element: item })); });

    return list;
  }

  static createParagraph({ text }) {
    const paragraph = document.createElement('P');
    paragraph.appendChild(document.createTextNode(text));

    return paragraph;
  }

  static createInput({ type, placeholder, inputName, isRequired, classes = [] }) {
    const input = document.createElement('INPUT');

    input.setAttribute('placeholder', placeholder);
    input.setAttribute('name', inputName);

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
