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
const storageManager = require('../../../StorageManager');

const ids = {
  TITLE: 'title',
  CODE: 'code',
  TEXT: 'text',
  VISIBILITY: 'visibility',
  VISIBILITY_PUBLIC: 'public',
  VISIBILITY_PRIVATE: 'private',
};

class DocFileDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `docDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.TITLE,
        inputName: 'title',
        type: 'text',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'title' }),
      }),
      elementCreator.createInput({
        elementId: ids.CODE,
        inputName: 'code',
        type: 'password',
        maxLength: 10,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'code' }),
      }),
      elementCreator.createInput({
        elementId: ids.TEXT,
        inputName: 'text',
        type: 'text',
        maxLength: 3500,
        multiLine: true,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'text' }),
      }),
      elementCreator.createImageInput({
        elementId: ids.PICTURE,
        inputName: 'picture',
        appendPreview: true,
        previewId: 'imagePreview-docFile',
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
            isDefault: true,
          }, {
            optionId: ids.VISIBILITY_PRIVATE,
            optionLabel: 'Only those with the correct code',
            value: 'private',
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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            const params = {
              docFile: {
                ownerAliasId: storageManager.getAliasId(),
                title: this.getInputValue(ids.TITLE),
                code: this.getInputValue(ids.CODE),
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
                      case 'code': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'codeLength' })] });

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
            };
            const imagePreview = document.getElementById('imagePreview-docFile');

            if (imagePreview.getAttribute('src')) {
              params.images = [{
                source: imagePreview.getAttribute('src'),
                imageName: imagePreview.getAttribute('name'),
                width: imagePreview.naturalWidth,
                height: imagePreview.naturalHeight,
              }];
            }

            docFileComposer.createDocFile(params);
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      upperText: [labelHandler.getLabel({ baseObject: 'DocFileDialog', label: 'createDoc' })],
      classes: classes.concat(['DocFileDialog']),
    });
  }
}

module.exports = DocFileDialog;
