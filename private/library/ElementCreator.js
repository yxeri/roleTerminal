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

const mouseHandler = require('./MouseHandler');

const cssClasses = {
  emptyInput: 'emptyInput',
  clickable: 'clickable',
};

class ElementCreator {
  static setElementId(element, id) {
    if (id) {
      element.setAttribute('id', id);
    }
  }

  static setName(element, name) {
    if (name) {
      element.setAttribute('name', name);
    }
  }

  static setClasses(element, classes = []) {
    classes.forEach(cssClass => element.classList.add(cssClass));
  }

  static setClickFuncs(element, clickFuncs) {
    if (clickFuncs && (clickFuncs.leftFunc || clickFuncs.right)) {
      const params = clickFuncs;
      params.element = element;

      mouseHandler.addClickListener(params);

      element.classList.add(cssClasses.clickable);
    }
  }

  static createList({
    elementId,
    classes = [],
  }) {
    const list = document.createElement('ul');

    this.setClasses(list, classes);
    this.setElementId(list, elementId);

    return list;
  }

  static createListItem({
    elements,
    clickFuncs,
    classes,
    elementId,
  }) {
    const listItem = document.createElement('li');

    if (elements) {
      elements.forEach(element => listItem.appendChild(element));
    }

    this.setClickFuncs(listItem, clickFuncs);
    this.setElementId(listItem, elementId);
    this.setClasses(listItem, classes);

    return listItem;
  }

  static createSpan({
    text,
    clickFuncs,
    elementId,
    classes,
  }) {
    const span = document.createElement('span');

    if (text) {
      span.appendChild(document.createTextNode(text));
    }

    this.setElementId(span, elementId);
    this.setClickFuncs(span, clickFuncs);
    this.setClasses(span, classes);

    return span;
  }

  static createButton({
    text,
    clickFuncs,
    elementId,
    classes = [],
  }) {
    const span = this.createSpan({
      classes: classes.concat(['button']),
    });
    const button = document.createElement('button');

    button.appendChild(document.createTextNode(text));
    span.appendChild(button);
    this.setElementId(button, elementId);
    this.setClickFuncs(button, clickFuncs);

    return span;
  }

  static createContainer({
    elementId,
    classes,
    elements,
    name,
  }) {
    const container = document.createElement('div');

    if (elements) {
      elements.forEach(element => container.appendChild(element));
    }

    this.setClasses(container, classes);
    this.setElementId(container, elementId);
    this.setName(container, name);

    return container;
  }

  /**
   * Create a paragraph element.
   * Setting elements will attach them to the paragraph. Otherwise, text will be used to attach a text node.
   * @param {Object} params - Parameters.
   * @param {Object[]} [params.elements] - Elements to attach.
   * @param {string} [params.text] - Text to add to the paragraph. It is overriden by elements.
   * @param {string[]} [params.classes] - Css classes.
   * @return {HTMLParagraphElement} Paragraph element.
   */
  static createParagraph({
    elements,
    text,
    classes,
  }) {
    const paragraph = document.createElement('p');

    if (elements) {
      elements.forEach(element => paragraph.appendChild(element));
    } else {
      paragraph.appendChild(document.createTextNode(text));
    }

    this.setClasses(paragraph, classes);

    return paragraph;
  }

  static createInput({
    type,
    placeholder,
    inputName,
    isRequired,
    multiLine,
    maxLength,
    elementId,
    classes,
  }) {
    const input = multiLine ? document.createElement('textarea') : document.createElement('input');

    input.setAttribute('placeholder', placeholder);
    input.setAttribute('name', inputName);

    if (maxLength) { input.setAttribute('maxlength', maxLength); }

    if (type) {
      input.setAttribute('type', type);
    } else {
      input.setAttribute('type', 'text');
    }

    if (isRequired) {
      input.addEventListener('blur', () => {
        if (input.value === '') { input.classList.add(cssClasses.emptyInput); }
      });
      input.addEventListener('input', () => { input.classList.remove(cssClasses.emptyInput); });

      input.setAttribute('required', 'true');
    }

    this.setElementId(input, elementId);
    this.setClasses(input, classes);

    return input;
  }

  static createHeader({ elements }) {
    const header = document.createElement('header');

    if (elements) {
      elements.forEach(element => header.appendChild(element));
    }

    return header;
  }

  static createArticle({
    classes,
    elements,
    footerElement,
    headerElement,
    elementId,
  }) {
    const article = document.createElement('article');

    if (headerElement) {
      const header = document.createElement('header');

      header.appendChild(headerElement);
      article.appendChild(header);
    }

    if (elements) {
      elements.forEach(element => article.appendChild(element));
    }

    if (footerElement) {
      const footer = document.createElement('footer');

      footer.appendChild(footerElement);
      article.appendChild(footer);
    }

    this.setElementId(article, elementId);
    this.setClasses(article, classes);

    return article;
  }

  static createSection({
    classes,
    elements,
    footerElement,
    headerElement,
    elementId,
  }) {
    const section = document.createElement('section');

    if (headerElement) {
      const header = document.createElement('header');

      header.appendChild(headerElement);
      section.appendChild(header);
    }

    if (elements) {
      elements.forEach(element => section.appendChild(element));
    }

    if (footerElement) {
      const footer = document.createElement('footer');

      footer.appendChild(footerElement);
      section.appendChild(footer);
    }

    this.setElementId(section, elementId);
    this.setClasses(section, classes);

    return section;
  }
}

module.exports = ElementCreator;
