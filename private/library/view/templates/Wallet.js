/*
 Copyright 2017 Aleksandar Jankovic

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

const StandardView = require('../base/StandardView');
const List = require('../base/List');
const DialogBox = require('../DialogBox');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const elementCreator = require('../../ElementCreator');
const textTools = require('../../TextTools');
const soundLibrary = require('../../audio/SoundLibrary');
const tracker = require('../worldMap/Tracker');

/**
 * Create a transaction list item
 * @param {string} params.suffix Suffix added to transaction amount
 * @param {string} params.to Receiver
 * @param {string} params.from Sender
 * @param {number} params.amount Amount
 * @param {Date} params.time Time stamp
 * @returns {HTMLLIElement} List item
 */
function createTransactionItem({ suffix, transaction: { to, from, amount, time, note, coordinates } }) {
  const listItem = document.createElement('LI');
  const date = textTools.generateTimeStamp({ date: time });

  listItem.appendChild(elementCreator.createContainer({ classes: ['leftCorner'] }));
  listItem.appendChild(elementCreator.createContainer({ classes: ['rightCorner'] }));
  listItem.appendChild(elementCreator.createContainer({ classes: ['upperRightCorner'] }));

  listItem.appendChild(elementCreator.createParagraph({ text: `${date.fullTime} ${date.fullDate}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `${from} -> ${to}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `Amount: ${amount}${suffix}` }));

  if (coordinates) {
    listItem.appendChild(elementCreator.createParagraph({ text: `Lat: ${coordinates.latitude}. Long: ${coordinates.longitude}. Accuracy: ${coordinates.accuracy}m` }));
  }

  if (note) {
    listItem.appendChild(elementCreator.createParagraph({ text: `${note}` }));
  }

  return listItem;
}

/**
 * Takes a list of user names and filters out current users user name and aliases
 * @param {Object[]} users List of users
 * @returns {Object[]} List of users, excluding current user name and aliases
 */
function filterUserAliases(users) {
  const aliases = storageManager.getAliases();
  aliases.push(storageManager.getUserName());

  return users.filter(user => aliases.indexOf(user.userName) === -1);
}

class Wallet extends StandardView {
  constructor({ suffix = '' }) {
    super({ isFullscreen: true, viewId: 'wallet' });

    this.viewer.appendChild(elementCreator.createParagraph({ text: '' }));
    this.viewer.appendChild(elementCreator.createList({}));
    this.viewer.classList.add('selectedView');
    this.walletAmount = 0;
    this.teamWalletAmount = 0;
    this.suffix = suffix;

    this.populateList();
  }

