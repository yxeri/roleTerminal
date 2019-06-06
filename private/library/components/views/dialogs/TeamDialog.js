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
const teamComposer = require('../../../data/composers/TeamComposer');
const userComposer = require('../../../data/composers/UserComposer');

class TeamDialog extends BaseDialog {
  constructor({
    teamId,
    classes = [],
    elementId = `tDialog-${Date.now()}`,
  }) {
    const {
      members,
      teamName,
      shortName,
      locationName,
    } = teamComposer.getTeam({ teamId });

    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Transaction', label: 'wallet' }),
        clickFuncs: {
          leftFunc: () => {
            const walletDialog = new WalletDialog({
              sendFromId: userComposer.getCurrentIdentity().objectId,
              sendToId: teamId,
              isTeam: true,
            });

            walletDialog.addToView({ element: this.getParentElement() });
            this.removeFromView();
          },
        },
      }),
    ];

    const upperText = [`${labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamInfo' })}`];
    const lowerText = [
      `${labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamName' })}: ${teamName} [${shortName}]`,
      `${labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'members' })}: ${members.map(member => userComposer.getIdentityName({ objectId: member })).join(', ')}`,
      `${labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'location' })}: ${locationName || 'unknown'}`,
    ];

    super({
      elementId,
      lowerButtons,
      lowerText,
      upperText,
      classes: classes.concat(['teamDialog']),
    });
  }
}

module.exports = TeamDialog;
