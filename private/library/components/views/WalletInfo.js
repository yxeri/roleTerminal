/*
 Copyright 2019 Carmilla Mina Jankovic

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

const BaseView = require('./BaseView');

const walletComposer = require('../../data/composers/WalletComposer');
const userComposer = require('../../data/composers/UserComposer');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const teamComposer = require('../../data/composers/TeamComposer');

class WalletInfo extends BaseView {
  constructor({
    corners,
    sign = '$',
    appendSign = false,
    showName = false,
    showTeam = false,
  }) {
    const amountSpan = elementCreator.createSpan({ text: '0' });
    const setAmountFunc = ({ walletId, amount }) => {
      const walletAmount = amount || walletComposer.getWalletAmount({ walletId });
      const identity = userComposer.getCurrentIdentity();
      const name = identity.aliasName || identity.username;
      const { partOfTeams = [] } = identity;
      const team = partOfTeams.length > 0
        ? teamComposer.getTeam({ teamId: partOfTeams[0] })
        : undefined;
      let string = '';

      amountSpan.innerHTML = '';

      if (showName) {
        string += `${name}: `;
      }

      if (appendSign) {
        string += `${walletAmount.toString()}${sign}`;
      } else {
        string += `${sign}${walletAmount.toString()}`;
      }

      if (showTeam && team) {
        const teamAmount = walletComposer.getWalletAmount({ walletId: team.objectId });

        string += `. ${team.teamName}: `;

        if (appendSign) {
          string += `${teamAmount.toString()}${sign}`;
        } else {
          string += `${sign}${teamAmount.toString()}`;
        }
      }

      amountSpan.appendChild(document.createTextNode(string));
    };

    super({ corners });

    this.element = elementCreator.createContainer({
      classes: ['walletInfo'],
    });
    this.element.appendChild(amountSpan);

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_WALLET,
      func: () => {
        setAmountFunc({ walletId: userComposer.getCurrentIdentity().objectId });

        eventCentral.addWatcher({
          event: eventCentral.Events.CHANGED_ALIAS,
          func: ({ userId }) => {
            setAmountFunc({ walletId: userId });
          },
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.WALLETS,
          func: () => {
            setAmountFunc({ walletId: userComposer.getCurrentIdentity().objectId });
          },
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.TRANSACTION,
          func: () => {
            const identity = userComposer.getCurrentIdentity();

            setAmountFunc({ walletId: identity.objectId });
          },
        });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGOUT,
      func: () => {
        setAmountFunc({ amount: 0 });
      },
    });
  }
}

module.exports = WalletInfo;
