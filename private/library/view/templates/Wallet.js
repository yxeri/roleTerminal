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
 * @param {string} to - Receiver
 * @param {string} from - Sender
 * @param {number} amount - Amount
 * @param {Date} time - Time stamp
 * @returns {HTMLLIElement} List item
 */
function createTransactionItem({ transaction: { to, from, amount, time, note } }) {
  const listItem = document.createElement('LI');
  const date = textTools.generateTimeStamp({ date: time });

  listItem.appendChild(elementCreator.createParagraph({ text: `${date.fullTime} ${date.fullDate}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `${from} -> ${to}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `Amount: ${amount}d` }));

  if (note) {
    listItem.appendChild(elementCreator.createParagraph({ text: `${note}` }));
  }

  return listItem;
}

/**
 * Takes a list of user names and filters out current users user name and aliases
 * @param {string[]} users - List of users
 * @returns {string[]} List of users, excluding current user name and aliases
 */
function filterUserAliases(users) {
  const aliases = storageManager.getAliases();
  aliases.push(storageManager.getUserName());

  return users.filter(user => aliases.indexOf(user) === -1);
}

class Wallet extends StandardView {
  constructor() {
    super({ viewId: 'wallet' });

    this.viewer.appendChild(elementCreator.createParagraph({ text: '' }));
    this.viewer.appendChild(elementCreator.createList({}));
    this.viewer.classList.add('selectedView');
    this.walletAmount = 0;

    this.populateList();
    this.populateHistory();
  }

  createTransactionButton({ receiverName, readableName }) {
    const radioSet = {
      type: 'radioSet',
      title: 'Which wallet do you want to use?',
      optionName: 'visibility',
      options: [
        { optionId: 'myWallet', optionLabel: 'Mine', default: true },
        { optionId: 'teamWallet', optionLabel: 'Team', requiresTeam: true },
      ],
    };
    const inputs = [{
      placeholder: 'Amount',
      inputName: 'amount',
      isRequired: true,
    }, {
      placeholder: 'Message to receiver',
      inputName: 'note',

    }, radioSet];

    const button = elementCreator.createButton({
      inputs,
      data: receiverName,
      text: readableName || receiverName,
      func: () => {
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
                const teamOption = document.getElementById('teamWallet');

                console.log(teamOption);

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

                socketManager.emitEvent('createTransaction', { transaction, fromTeam: teamOption && teamOption.checked }, ({ error: createError, data }) => {
                  if (createError) {
                    console.log(createError);

                    return;
                  }

                  eventCentral.triggerEvent({
                    event: eventCentral.Events.TRANSACTION,
                    params: { transaction: data.transaction },
                  });
                  transDialog.removeView();
                });
              },
            },
          },
          description: [
            'Dogecoin transfer tool',
          ],
          extraDescription: [`How much do you want to transfer to ${receiverName}?`],
        });
        transDialog.appendTo(this.element.parentElement);
      },
    });

    return button;
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
    const userList = new List({
      title: 'USERS',
      shouldSort: true,
    });

    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(teamList.element);
    this.itemList.appendChild(userList.element);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        socketManager.emitEvent('listUsers', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { onlineUsers, offlineUsers } = data;
          const allUsers = filterUserAliases(onlineUsers.concat(offlineUsers));

          userList.replaceAllItems({ items: allUsers.map(receiverName => this.createTransactionButton({ receiverName })) });
        });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.TEAM,
      func: () => {
        socketManager.emitEvent('listTeams', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { teams } = data;

          teamList.replaceAllItems({ items: teams.map(team => this.createTransactionButton({ receiverName: `${team.teamName}-team`, readableName: team.teamName })) });
        });
      },
    });
  }

  populateHistory() {
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        if (storageManager.getAccessLevel() > 0) {
          socketManager.emitEvent('getWallet', {}, ({ error, data }) => {
            if (error) {
              console.log(error);

              return;
            }

            this.walletAmount = data.wallet.amount;
            this.changeWalletAmount({ amount: 0, from: '' });
          });

          socketManager.emitEvent('getAllTransactions', {}, ({ error, data }) => {
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
            allTransactions.forEach(transaction => fragment.appendChild(createTransactionItem({ transaction })));

            this.viewer.lastElementChild.innerHTML = '';
            this.viewer.lastElementChild.appendChild(fragment);
          });
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.TRANSACTION,
      func: ({ transaction }) => {
        this.addTransaction(createTransactionItem({ transaction }));
        this.changeWalletAmount({ amount: transaction.amount, from: transaction.from });
      },
    });
  }

  changeWalletAmount({ amount, from }) {
    const aliases = storageManager.getAliases();
    aliases.push(storageManager.getUserName());

    if (aliases.indexOf(from) > -1) {
      this.walletAmount -= amount;
    } else {
      this.walletAmount += amount;
    }

    this.viewer.firstElementChild.innerHTML = '';
    this.viewer.firstElementChild.appendChild(document.createTextNode(`WALLET AMOUNT: ${this.walletAmount}`));
  }

  addTransaction(transactionItem) {
    this.viewer.lastElementChild.insertBefore(transactionItem, this.viewer.lastElementChild.firstElementChild);
  }
}

module.exports = Wallet;
