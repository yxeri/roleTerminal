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

import elementCreator from '../../../ElementCreator';

const BaseDialog = require('./BaseDialog');
const VerifyDialog = require('./VerifyDialog');

const labelHandler = require('../../../labels/LabelHandler');
const messageComposer = require('../../../data/composers/MessageComposer');

const ids = {
  TITLE: 'title',
  CODE: 'code',
  TEXT: 'text',
  VISIBILITY: 'visibility',
  VISIBILITY_PUBLIC: 'public',
  VISIBILITY_PRIVATE: 'private',
};

class MessageDialog extends BaseDialog {
  constructor({
    text,
    messageId,
    classes = [],
    elementId = `msgDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        text,
        elementId: ids.TEXT,
        inputName: 'text',
        type: 'text',
        maxLength: 2500,
        multiLine: true,
        shouldResize: true,
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'remove' }),
        clickFuncs: {
          leftFunc: () => {
            const parentElement = this.getParentElement();

            const verifyDialog = new VerifyDialog({
              text: [],
              callback: ({ confirmed }) => {
                if (!confirmed) {
                  this.addToView({
                    element: parentElement,
                  });

                  return;
                }

                messageComposer.removeMessage({
                  messageId,
                  callback: ({ error: messageError }) => {
                    if (messageError) {
                      console.log('message error', messageError);
                    }

                    verifyDialog.removeFromView();
                  },
                });
              },
            });

            verifyDialog.addToView({
              element: this.getParentElement(),
            });

            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            messageComposer.updateMessage({
              messageId,
              message: {
                text: this.getInputValue(ids.TEXT).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length' && error.extraData) {
                    switch (error.extraData.param) {
                      case 'text': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'MessageDialog', label: 'textLength' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                        break;
                      }
                    }
                  }

                  this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                  return;
                }

                this.removeFromView();
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
      classes: classes.concat(['MessageDialog']),
    });
  }
}

module.exports = MessageDialog;
