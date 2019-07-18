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
const VerifyDialog = require('./VerifyDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const docFileComposer = require('../../../data/composers/DocFileComposer');

const ids = {
  TITLE: 'title',
  CODE: 'code',
  TEXT: 'text',
  VISIBILITY: 'visibility',
  VISIBILITY_PUBLIC: 'public',
  VISIBILITY_PRIVATE: 'private',
};

class EditDocFileDialog extends BaseDialog {
  constructor({
    docFileId,
    classes = [],
    elementId = `docDialog-${Date.now()}`,
  }) {
    const docFile = docFileComposer.getDocFile({ docFileId });

    const inputs = [
      elementCreator.createInput({
        text: [docFile.title],
        elementId: ids.TITLE,
        inputName: 'title',
        type: 'text',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'title' }),
      }),
      elementCreator.createInput({
        isLocked: true,
        text: [docFile.code],
        elementId: ids.CODE,
        inputName: 'code',
        maxLength: 10,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'code' }),
      }),
      elementCreator.createInput({
        text: docFile.text,
        elementId: ids.TEXT,
        inputName: 'text',
        type: 'text',
        maxLength: 3500,
        multiLine: true,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'text' }),
      }),
      elementCreator.createRadioSet({
        elementId: ids.VISIBILITY,
        title: 'Who should be able to view the document? Those with the correct code will always be able to view the document.',
        optionName: 'visibility',
        options: [
          {
            optionId: ids.VISIBILITY_PUBLIC,
            optionLabel: 'Everyone',
            value: 'public',
            isDefault: docFile.isPublic,
          }, {
            optionId: ids.VISIBILITY_PRIVATE,
            optionLabel: 'Only those with the correct code',
            value: 'private',
            isDefault: !docFile.isPublic,
          },
        ],
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
              callback: ({ confirmed }) => {
                if (!confirmed) {
                  this.addToView({
                    element: parentElement,
                  });

                  return;
                }

                docFileComposer.removeDocFile({
                  docFileId,
                  callback: ({ error: docFileError }) => {
                    if (docFileError) {
                      console.log('doc file error', docFileError);
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

            docFileComposer.updateDocFile({
              docFileId,
              docFile: {
                title: this.getInputValue(ids.TITLE),
                isPublic: document.getElementById(ids.VISIBILITY_PUBLIC).checked,
                text: this.getInputValue(ids.TEXT).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length' && error.extraData) {
                    switch (error.extraData.param) {
                      case 'title': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'titleLength' })] });

                        break;
                      }
                      case 'text': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'textLength' })] });

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
      classes: classes.concat(['DocFileDialog']),
    });
  }
}

module.exports = EditDocFileDialog;
