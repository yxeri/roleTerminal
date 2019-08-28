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

const List = require('../library/components/lists/List');
const UserDialog = require('../library/components/views/dialogs/UserDialog');

const dataHandler = require('../library/data/DataHandler');
const storageManager = require('../library/StorageManager');
const aliasComposer = require('../library/data/composers/AliasComposer');
const accessCentral = require('../library/AccessCentral');
const viewSwitcher = require('../library/ViewSwitcher');
const userComposer = require('../library/data/composers/UserComposer');
const labelHandler = require('../library/labels/LabelHandler');

class UserList extends List {
  constructor({
    title,
    shouldFocusOnClick,
    minimumAccessLevel,
    effect,
    shouldToggle,
    showImage = true,
    classes = [],
    elementId = `spoonyUserList-${Date.now()}`,
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
          {
            valueType: 'object',
            shouldInclude: true,
            paramName: 'customFields',
            paramValue: {
              name: 'spoony',
              value: true,
            },
          },
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

    return allAliases.concat(allUsers)
      .filter(object => !userAliases.includes(object.objectId))
      .filter(object => object.customFields && object.customFields.find(field => field.name === 'spoony' && field.value))
      .sort((a, b) => {
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
