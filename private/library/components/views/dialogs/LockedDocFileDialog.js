/*
 Copyright 2018 Carmilla Mina Jankovic

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

const BaseDialog = require('./BaseDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const docFileComposer = require('../../../data/composers/DocFileComposer');
const eventCentral = require('../../../EventCentral');

const ids = {
  CODE: 'code',
};

class LockedDocFileDialog extends BaseDialog {
  constructor({
    title,
    docFileId,
    classes = [],
    elementId = `lDialog-${Date.now()}`,
  }) {
    const upperText = [labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'protectedDoc' })];
    const lowerText = [
      `${title} ${labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'isLocked', prependSpace: true })}`,
      `${labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'enterCode' })}`,
    ];
    const inputs = [
      elementCreator.createInput({
        elementId: ids.CODE,
        inputName: 'password',
        type: 'text',
        isRequired: true,
        maxLength: 10,
        placeholder: labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'code' }),
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'unlock' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            docFileComposer.unlockDocFile({
              docFileId,
              code: this.getInputValue(ids.CODE),
              callback: ({ error, data }) => {
                if (error) {
                  this.updateLowerText({
                    text: [labelHandler.getLabel({ baseObject: 'LockedDocFileDialog', label: 'incorrectCode' })],
                  });

                  this.setInputValue({
                    elementId: ids.CODE,
                    value: '',
                  });

                  return;
                }

                this.setInputValue({
                  elementId: ids.CODE,
                  value: '',
                });

                this.removeFromView();

                eventCentral.emitEvent({
                  event: eventCentral.Events.OPEN_DOCFILE,
                  params: { docFile: data.docFile },
                });
              },
            });
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      lowerText,
      upperText,
      classes: classes.concat(['lockedDocFileDialog']),
    });
  }
}

module.exports = LockedDocFileDialog;
