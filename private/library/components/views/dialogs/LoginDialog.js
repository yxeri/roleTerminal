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
// const NameDialog = require('./NameDialog');
const TemporaryDialog = require('./TemporaryDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const socketManager = require('../../../SocketManager');
const textTools = require('../../../TextTools');
// const teampComposer = require('../../../data/composers/TeamComposer');

const ids = {
  USERNAME: 'username',
  PASSWORD: 'password',
};

class LoginDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `lDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.USERNAME,
        inputName: 'username',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'username' }),
      }),
      elementCreator.createInput({
        elementId: ids.PASSWORD,
        inputName: 'password',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'password' }),
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
        text: labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'login' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            socketManager.login({
              username: textTools.trimSpace(this.getInputValue(ids.USERNAME)),
              password: this.getInputValue(ids.PASSWORD),
              callback: ({ error, data }) => {
                if (error) {
                  switch (error.type) {
                    case 'banned': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'banned' })],
                      });

                      break;
                    }
                    case 'needs verification': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'unverified' })],
                      });

                      break;
                    }
                    case 'insufficient': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'noLives' })],
                      });

                      break;
                    }
                    default: {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'incorrect' })],
                      });

                      break;
                    }
                  }

                  this.setInputValue({
                    elementId: ids.PASSWORD,
                    value: '',
                  });

                  return;
                }

                const { user } = data;

                // if (!user.hasSetName) {
                //   if (user.partOfTeams[0]) {
                //     const teamDialog = new TemporaryDialog({
                //       text: [`You are part of the ${teampComposer.getTeamName({ teamId: user.partOfTeams[0] })}`],
                //       callback: () => {
                //         const dialog = new NameDialog({ user });
                //
                //         dialog.addToView({});
                //       },
                //     });
                //
                //     teamDialog.addToView({});
                //   } else {
                //     const dialog = new NameDialog({ user });
                //
                //     dialog.addToView({});
                //   }
                // } else {
                const loggedInDialog = new TemporaryDialog({
                  text: [`You have logged in as user ${user.username}`],
                  timeout: 2000,
                });

                loggedInDialog.addToView({});
                // }

                this.setInputValue({
                  elementId: ids.PASSWORD,
                  value: '',
                });

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
      classes: classes.concat(['loginDialog']),
    });
  }
}

module.exports = LoginDialog;
