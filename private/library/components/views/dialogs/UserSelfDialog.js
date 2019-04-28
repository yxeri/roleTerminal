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
const userComposer = require('../../../data/composers/UserComposer');
const positionComposer = require('../../../data/composers/PositionComposer');
// const invititationComposer = require('../../../data/composers/InvitationComposer');
// const teamComposer = require('../../../data/composers/TeamComposer');
const eventCentral = require('../../../EventCentral');
// const storageManager = require('../../../StorageManager');
// const accessCentral = require('../../../AccessCentral');
const viewSwitcher = require('../../../ViewSwitcher');

class UserSelfDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `uSDialog-${Date.now()}`,
  }) {
    const currentUser = userComposer.getCurrentUser();
    const {
      username,
      objectId: userId,
      partOfTeams = [],
    } = currentUser;
    const partOfTeamsText = partOfTeams.length > 0
      ? partOfTeams
      : [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'none' })];
    const userPosition = positionComposer.getPosition({ positionId: userId });
    const positionLabel = userPosition && userPosition.coordinates
      ? `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'lastSeenAt', appendSpace: true })}
      (${userPosition.lastUpdated}): Lat ${userPosition.coordinates.latitude} Long ${userPosition.coordinates.longitude}`
      : labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'unknown' });

    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'done' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserSelfDialog', label: 'rename' }),
        clickFuncs: {
          leftFunc: () => {
            const renameDialog = new BaseDialog({
              inputs: [
                elementCreator.createInput({
                  elementId: 'username',
                  inputName: 'username',
                  type: 'text',
                  isRequired: true,
                  maxLength: 10,
                  placeholder: labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'username' }),
                }),
              ],
              lowerButtons: [
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                  clickFuncs: {
                    leftFunc: () => { this.removeFromView(); },
                  },
                }),
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
                  clickFuncs: {
                    leftFunc: () => {
                      if (this.hasEmptyRequiredInputs()) {
                        return;
                      }

                      userComposer.updateUsername({
                        userId,
                        username,
                        callback: ({ error: updateError }) => {
                          if (updateError) {
                            console.log('Failed to update username');

                            return;
                          }

                          const parentElement = renameDialog.getParentElement();

                          renameDialog.removeFromView();
                          this.addToView({ element: parentElement });
                        },
                      });
                    },
                  },
                }),
              ],
            });

            renameDialog.addToView({ element: this.getParentElement() });
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'leaveTeam' }),
        clickFuncs: {
          leftFunc: () => {
            const verifyDialog = new VerifyDialog({
              callback: () => {},
            });

            verifyDialog.addToView({
              element: this.getParentElement(),
            });
            this.removeFromView();
          },
        },
      }),
    ];

    if (userPosition) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

            eventCentral.emitEvent({
              event: eventCentral.Events.FOCUS_USER_MAPPOSITION,
              params: { userId },
            });

            this.removeFromView();
          },
        },
      }));
    }

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
      '',
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${username}`,
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${partOfTeamsText}`,
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'position' })}: ${positionLabel}`,
    ];

    super({
      elementId,
      lowerButtons,
      upperText,
      classes: classes.concat(['UserDialog']),
    });
  }
}

module.exports = UserSelfDialog;
