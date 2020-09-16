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

import List from './List';
import UserDialog from '../views/dialogs/UserDialog';

import dataHandler from '../../data/DataHandler';
import storageManager from '../../StorageManager';
import aliasComposer from '../../data/composers/AliasComposer';
import accessCentral from '../../AccessCentral';
import viewSwitcher from '../../ViewSwitcher';
import userComposer from '../../data/composers/UserComposer';
import labelHandler from '../../labels/LabelHandler';

export default class UserList extends List {
  constructor({
    shouldFocusOnClick,
    minimumAccessLevel,
    effect,
    shouldToggle,
    includeSelf = false,
    showImage = true,
    classes = [],
    elementId = `userList-${Date.now()}`,
  }) {
    classes.push('userList');

    const headerFields = [{
      paramName: 'username',
      fallbackTo: 'aliasName',
      classes: ['username'],
    }, {
      paramName: 'offName',
      isOff: true,
      classes: ['offName', 'offValue'],
      convertFunc: (offName) => {
        if (offName && typeof offName !== 'boolean') {
          return offName;
        }

        return '';
      },
    }];

    const params = {
      elementId,
      classes,
      title: labelHandler.getLabel({ baseObject: 'List', label: 'users' }),
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

    if (showImage) {
      params.imageInfo = {
        paramName: 'objectId',
        show: true,
        getImage: (userId) => { return userComposer.getImage(userId); },
      };
    }

    super(params);

    this.includeSelf = includeSelf;
  }

  getCollectorObjects() {
    const userAliases = [storageManager.getUserId()].concat(aliasComposer.getCurrentUserAliases().map((alias) => alias.objectId));
    const allAliases = aliasComposer.getAllAliases();
    const allUsers = this.collector.getObjects({
      filter: this.filter,
    });
    const allIdentities = this.includeSelf
      ? allAliases.concat(allUsers)
      : allAliases.concat(allUsers).filter((object) => !userAliases.includes(object.objectId));

    return allIdentities.sort((a, b) => {
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
