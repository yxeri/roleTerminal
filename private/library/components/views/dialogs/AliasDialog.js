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
const aliasComposer = require('../../../data/composers/AliasComposer');
const textTools = require('../../../TextTools');

const ids = {
  ALIASNAME: 'aliasname',
  DESCRIPTION: 'description',
  PRONOUNS: 'pronouns',
};

class AliasDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `aDialog-${Date.now()}`,
  }) {
    const upperText = [labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'createAlias' })];
    const inputs = [
      elementCreator.createInput({
        elementId: ids.ALIASNAME,
        inputName: 'aliasName',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'AliasDialog', label: 'aliasName' }),
      }),
      elementCreator.createSelect({
        isRequired: true,
        elementId: ids.PRONOUNS,
        multiple: true,
        options: [
          { value: '', name: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'choosePronouns' }) },
          { value: 'they', name: labelHandler.getLabel({ baseObject: 'General', label: 'they' }) },
          { value: 'she', name: labelHandler.getLabel({ baseObject: 'General', label: 'she' }) },
          { value: 'he', name: labelHandler.getLabel({ baseObject: 'General', label: 'he' }) },
          { value: 'it', name: labelHandler.getLabel({ baseObject: 'General', label: 'it' }) },
        ],
      }),
      elementCreator.createInput({
        elementId: ids.DESCRIPTION,
        inputName: 'description',
        type: 'text',
        multiLine: true,
        maxLength: 300,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'description' }),
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

            const selectedPronouns = Array.from(this.getElement(ids.PRONOUNS).selectedOptions)
              .filter((selected) => { return selected.getAttribute('value') !== ''; });

            aliasComposer.createAlias({
              alias: {
                aliasName: textTools.trimSpace(this.getInputValue(ids.ALIASNAME)),
                pronouns: selectedPronouns.map((selected) => { return selected.getAttribute('value'); }),
                description: this.getInputValue(ids.DESCRIPTION).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  switch (error.type) {
                    case 'invalid length': {
                      switch (error.extraData.param) {
                        case 'aliasName': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'aliasName' })] });

                          return;
                        }
                        case 'description': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'description' })] });

                          return;
                        }
                        default: {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'general' })] });

                          return;
                        }
                      }
                    }
                    case 'invalid characters': {
                      switch (error.extraData.param) {
                        case 'aliasName': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidCharactersError', label: 'name' })] });

                          return;
                        }
                        case 'protected': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidCharactersError', label: 'protected' })] });

                          return;
                        }
                        default: {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidCharactersError', label: 'general' })] });

                          return;
                        }
                      }
                    }
                    default: {
                      this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'Error', label: 'general' })] });

                      return;
                    }
                  }
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
      upperText,
      classes: classes.concat(['AliasDialog']),
    });
  }
}

module.exports = AliasDialog;
