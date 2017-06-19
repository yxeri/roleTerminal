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
 * @param {string} params.to Receiver
 * @param {string} params.from Sender
 * @param {number} params.amount Amount
 * @param {Date} params.time Time stamp
 * @returns {HTMLLIElement} List item
 */
function createTransactionItem({ transaction: { to, from, amount, time, note, coordinates } }) {
  const listItem = document.createElement('LI');
  const date = textTools.generateTimeStamp({ date: time });

  listItem.appendChild(elementCreator.createParagraph({ text: `${date.fullTime} ${date.fullDate}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `${from} -> ${to}` }));
  listItem.appendChild(elementCreator.createParagraph({ text: `Amount: ${amount}d` }));

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
 * @param {string[]} users - List of users
 * @returns {string[]} List of users, excluding current user name and aliases
 */
function filterUserAliases(users) {
  const aliases = storageManager.getAliases();
  aliases.push(storageManager.getUserName());

  return users.filter(user => aliases.indexOf(user.userName) === -1);
}

class Wallet extends StandardView {
  constructor() {
    super({ viewId: 'wallet' });

    this.viewer.appendChild(elementCreator.createParagraph({ text: '' }));
    this.viewer.appendChild(elementCreator.createList({}));
    this.viewer.classList.add('selectedView');
    this.walletAmount = 0;
    this.teamWalletAmount = 0;

    this.populateList();
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
                    transDialog.changeExtraDescription({ text: ['Something went wrong', 'Failed to transfer credits'] });

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
        socketManager.emitEvent('listTeams', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { teams } = data;

          teamList.replaceAllItems({ items: teams.map(team => this.createTransactionButton({ receiverName: `${team.teamName}-team`, readableName: team.teamName })) });
        });

        socketManager.emitEvent('listUsers', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { onlineUsers, offlineUsers } = data;
          const allUsers = filterUserAliases(onlineUsers.concat(offlineUsers));

          userList.replaceAllItems({ items: allUsers.map(user => this.createTransactionButton({ receiverName: user.userName })) });
        });

        if (storageManager.getAccessLevel() > 0) {
          const teamName = storageManager.getTeam();

          if (teamName) {
            socketManager.emitEvent('getWallet', { isTeam: true }, ({ error, data }) => {
              if (error) {
                console.log(error);

                return;
              }

              this.teamWalletAmount = data.wallet.amount;
              this.changeWalletAmount({ amount: 0, from: '', to: '' });
            });
          }

          socketManager.emitEvent('getWallet', {}, ({ error, data }) => {
            if (error) {
              console.log(error);

              return;
            }

            this.walletAmount = data.wallet.amount;
            this.changeWalletAmount({ amount: 0, from: '', to: '' });
          });

          socketManager.emitEvent('getAllTransactions', { isTeam: teamName }, ({ error, data }) => {
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
        } else {
          this.teamWalletAmount = 0;
          this.walletAmount = 0;
          this.changeWalletAmount({ amount: 0, from: '', to: '' });
          this.viewer.lastElementChild.innerHTML = '';
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.TRANSACTION,
      func: ({ transaction }) => {
        this.addTransaction(createTransactionItem({ transaction }));
        this.changeWalletAmount({ amount: transaction.amount, from: transaction.from, to: transaction.to });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.NEWTEAM,
      func: ({ team: { teamName } }) => {
        teamList.addItem({ item: this.createTransactionButton({ receiverName: `${teamName}-team`, readableName: teamName }) });
      },
    });
  }

  changeWalletAmount({ amount, from, to }) {
    const teamName = storageManager.getTeam();
    const aliases = storageManager.getAliases();
    aliases.push(storageManager.getUserName());

    if (teamName) {
      if (from === `${teamName}-team`) {
        this.teamWalletAmount -= amount;
      } else if (to === `${teamName}-team`) {
        this.teamWalletAmount += amount;
      }
    }

    if (aliases.indexOf(from) > -1) {
      this.walletAmount -= amount;
    } else if (aliases.indexOf(to) > -1) {
      this.walletAmount += amount;
    }

    const amountString = document.createTextNode(`WALLET AMOUNT: ${this.walletAmount}. TEAM WALLET AMOUNT: ${this.teamWalletAmount}`);

    this.viewer.firstElementChild.innerHTML = '';
    this.viewer.firstElementChild.appendChild(amountString);
  }

  addTransaction(transactionItem) {
    this.viewer.lastElementChild.insertBefore(transactionItem, this.viewer.lastElementChild.firstElementChild);
  }
}

module.exports = Wallet;