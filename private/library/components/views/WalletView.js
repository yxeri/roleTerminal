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

class WalletView extends ViewWrapper {
  constructor({
    classes = [],
    elementId = `wView-${Date.now()}`,
  }) {
    const transactionList = new TransactionList({});
    const userList = new UserList({
      title: 'Users',
    });

    super({
      elementId,
      columns: [
        { components: [{ component: userList }] },
        { components: [{ component: transactionList }] },
      ],
      classes: classes.concat(['walletView']),
    });
  }
}

module.exports = WalletView;
