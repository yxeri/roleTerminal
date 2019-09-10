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
const viewSwitcher = require('../../../ViewSwitcher');

const ids = {
  CODE: 'code',
};

class DocFileDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `openDocDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.CODE,
        inputName: 'code',
        maxLength: 10,
        placeholder: labelHandler.getLabel({ baseObject: 'OpenDocFileDialog', label: 'code' }),
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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'search' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            docFileComposer.getDocFileByCode({
              code: this.getInputValue(ids.CODE),
              callback: ({ error }) => {
                if (error) {
                  switch (error.errorType) {
                    case 'does not exist': {
                      this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'OpenDocFileDialog', label: 'doesNotExist' })] });

                      return;
                    }
                    case 'not allowed': {
                      this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'accessDenied' })] });

                      return;
                    }
                    default: {
                      this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                      return;
                    }
                  }
                }

                viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.DOCS });
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
      upperText: [labelHandler.getLabel({ baseObject: 'OpenDocFileDialog', label: 'openDoc' })],
      classes: classes.concat(['docFileDialog']),
    });
  }
}

module.exports = DocFileDialog;
