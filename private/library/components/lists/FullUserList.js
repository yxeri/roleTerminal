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
const UserDialog = require('../views/dialogs/UserDialog');
const PersonPage = require('../views/pages/PersonPage');

const dataHandler = require('../../data/DataHandler');
const storageManager = require('../../StorageManager');
const aliasComposer = require('../../data/composers/AliasComposer');
const accessCentral = require('../../AccessCentral');
const viewSwitcher = require('../../ViewSwitcher');
const userComposer = require('../../data/composers/UserComposer');
const labelHandler = require('../../labels/LabelHandler');
const elementCreator = require('../../ElementCreator');

class UserList extends List {
  constructor({
    title,
    shouldFocusOnClick,
    minimumAccessLevel,
    effect,
    shouldToggle,
    showButtons = true,
    showImage = true,
    classes = [],
    elementId = `fUserList-${Date.now()}`,
  }) {
    classes.push('fullUserList');

    const headerFields = [{
      paramName: 'username',
      fallbackTo: 'aliasName',
      classes: ['username'],
    }, {
      paramName: 'pronouns',
      convertFunc: (pronouns) => {
        return pronouns.map(pronoun => labelHandler.getLabel({ baseObject: 'General', label: pronoun })).join(', ');
      },
    }, {
      paramName: 'offName',
      isOff: true,
      classes: ['offValue'],
      convertFunc: (offName) => {
        if (offName && typeof offName !== 'boolean') {
          return `${labelHandler.getLabel({ baseObject: 'UserList', label: 'offName' })}: ${offName}`;
        }

        return '';
      },
    }, {
      paramName: 'description',
      convertFunc: (description) => {
        if (description.length !== 0) {
          return `${labelHandler.getLabel({ baseObject: 'UserList', label: 'description' })}: ${description.join('\n')}`;
        }

        return '';
      },
    }];

    const params = {
      elementId,
      classes,
      title,
      shouldFocusOnClick,
      effect,
      shouldToggle,
      imageThumb: true,
      hasOffToggle: true,
      sorting: {
        paramName: 'username',
        fallbackParamName: 'aliasName',
      },
      filter: {
        rules: [
          { paramName: 'isBanned', paramValue: false },
          { paramName: 'isVerified', paramValue: true },
        ],
      },
      userFilter: {
        rules: [
          {
            paramName: 'objectId',
            shouldBeTrue: false,
            objectParamName: 'objectId',
          },
        ],
      },
      minimumAccessLevel: minimumAccessLevel || accessCentral.AccessLevels.STANDARD,
      dependencies: [
        dataHandler.rooms,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          if (storageManager.getAccessLevel() <= accessCentral.AccessLevels.ANONYMOUS) {
            return;
          }

          const userDialog = new UserDialog({ identityId: objectId });

          userDialog.addToView({ element: viewSwitcher.getParentElement() });
        },
      },
      collector: dataHandler.users,
      listItemFields: headerFields,
    };

    if (showButtons) {
      params.buttons = [
        elementCreator.createButton({
          image: {
            fileName: 'smile.png',
            height: 20,
            width: 20,
          },
          clickFuncs: {
            leftFunc: () => {
              const personPage = new PersonPage({});

              personPage.addToView({ element: viewSwitcher.getParentElement() });
            },
          },
        }),
      ];
    }

    if (showImage) {
      params.imageInfo = {
        paramName: 'objectId',
        show: true,
        getImage: (userId) => { return userComposer.getImage(userId); },
      };
    }

    super(params);
  }

  getCollectorObjects() {
    const userAliases = [storageManager.getUserId()].concat(aliasComposer.getCurrentUserAliases().map(alias => alias.objectId));
    const allAliases = aliasComposer.getAllAliases();
    const allUsers = this.collector.getObjects({
      filter: this.filter,
    });

    return allAliases.concat(allUsers).filter(object => !userAliases.includes(object.objectId)).sort((a, b) => {
      const aParam = (a.username || a.aliasName).toLowerCase();
      const bParam = (b.username || b.aliasName).toLowerCase();

      if (aParam < bParam) {
        return -1;
      }

      if (aParam > bParam) {
        return 1;
      }

      return 0;
    });
  }
}

module.exports = UserList;
