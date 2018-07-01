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

const BaseDialog = require('./BaseDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const aliasComposer = require('../../../data/composers/AliasComposer');

const ids = {
  FULLNAME: 'fullName',
  ALIASNAME: 'aliasname',
};

class AliasDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `aDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.ALIASNAME,
        inputName: 'aliasName',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'aliasName' }),
      }),
      elementCreator.createInput({
        elementId: ids.FULLNAME,
        inputName: 'fullName',
        type: 'text',
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'fullName' }),
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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            aliasComposer.createAlias({
              alias: {
                aliasName: this.getInputValue(ids.ALIASNAME),
                fullName: this.getInputValue(ids.FULLNAME),
              },
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length') {
                    switch (error.extraData.param) {
                      case 'aliasName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'aliasNameLength' })] });

                        break;
                      }
                      case 'fullName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'fullNameLength' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'error' })] });

                        break;
                      }
                    }
                  }

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
      classes: classes.concat(['AliasDialog']),
    });
  }
}

module.exports = AliasDialog;
