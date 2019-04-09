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

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const userComposer = require('../../../data/composers/UserComposer');
const positionComposer = require('../../../data/composers/PositionComposer');
const invititationComposer = require('../../../data/composers/InvitationComposer');
const teamComposer = require('../../../data/composers/TeamComposer');
const eventCentral = require('../../../EventCentral');
const storageManager = require('../../../StorageManager');
const accessCentral = require('../../../AccessCentral');
const viewSwitcher = require('../../../ViewSwitcher');
const roomComposer = require('../../../data/composers/RoomComposer');

class UserDialog extends BaseDialog {
  constructor({
    identityId,
    origin,
    classes = [],
    elementId = `uDialog-${Date.now()}`,
  }) {
    const identity = userComposer.getCurrentIdentity();
    const chosenIdentity = userComposer.getIdentity({ objectId: identityId });
    const identityName = chosenIdentity.aliasName || chosenIdentity.username;
    const { partOfTeams } = chosenIdentity;
    const partOfTeamsText = partOfTeams && partOfTeams.length > 0
      ? chosenIdentity.partOfTeams
      : [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'unknown' })];
    const userPosition = positionComposer.getPosition({ positionId: identityId });
    const positionLabel = userPosition && userPosition.coordinatesHistory && userPosition.coordinatesHistory[0]
      ? `(${userPosition.lastUpdated}): Lat ${userPosition.coordinatesHistory[0].latitude} Long ${userPosition.coordinatesHistory[0].longitude}`
      : labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'unknown' });

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

            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT });

            eventCentral.emitEvent({
              event: eventCentral.Events.SWITCH_ROOM,
              params: {
                origin,
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

            this.removeFromView();
          },
        },
      }));
    }

    if (userComposer.getUser({ userId: identity }) && userComposer.getCurrentTeams().length > 0) {
      const team = teamComposer.getTeam({ teamId: partOfTeams[0] });
      const { hasFullAccess } = accessCentral.hasAccessTo({
        objectToAccess: team,
        toAuth: identity,
      });

      if (hasFullAccess) {
        lowerButtons.push(elementCreator.createButton({
          text: labelHandler.getLabel({ baseObject: 'Button', label: 'inviteTeam' }),
          clickFuncs: {
            leftFunc: () => {
              invititationComposer.inviteToTeam({
                memberId: identityId,
                teamId: partOfTeams[0],
                callback: () => {
                },
              });

              this.removeFromView();
            },
          },
        }));
      }
    }

    if (userPosition) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

            eventCentral.emitEvent({
              event: eventCentral.Events.FOCUS_MAPPOSITION,
              params: { position: userPosition },
            });

            this.removeFromView();
          },
        },
      }));
    }

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
      '',
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${identityName}`,
    ];

    if (partOfTeams && partOfTeams.length > 0) {
      upperText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${partOfTeamsText}`);
    }

    upperText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'position' })}: ${positionLabel}`);

    super({
      elementId,
      lowerButtons,
      upperText,
      classes: classes.concat(['UserDialog']),
    });
  }
}

module.exports = UserDialog;
