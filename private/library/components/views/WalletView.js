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

class WalletView extends ViewWrapper {
  constructor({
    effect,
    classes = [],
    elementId = `wView-${Date.now()}`,
  }) {
    const transactionList = new TransactionList({ effect });
    const userList = new UserList({
      effect,
      title: 'Users',
    });
    const teamList = new TeamList({
      effect,
      title: 'Teams',
    });

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
        { components: [{ component: transactionList }], classes: ['columnTransactionList'] },
      ],
      classes: classes.concat(['walletView']),
    });
  }
}

module.exports = WalletView;
