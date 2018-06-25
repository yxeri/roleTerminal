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

const List = require('./List');
const BaseDialog = require('../views/dialogs/BaseDialog');

const dataHandler = require('../../data/DataHandler');
const userComposer = require('../../data/composers/UserComposer');
const elementCreator = require('../../ElementCreator');
const labelHandler = require('../../labels/LabelHandler');
const eventCentral = require('../../EventCentral');

class AdminUserList extends List {
  constructor({
    classes = [],
    elementId = `aUserList-${Date.now()}`,
  }) {
    classes.push('adminUserList');

    const headerFields = [
      { paramName: 'username' },
    ];

    super({
      elementId,
      classes,
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

          if (isBanned) {
            lowerButtons.push(unbanButton);
          } else {
            lowerButtons.push(banButton);
          }

          if (!isVerified) {
            lowerButtons.push(verifyButton);
          }

          lowerButtons.push(resetPasswordButton);

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
