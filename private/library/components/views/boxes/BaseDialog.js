/*
 Copyright 2018 Aleksandar Jankovic

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

const dataHandler = require('../../../data/DataHandler');
const eventCentral = require('../../../EventCentral');
const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');

const ids = {
  UPPERTEXT: 'upperText',
  LOWERTEXT: 'lowerText',
  UPPERBUTTONS: 'upperButtons',
  LOWERBUTTONS: 'lowerButtons',
};

class BaseDialog extends BaseView {
  constructor({
    upperText,
    lowerText,
    upperButtons,
    lowerButtons,
    classes = [],
    elementId = `elem-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['dialog']),
    });

    this.element.appendChild(this.createButtonContainer({
      elementId: ids.UPPERBUTTONS,
      buttons: upperButtons,
      classes: !upperButtons ? ['empty'] : [],
    }));

    this.element.appendChild(this.createTextContainer({
      text: upperText,
      elementId: ids.UPPERTEXT,
      classes: !upperText ? ['empty'] : [],
    }));

    this.element.appendChild(this.createTextContainer({
      text: lowerText,
      elementId: ids.LOWERTEXT,
      classes: !lowerText ? ['empty'] : [],
    }));

    this.element.appendChild(this.createButtonContainer({
      elementId: ids.LOWERBUTTONS,
      classes: !lowerButtons ? ['empty'] : [],
    }));
  }

  createButtonContainer({ buttons, elementId }) {
    const buttonElements = buttons.map((button) => {
      const { text, clickFuncs } = button;

      return elementCreator.createButton({
        text,
        clickFuncs,
      })
    });

    return elementCreator.createContainer({
      elementId: `${this.elementId}${elementId}`,
      classes: [elementId],
      elements: buttonElements,
    });
  }

  createTextContainer({ text, elementId }) {
    const paragraphs = text.map((line) => {
      return elementCreator.createParagraph({
        elements: elementCreator.createSpan({ text: line }),
      });
    });

    return elementCreator.createContainer({
      elementId: `${this.elementId}${elementId}`,
      classes: [elementId],
      elements: paragraphs,
    })
  }

  checkAndMarkRequiredFields() {

  }

  updateUpperText({ text, shouldAppend }) {
    if (shouldAppend) {

    }
  }

  updateLowerText({ text, shouldAppend }) {
    if (shouldAppend) {
      this.element.replaceChild(this.createTextContainer({ text, elementId: ids.LOWERTEXT }), this.getElement(ids.LOWERTEXT));
    } else {
      const element = this.getElement(ids.LOWERTEXT);
    }
  }
}

module.exports = BaseDialog;
