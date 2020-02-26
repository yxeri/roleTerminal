/*
 Copyright 2020 Carmilla Mina Jankovic

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
const TemporaryDialog = require('./TemporaryDialog');
const VerifyDialog = require('./VerifyDialog');

const labelHandler = require('../../../labels/LabelHandler');
const elementCreator = require('../../../ElementCreator');
const gameCodeComposer = require('../../../data/composers/GameCodeComposer');
const userComposer = require('../../../data/composers/UserComposer');
const teamComposer = require('../../../data/composers/TeamComposer');

const ids = {
  USERNAME: 'username',
};

class ConnectDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `cDialog-${Date.now()}`,
  }) {
    const upperText = [labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'title' })];
    const lowerText = [labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'instructions' })];
    const inputs = [
      elementCreator.createInput({
        type: 'text',
        isRequired: true,
        elementId: ids.USERNAME,
        placeholder: labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'username' }),
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
        text: labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'connect' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            const verifyDialog = new VerifyDialog({
              text: [
                labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'areYouSure' }),
                labelHandler.getLabel({ baseObject: 'ConnectDialog', label: 'warning' }),
              ],
              callback: ({ confirmed }) => {
                if (!confirmed) {
                  this.removeFromView();

                  return;
                }

                gameCodeComposer.useGameCode({
                  code: this.getInputValue(ids.TARGET),
                  callback: ({ error, data }) => {
                    if (error) {
                      switch (error.type) {
                        case 'does not exist': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TargetDialog', label: 'invalid' })] });

                          break;
                        }
                        default: {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'Error', label: 'general' })] });

                          break;
                        }
                      }

                      return;
                    }

                    const { gameCode } = data;
                    const target = userComposer.getIdentity({ objectId: gameCode.ownerAliasId || gameCode.ownerId });
                    const teamName = target.partOfTeams > 0
                      ? teamComposer.getTeamName({ teamId: teamComposer.getTeamName({ teamId: target.partOfTeams[0] }) })
                      : '-';
                    const dialog = new TemporaryDialog({
                      text: [
                        labelHandler.getLabel({ baseObject: 'TargetDialog', label: 'success' }),
                        `${labelHandler.getLabel({ baseObject: 'TargetDialog', label: 'target' })}: ${target.aliasName || target.username}`,
                        `${labelHandler.getLabel({ baseObject: 'TargetDialog', label: 'faction' })}: ${teamName}`,
                      ],
                      timeout: 10000,
                    });

                    dialog.addToView({ element: this.getParentElement() });
                    this.removeFromView();
                  },
                });
              },
            });

            verifyDialog.addToView({});
            this.removeFromView();
          },
        },
      }),
    ];

    super({
      elementId,
      upperText,
      lowerText,
      inputs,
      lowerButtons,
      classes: classes.concat(['TargetDialog']),
    });
  }
}

module.exports = ConnectDialog;
