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

class UserDialog extends BaseDialog {
  constructor({
    identityId,
    classes = [],
    elementId = `uDialog-${Date.now()}`,
  }) {
    const identity = userComposer.getCurrentIdentity();
    const chosenIdentity = userComposer.getIdentity({ objectId: identityId });
    const partOfTeams = chosenIdentity.partOfTeams && chosenIdentity.partOfTeams.length > 0 ?
      chosenIdentity.partOfTeams :
      [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'unknown' })];
    const userPosition = positionComposer.getPosition({ positionId: identityId });
    const positionLabel = userPosition ?
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'lastSeenAt', appendSpace: true })}
      (${userPosition.lastUpdated}): Lat ${userPosition.coordinates.latitude} Long ${userPosition.coordinates.longitude}` :
      labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'unknown' });

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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'wallet' }),
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

    if (userPosition) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            // this.removeFromView();
          },
        },
      }));
    }

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
      '',
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${partOfTeams}`,
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

module.exports = UserDialog;
