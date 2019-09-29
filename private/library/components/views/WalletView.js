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

const ViewWrapper = require('../ViewWrapper');
const TransactionList = require('../lists/TransactionList');
const UserList = require('../lists/UserList');
const TeamList = require('../lists/TeamList');
const WalletInfo = require('./WalletInfo');
const labelHandler = require('../../labels/LabelHandler');

class WalletView extends ViewWrapper {
  constructor({
    effect,
    corners,
    classes = [],
    elementId = `wView-${Date.now()}`,
  }) {
    const walletInfo = new WalletInfo({
      corners,
      sign: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'currency' }),
      appendSign: true,
      showName: true,
      showTeam: true,
    });
    const transactionList = new TransactionList({ effect });
    const userList = new UserList({
      effect,
      includeSelf: true,
      shouldToggle: true,
      title: 'Users',
    });
    const teamList = new TeamList({
      effect,
      shouldToggle: true,
      title: 'Teams',
    });

    userList.onToggle = () => { teamList.hideList(); };
    teamList.onToggle = () => { userList.hideList(); };

    super({
      elementId,
      columns: [
        {
          components: [
            { component: teamList },
            { component: userList },
          ],
          classes: [
            'columnList',
            'columnWalletList',
          ],
        },
        {
          components: [{
            component: walletInfo,
          }, {
            component: transactionList,
          }],
          classes: ['columnTransactionList'],
        },
      ],
      classes: classes.concat(['walletView']),
    });
  }
}

module.exports = WalletView;
