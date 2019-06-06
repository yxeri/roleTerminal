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
const teamComposer = require('../../../data/composers/TeamComposer');

const ids = {
  TEAMNAME: 'teamName',
  TAG: 'tag',
};

class TeamCreateDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `tCDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.TEAMNAME,
        inputName: ids.TEAMNAME,
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamName' }),
      }),
      elementCreator.createInput({
        elementId: ids.TAG,
        inputName: ids.TAG,
        type: 'text',
        isRequired: true,
        maxLength: 5,
        placeholder: labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'tag' }),
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

            teamComposer.createTeam({
              team: {
                teamName: this.getInputValue(ids.TEAMNAME),
                shortName: this.getInputValue(ids.TAG),
              },
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length') {
                    switch (error.extraData.param) {
                      case 'teamName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamNameLength' })] });

                        break;
                      }
                      case 'shortName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'shortNameLength' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

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
    const upperText = [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'createTeam' })];

    super({
      elementId,
      inputs,
      lowerButtons,
      upperText,
      classes: classes.concat(['teamDialog']),
    });
  }
}

module.exports = TeamCreateDialog;
