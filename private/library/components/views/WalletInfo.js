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

const walletComposer = require('../../data/composers/WalletComposer');
const userComposer = require('../../data/composers/UserComposer');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');

class WalletInfo {
  constructor({
    sign = '$',
  }) {
    const amountSpan = elementCreator.createSpan({ text: '0' });
    const setAmountFunc = ({ walletId, amount }) => {
      const walletAmount = amount || walletComposer.getWalletAmount({ walletId });

      amountSpan.innerHTML = '';
      amountSpan.appendChild(document.createTextNode(`${sign}${walletAmount.toString()}`));
    };

    this.element = elementCreator.createContainer({
      classes: ['walletInfo'],
    });
    this.element.appendChild(amountSpan);

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_WALLET,
      func: () => {
        setAmountFunc({ walletId: userComposer.getCurrentIdentity().objectId });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.CHANGED_ALIAS,
      func: ({ userId }) => {
        setAmountFunc({ walletId: userId });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGIN,
      func: ({ user }) => {
        setAmountFunc({ walletId: user.objectId });
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
