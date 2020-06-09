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

const List = require('./List');

const dataHandler = require('../../data/DataHandler');
const userComposer = require('../../data/composers/UserComposer');
const teamComposer = require('../../data/composers/TeamComposer');

class AdminWalletList extends List {
  constructor({
    effect,
    shouldToggle,
    classes = [],
    elementId = `aWList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'objectId',
        convertFunc: (objectId) => {
          let name = userComposer.getIdentityName({ objectId });

          if (name === '') {
            name = `Team: ${teamComposer.getTeamName({ teamId: objectId })}`;
          }

          return name;
        },
      }, {
        paramName: 'amount',
      },
    ];

    super({
      elementId,
      effect,
      shouldToggle,
      title: 'Wallets',
      shouldFocusOnClick: false,
      classes: classes.concat(['walletList']),
      dependencies: [
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.wallets,
      ],
      collector: dataHandler.wallets,
      listItemFields: headerFields,
    });
  }
}

module.exports = AdminWalletList;
