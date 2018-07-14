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

const List = require('./List');
const BaseDialog = require('../views/dialogs/BaseDialog');

const dataHandler = require('../../data/DataHandler');
const userComposer = require('../../data/composers/UserComposer');
const elementCreator = require('../../ElementCreator');
const labelHandler = require('../../labels/LabelHandler');
const accessCentral = require('../../AccessCentral');
const walletComposer = require('../../data/composers/WalletComposer');

class AdminUserList extends List {
  constructor({
    classes = [],
    elementId = `aUserList-${Date.now()}`,
  }) {
    classes.push('adminUserList');

    const headerFields = [
      {
        paramName: 'username',
      }, {
        paramName: 'accessLevel',
        classes: ['accessLevel'],
        convertFunc: (accessLevel) => {
          switch (accessLevel) {
            case accessCentral.AccessLevels.PRIVILEGED: {
              return '-Privileged-';
            }
            case accessCentral.AccessLevels.MODERATOR: {
              return '-Moderator-';
            }
            case accessCentral.AccessLevels.ADMIN:
            case accessCentral.AccessLevels.SUPERUSER:
            case accessCentral.AccessLevels.GOD: {
              return '-Admin-';
            }
            default: {
              return '-Standard-';
            }
          }
        },
      }, {
        paramName: 'isBanned',
        convertFunc: (isBanned) => {
          if (!isBanned) {
            return '';
          }

          return '[BANNED]';
        },
      }, {
        paramName: 'isVerified',
        convertFunc: (isVerified) => {
          if (isVerified) {
            return '';
          }

          return '[NOT VERIFIED]';
        },
      },
    ];

    super({
      elementId,
      classes,
      shouldToggle: true,
      title: 'Users',
      listItemSpecificClasses: [
        {
          paramName: 'isVerified',
          paramValue: true,
          classes: ['verified'],
        }, {
          paramName: 'isVerified',
          paramValue: false,
          classes: ['unverified'],
        }, {
          paramName: 'isBanned',
          paramValue: true,
          classes: ['banned'],
        },
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          console.log('objectid', objectId);

          const userId = objectId;
          const { isBanned, isVerified, username } = userComposer.getUser({ userId: objectId });

          const dialog = new BaseDialog({
            upperText: [`Updating user: ${username}.`, labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'updateUser' })],
          });
          const lowerButtons = [elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
            clickFuncs: {
              leftFunc: () => {
                dialog.removeFromView();
              },
            },
          })];