  createTransactionButton({ receiverName, readableName }) {
    // const radioSet = {
    //   type: 'radioSet',
    //   title: 'Which wallet do you want to use?',
    //   optionName: 'visibility',
    //   options: [
    //     { optionId: 'myWallet', optionLabel: 'Mine', default: true },
    //     { optionId: 'teamWallet', optionLabel: 'Team', requiresTeam: true },
    //   ],
    // };
    const inputs = [{
      placeholder: 'Amount',
      inputName: 'amount',
      isRequired: true,
    }, {
      placeholder: 'Message to receiver',
      inputName: 'note',

    }];

    const button = elementCreator.createButton({
      inputs,
      data: receiverName,
      text: readableName || receiverName,
      func: () => {
        this.userList.toggleList(false);

        const transDialog = new DialogBox({
          inputs,
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                transDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = transDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  transDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const transaction = {
                  to: receiverName,
                  amount: transDialog.inputs.find(({ inputName }) => inputName === 'amount').inputElement.value,
                  note: transDialog.inputs.find(({ inputName }) => inputName === 'note').inputElement.value,
                };

                if (tracker.latestBestPosition) {
                  transaction.coordinates = tracker.latestBestPosition.coordinates;
                }

                socketManager.emitEvent('createTransaction', { transaction }, ({ error: createError, data }) => {
                  if (createError) {
                    if (createError.type === 'insufficient') {
                      transDialog.changeExtraDescription({ text: ['Not enough vcaps', 'Unable to transfer credits'] });

                      return;
                    }

                    transDialog.changeExtraDescription({ text: ['Something went wrong', 'Failed to transfer credits'] });

                    return;
                  }

                  eventCentral.triggerEvent({
                    event: eventCentral.Events.TRANSACTION,
                    params: { transaction: data.transaction, wallet: data.wallet, toWallet: data.toWallet },
                  });
                  transDialog.removeView();
                });
              },
            },
          },
          description: [
            'Nyuen Transfer Tool',
          ],
          extraDescription: [`How much do you want to transfer to ${receiverName}?`],
        });
        transDialog.appendTo(this.element.parentElement);
      },
    });

    return button;
  }

  getTransactions({ teamList }) {
    socketManager.emitEvent('getTeams', {}, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      teamList.replaceAllItems({ items: data.teams.map(team => this.createTransactionButton({ receiverName: `${team.teamName}-team`, readableName: team.teamName })) });
    });

    socketManager.emitEvent('listUsers', {}, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      const users = filterUserAliases(data.users);

      this.userList.replaceAllItems({ items: users.map(user => this.createTransactionButton({ receiverName: user.userName })) });
    });

    socketManager.emitEvent('getWallets', { userName: storageManager.getUserName() }, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      data.wallets.forEach((wallet) => {
        if (wallet.team) {
          this.teamWalletAmount = wallet.amount;
          this.setWalletSpan({ teamAmount: wallet.amount });
        } else {
          const walletTop = document.getElementById('walletTop');
          walletTop.replaceChild(elementCreator.createSpan({ text: `${wallet.amount}${this.suffix}` }), walletTop.firstElementChild);

          this.walletAmount = wallet.amount;
          this.setWalletSpan({ userAmount: wallet.amount });
        }
      });
    });

    socketManager.emitEvent('getTransactions', { owner: storageManager.getUserName() }, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      const { toTransactions, fromTransactions } = data;
      const allTransactions = toTransactions.concat(fromTransactions);

      allTransactions.sort((a, b) => {
        const aValue = a.time;
        const bValue = b.time;

        if (aValue < bValue) {
          return 1;
        } else if (aValue > bValue) {
          return -1;
        }

        return 0;
      });

      const fragment = document.createDocumentFragment();
      allTransactions.forEach(transaction => fragment.appendChild(createTransactionItem({ suffix: this.suffix, transaction })));

      this.viewer.lastElementChild.innerHTML = '';
      this.viewer.lastElementChild.appendChild(fragment);
    });
  }

  populateList() {
    const systemList = new List({
      title: 'SYSTEM',
      shouldSort: false,
    });
    const teamList = new List({
      title: 'TEAMS',
      shouldSort: true,
    });
    this.userList = new List({
      title: 'transfer_to',
      shouldSort: true,
    });

    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(teamList.element);
    this.itemList.appendChild(this.userList.element);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        if (storageManager.getToken()) {
          this.getTransactions({ teamList });
        } else {
          this.resetWallets();
          this.viewer.lastElementChild.innerHTML = '';
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.TRANSACTION,
      func: ({ transaction, wallet, toWallet }) => {
        this.addTransaction(createTransactionItem({ suffix: this.suffix, transaction }));
        this.changeWalletAmount({ wallet });

        if (toWallet) {
          this.changeWalletAmount({ wallet: toWallet });
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.NEWTEAM,
      func: ({ team: { teamName } }) => {
        teamList.addItem({ item: this.createTransactionButton({ receiverName: `${teamName}-team`, readableName: teamName }) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.TEAM,
      func: () => {
        this.getTransactions({ teamList });
      },
    });
  }

  resetWallets() {
    this.walletAmount = 0;
    this.teamWalletAmount = 0;
    this.setWalletSpan({});
  }

  setWalletSpan({ userAmount, teamAmount }) {
    const teamName = storageManager.getTeam();
    let amountString = `WALLET: ${userAmount || this.walletAmount}${this.suffix}`;

    if (teamName) {
      amountString += `. TEAM WALLET: ${teamAmount || this.teamWalletAmount}${this.suffix}`;
    }

    this.viewer.firstElementChild.innerHTML = '';
    this.viewer.firstElementChild.classList.add('hide');
    this.viewer.firstElementChild.appendChild(document.createTextNode(amountString));
  }

  changeWalletAmount({ wallet }) {
    const teamName = storageManager.getTeam();
    const aliases = storageManager.getAliases();
    aliases.push(storageManager.getUserName());

    if (aliases.indexOf(wallet.owner) > -1) {
      const walletTop = document.getElementById('walletTop');
      walletTop.replaceChild(elementCreator.createSpan({ text: `${wallet.amount}${this.suffix}` }), walletTop.firstElementChild);

      this.walletAmount = wallet.amount;
    } else if (teamName && teamName === wallet.team) {
      this.teamWalletAmount = wallet.amount;
    }

    this.setWalletSpan({});
  }

  addTransaction(transactionItem) {
    this.viewer.lastElementChild.insertBefore(transactionItem, this.viewer.lastElementChild.firstElementChild);
  }
}

module.exports = Wallet;
