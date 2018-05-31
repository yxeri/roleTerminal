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

/**
 * Set an Id on the element.
 * @param {HTMLElement} element - Element to add an Id to.
 * @param {string} id - Id to add.
 */
function setElementId(element, id) {
  if (id) {
    element.setAttribute('id', id);
  }
}

/**
 * Set a name on the element.
 * @param {HTMLElement} element - Element to add a name to.
 * @param {string} name - Name to add.
 */
function setName(element, name) {
  if (name) {
    element.setAttribute('name', name);
  }
}

/**
 * Set classes on the element.
 * @param {HTMLElement} element - Element to add classes to.
 * @param {string[]} classes - Classes to add.
 */
function setClasses(element, classes = []) {
  classes.forEach(cssClass => element.classList.add(cssClass));
}

/**
 * Set click listeners on the element.
 * @param {HTMLElement} element - Element to add click listeners to.
 * @param {Object} clickFuncs - Functions to call on clicks.
 * @param {Function} clickFuncs.leftFunc - Function that is called on left click.
 * @param {Function} clickFuncs.right - Function that is called on right click.
 */
function setClickFuncs(element, clickFuncs) {
  if (clickFuncs && (clickFuncs.leftFunc || clickFuncs.right)) {
    const params = clickFuncs;
    params.element = element;

    mouseHandler.addClickListener(params);

    element.classList.add(cssClasses.clickable);
  }
}

/**
 * Create an element and set the set parameters.
 * @param {Object} params - Parameters.
 * @param {string} params.elementType - Type of element to create.
 * @param {string} [params.elementId] - Id of the element.
 * @param {string[]} [params.classes] - CSS classes.
 * @param {Function} [params.clickFuncs] - Functions called on clicks.
 * @param {string} [params.name] - Name of the element.
 * @return {HTMLElement} The created element.
 */
function createBaseElement({
  elementId,
  classes,
  elementType,
  clickFuncs,
  name,
}) {
  const element = document.createElement(elementType);

  setClasses(element, classes);
  setElementId(element, elementId);
  setClickFuncs(element, clickFuncs);
  setName(element, name);

  return element;
}

class ElementCreator {
  static createList({
    elementId,
    items = [],
    classes = [],
  }) {
    const list = createBaseElement({
      elementId,
      classes,
      elementType: 'ul',
    });

    items.forEach((item) => {
      list.appendChild(this.createListItem(item));
    });

    return list;
  }

  static createPicture({
    picture,
    clickFuncs,
    classes,
    elementId,
  }) {
    const pictureElement = createBaseElement({
      elementId,
      classes,
      clickFuncs,
      elementType: 'img',
    });

    pictureElement.setAttribute('src', picture.url);

    if (picture.width) { pictureElement.setAttribute('style', `${pictureElement.getAttribute('style') || ''} width: ${picture.width};`); }
    if (picture.height) { pictureElement.setAttribute('style', `${pictureElement.getAttribute('style') || ''} height: ${picture.height};`); }

    return pictureElement;
  }

  static createListItem({
    elements,
    clickFuncs,
    classes,
    elementId,
  }) {
    const listItem = createBaseElement({
      elementId,
      classes,
      clickFuncs,
      elementType: 'li',
    });

    if (elements) {
      elements.forEach(element => listItem.appendChild(element));
    }

    return listItem;
  }

  static createSpan({
    text,
    clickFuncs,
    elementId,
    classes,
    spanType,
  }) {
    const span = createBaseElement({
      elementId,
      classes,
      clickFuncs,
      elementType: spanType || 'span',
    });

    if (text) {
      span.appendChild(document.createTextNode(text));
    }

    return span;
  }

  static createButton({
    text,
    clickFuncs,
    elementId,
    classes = [],
  }) {
    const span = this.createSpan({
      classes: classes.concat(['button', 'clickable']),
    });
    const button = createBaseElement({
      elementId,
      clickFuncs,
      classes,
      elementType: 'button',
    });

    button.appendChild(document.createTextNode(text));
    span.appendChild(button);

    return span;
  }

  static createContainer({
    elementId,
    classes,
    elements,
    name,
    clickFuncs,
  }) {
    const container = createBaseElement({
      elementId,
      classes,
      name,
      clickFuncs,
      elementType: 'div',
    });

    if (elements) {
      elements.forEach(element => container.appendChild(element));
    }

    return container;
  }

  /**
   * Create a paragraph element.
   * Setting elements will attach them to the paragraph. Otherwise, text will be used to attach a text node.
   * @param {Object} params - Parameters.
   * @param {Object[]} [params.elements] - Elements to attach.
   * @param {string} [params.text] - Text to add to the paragraph. It is overriden by elements.
   * @param {string[]} [params.classes] - Css classes.
   * @return {HTMLElement} Paragraph element.
   */
  static createParagraph({
    elements,
    text,
    classes = [],
  }) {
    const paragraph = createBaseElement({
      classes: classes.concat(['button']),
      elementType: 'p',
    });

    if (elements) {
      elements.forEach(element => paragraph.appendChild(element));
    } else {
      paragraph.appendChild(document.createTextNode(text));
    }

    return paragraph;
  }

  static createInput({
    type,
    inputName,
    isRequired,
    multiLine,
    maxLength,
    elementId,
    classes,
    placeholder = '',
  }) {
    const input = createBaseElement({
      elementId,
      classes,
      name: inputName,
      elementType: multiLine ? 'textarea' : 'input',
    });

    input.setAttribute('placeholder', placeholder);

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

    return input;
  }

  static createHeader({ elements }) {
    const header = createBaseElement({ elementType: 'header' });

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
    const article = createBaseElement({
      elementId,
      classes,
      elementType: 'article',
    });

    if (headerElement) {
      const header = createBaseElement({ elementType: 'header' });

      header.appendChild(headerElement);
      article.appendChild(header);
    }

    if (elements) {
      elements.forEach(element => article.appendChild(element));
    }

    if (footerElement) {
      const footer = createBaseElement({ elementType: 'footer' });

      footer.appendChild(footerElement);
      article.appendChild(footer);
    }

    return article;
  }

  static createSection({
    classes,
    elements,
    footerElement,
    headerElement,
    elementId,
  }) {
    const section = createBaseElement({
      elementId,
      classes,
      elementType: 'section',
    });

    if (headerElement) {
      const header = createBaseElement({ elementType: 'header' });

      header.appendChild(headerElement);
      section.appendChild(header);
    }

    if (elements) {
      elements.forEach(element => section.appendChild(element));
    }

    if (footerElement) {
      const footer = createBaseElement({ elementType: 'footer' });

      footer.appendChild(footerElement);
      section.appendChild(footer);
    }

    return section;
  }

  static replaceFirstChild(parentElement, newChild) {
    if (parentElement.firstElementChild) {
      parentElement.replaceChild(newChild, parentElement.firstElementChild);
    } else {
      parentElement.appendChild(newChild);
    }
  }
}

module.exports = ElementCreator;