          const banButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'ban' }),
            clickFuncs: {
              leftFunc: () => {
                userComposer.banUser({
                  userId,
                  callback: ({ error }) => {
                    if (error) {
                      dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                      return;
                    }

                    dialog.removeFromView();
                  },
                });
              },
            },
          });
          const unbanButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'unban' }),
            clickFuncs: {
              leftFunc: () => {
                userComposer.unbanUser({
                  userId,
                  callback: ({ error }) => {
                    if (error) {
                      dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                      return;
                    }

                    dialog.removeFromView();
                  },
                });
              },
            },
          });
          const verifyButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'verify' }),
            clickFuncs: {
              leftFunc: () => {
                userComposer.verifyUser({
                  userId,
                  callback: ({ error }) => {
                    if (error) {
                      dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                      return;
                    }

                    dialog.removeFromView();
                  },
                });
              },
            },
          });
          const resetPasswordButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'password' }),
            clickFuncs: {
              leftFunc: () => {
                userComposer.changePassword({
                  userId,
                  callback: ({ error, data }) => {
                    if (error) {
                      dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                      return;
                    }

                    const passwordDialog = new BaseDialog({
                      upperText: [`${labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'newPassword', appendSpace: true })} ${data.user.password}`],
                      lowerButtons: [elementCreator.createButton({
                        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'ok' }),
                        clickFuncs: {
                          leftFunc: () => {
                            passwordDialog.removeFromView();
                          },
                        },
                      })],
                    });

                    dialog.removeFromView();
                    passwordDialog.addToView({ element: this.element });
                  },
                });
              },
            },
          });
          const changeAccessButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'access' }),
            clickFuncs: {
              leftFunc: () => {
                const accessDialog = new BaseDialog({
                  inputs: [
                    elementCreator.createRadioSet({
                      title: 'Choose level:',
                      optionName: 'chooseAccess',
                      options: [
                        {
                          optionId: 'chooseAccessStandard',
                          optionLabel: 'STANDARD',
                          value: accessCentral.AccessLevels.STANDARD,
                        }, {
                          optionId: 'chooseAccessPrivileged',
                          optionLabel: 'PRIVILEGED',
                          value: accessCentral.AccessLevels.PRIVILEGED,
                        }, {
                          optionId: 'chooseAccessModerator',
                          optionLabel: 'MODERATOR',
                          value: accessCentral.AccessLevels.MODERATOR,
                        }, {
                          optionId: 'chooseAccessAdmin',
                          optionLabel: 'ADMIN',
                          value: accessCentral.AccessLevels.ADMIN,
                        },
                      ],
                    }),
                  ],
                  upperText: [`${labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'chooseAccess' })}`],
                  lowerButtons: [
                    elementCreator.createButton({
                      text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                      clickFuncs: {
                        leftFunc: () => { accessDialog.removeFromView(); },
                      },
                    }),
                    elementCreator.createButton({
                      text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'change' }),
                      clickFuncs: {
                        leftFunc: () => {
                          const chosen = document.querySelector('input[name="chooseAccess"]:checked');

                          userComposer.changeAccessLevel({
                            userId,
                            accessLevel: chosen.value,
                            callback: ({ error }) => {
                              if (error) {
                                accessDialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                                return;
                              }

                              accessDialog.removeFromView();
                            },
                          });
                        },
                      },
                    }),
                  ],
                });

                dialog.removeFromView();
                accessDialog.addToView({ element: this.element });
              },
            },
          });
          const walletButton = elementCreator.createButton({
            text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'wallet' }),
            clickFuncs: {
              leftFunc: () => {
                const walletDialog = new BaseDialog({
                  inputs: [elementCreator.createInput({
                    elementId: 'walletAmount',
                    inputName: 'walletAmount',
                    isRequired: true,
                    maxLength: 6,
                    type: 'number',
                    placeholder: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'amountPlaceholder' }),
                  })],
                  upperText: [`${labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'walletAmount' })}`],
                  lowerButtons: [
                    elementCreator.createButton({
                      text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                      clickFuncs: {
                        leftFunc: () => { walletDialog.removeFromView(); },
                      },
                    }),
                    elementCreator.createButton({
                      text: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendAmount' }),
                      clickFuncs: {
                        leftFunc: () => {
                          if (walletDialog.hasEmptyRequiredInputs()) {
                            return;
                          }

                          walletComposer.changeWalletAmount({
                            walletId: userId,
                            amount: walletDialog.getInputValue('walletAmount'),
                            callback: ({ error }) => {
                              if (error) {
                                dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'failed' })] });

                                return;
                              }

                              walletDialog.removeFromView();
                            },
                          });
                        },
                      },
                    }),
                  ],
                });

                dialog.removeFromView();
                walletDialog.addToView({ element: this.element });
              },
            },
          });

          if (isBanned) {
            lowerButtons.push(unbanButton);
          } else {
            lowerButtons.push(banButton);
          }

          if (!isVerified) {
            lowerButtons.push(verifyButton);
          }

          lowerButtons.push(resetPasswordButton, changeAccessButton, walletButton);

          dialog.addToView({ element: this.element });
          dialog.addBottomButtons({ buttons: lowerButtons });
        },
      },
      dependencies: [
        dataHandler.aliases,
        dataHandler.users,
      ],
      collector: dataHandler.users,
      listItemFields: headerFields,
    });
  }
}

module.exports = AdminUserList;
