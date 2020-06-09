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
const WalletDialog = require('./WalletDialog');
const TemporaryDialog = require('./TemporaryDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const userComposer = require('../../../data/composers/UserComposer');
const positionComposer = require('../../../data/composers/PositionComposer');
const invititationComposer = require('../../../data/composers/InvitationComposer');
const teamComposer = require('../../../data/composers/TeamComposer');
const eventCentral = require('../../../EventCentral');
const storageManager = require('../../../StorageManager');
const viewSwitcher = require('../../../ViewSwitcher');
const roomComposer = require('../../../data/composers/RoomComposer');
const textTools = require('../../../TextTools');

class UserDialog extends BaseDialog {
  constructor({
    identityId,
    classes = [],
    elementId = `uDialog-${Date.now()}`,
  }) {
    const identity = userComposer.getCurrentIdentity();
    const chosenIdentity = userComposer.getIdentity({ objectId: identityId });
    const identityName = chosenIdentity.aliasName || chosenIdentity.username;
    const { partOfTeams = [] } = chosenIdentity;
    const userPosition = positionComposer.getPosition({ positionId: identityId });

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
        text: labelHandler.getLabel({ baseObject: 'Transaction', label: 'wallet' }),
        clickFuncs: {
          leftFunc: () => {
            const walletDialog = new WalletDialog({
              sendFromId: identity.objectId,
              sendToId: identityId,
              isTeam: false,
            });

            walletDialog.addToView({ element: this.getParentElement() });
            this.removeFromView();
          },
        },
      }),
    ];

    if (storageManager.getAccessLevel() >= storageManager.getPermissions().SendWhisper
      ? storageManager.getPermissions().SendWhisper.accessLevel
      : { accessLevel: 1 }) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'message' }),
        clickFuncs: {
          leftFunc: () => {
            const whisperRoom = roomComposer.getWhisperRoom({
              participantIds: [
                identityId,
                userComposer.getCurrentIdentity().objectId,
              ],
            });

            this.removeFromView();

            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT });

            eventCentral.emitEvent({
              event: eventCentral.Events.SWITCH_ROOM,
              params: {
                listType: 'rooms',
                room: whisperRoom
                  ? {
                    objectId: whisperRoom.objectId,
                  }
                  : {
                    objectId: identityId,
                    isUser: true,
                  },
              },
            });
          },
        },
      }));
    }

    if (identity.partOfTeams && identity.partOfTeams.length > 0 && !partOfTeams.includes(identity.partOfTeams[0])) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'inviteTeam' }),
        clickFuncs: {
          leftFunc: () => {
            invititationComposer.inviteToTeam({
              memberId: identityId,
              teamId: identity.partOfTeams[0],
              callback: ({ error: teamError }) => {
                const dialog = new TemporaryDialog({});

                if (teamError) {
                  switch (teamError.type) {
                    case 'already exists': {
                      dialog.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'UserDialog', label: 'alreadyMember' })],
                      });

                      return;
                    }
                    default: {
                      dialog.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })],
                      });

                      return;
                    }
                  }
                }

                dialog.updateLowerText({
                  text: [labelHandler.getLabel({ baseObject: 'UserDialog', label: 'teamInviteOk' })],
                });
              },
            });

            this.removeFromView();
          },
        },
      }));
    }

    const upperText = [`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`];
    const lowerText = [];

    if (chosenIdentity.fullName) {
      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'fullName' })}: ${chosenIdentity.fullName}`);
    }

    lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${identityName}`);

    if (partOfTeams && partOfTeams.length > 0) {
      const teamNames = chosenIdentity.partOfTeams.map((teamId) => { return teamComposer.getTeamName({ teamId }); }).join(', ');

      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${teamNames}`);
    }

    if (userPosition && userPosition.coordinatesHistory && userPosition.coordinatesHistory[0]) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();

            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

            eventCentral.emitEvent({
              event: eventCentral.Events.FOCUS_MAPPOSITION,
              params: { position: userPosition },
            });
          },
        },
      }));
    }

    const images = [];

    if (chosenIdentity.image) {
      images.push(elementCreator.createPicture({
        picture: chosenIdentity.image,
      }));
    }

    super({
      elementId,
      lowerButtons,
      lowerText,
      images,
      upperText,
      classes: classes.concat(['userDialog']),
    });
  }
}

module.exports = UserDialog;
