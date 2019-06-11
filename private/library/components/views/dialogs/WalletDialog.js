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
const walletComposer = require('../../../data/composers/WalletComposer');
const transactionComposer = require('../../../data/composers/TransactionComposer');
const userComposer = require('../../../data/composers/UserComposer');
const teamComposer = require('../../../data/composers/TeamComposer');
const storageManager = require('../../../StorageManager');
const tracker = require('../../../PositionTracker');

class WalletDialog extends BaseDialog {
  constructor({
    sendFromId,
    sendToId,
    isTeam,
    classes = [],
    elementId = `wDialog-${Date.now()}`,
  }) {
    const identityName = isTeam
      ? teamComposer.getTeamName({ teamId: sendToId })
      : userComposer.getIdentityName({ objectId: sendToId });
    const walletAmount = walletComposer.getWalletAmount({ walletId: sendFromId });
    const thisIdentityName = userComposer.getIdentityName({ objectId: sendFromId }) || teamComposer.getTeamName({ teamId: sendFromId });

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
        text: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendAmount' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            transactionComposer.createTransaction({
              transaction: {
                coordinates: tracker.getBestPosition(),
                fromWalletId: storageManager.getAliasId() || storageManager.getUserId(),
                toWalletId: sendToId,
                amount: this.getInputValue('walletAmount'),
              },
              callback: ({ error }) => {
                if (error) {
                  this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'Transaction', label: 'failed' })] });

                  return;
                }

                this.removeFromView();
              },
            });
          },
        },
      }),
    ];
    const inputs = [
      elementCreator.createInput({
        elementId: 'walletAmount',
        inputName: 'walletAmount',
        isRequired: true,
        maxLength: 10,
        type: 'number',
        placeholder: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'amountPlaceholder' }),
      }),
    ];
    const upperText = [labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'transfer' })];
    const lowerText = [
      `${labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendingFrom' })}: ${thisIdentityName}.`,
      isTeam
        ? `${labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendingToTeam' })}: ${identityName}.`
        : `${labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendingTo' })}: ${identityName}.`,
      `${labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'youHave', appendSpace: true })}${walletAmount}.`,
    ];

    super({
      elementId,
      lowerButtons,
      inputs,
      lowerText,
      upperText,
      classes: classes.concat(['walletDialog']),
    });
  }
}

module.exports = WalletDialog;
