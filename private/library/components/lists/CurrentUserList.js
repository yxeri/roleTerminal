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

import dataHandler from '../../data/DataHandler';
import eventCentral from '../../EventCentral';
import storageManager from '../../StorageManager';
import userComposer from '../../data/composers/UserComposer';

export default class CurrentUserList extends List {
  constructor({
    effect,
    classes = [],
    elementId = `cUserList-${Date.now()}`,
  }) {
    classes.push('currentUserList');

    const headerFields = [
      { paramName: 'aliasName', fallbackTo: 'username' },
    ];

    super({
      elementId,
      classes,
      effect,
      sorting: {
        paramName: 'aliasName',
        fallbackParamName: 'username',
      },
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          if (objectId === storageManager.getUserId()) {
            storageManager.removeAliasId();
          } else {
            storageManager.setAliasId(objectId);
          }

          this.hideView();

          eventCentral.emitEvent({
            params: { userId: objectId },
            event: eventCentral.Events.CHANGED_ALIAS,
          });
        },
      },
      dependencies: [
        dataHandler.aliases,
        dataHandler.users,
      ],
      collector: dataHandler.aliases,
      listItemFields: headerFields,
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.USER,
      func: ({ user }) => {
        const currentUser = userComposer.getCurrentUser();

        if (user.objectId === currentUser.objectId && user.username) {
          eventCentral.emitEvent({
            event: eventCentral.Events.CHANGED_NAME,
            params: {},
          });

          this.addOneItem({
            object: user,
            shouldFlash: true,
            shouldReplace: true,
          });
        }
      },
    });
  }

  getCollectorObjects() {
    const allObjects = this.collector.getObjects({
      filter: {
        rules: [{ paramName: 'ownerId', paramValue: storageManager.getUserId() }],
      },
      sorting: this.sorting,
    });
    const currentUser = userComposer.getCurrentUser();

    if (currentUser) {
      return [currentUser].concat(allObjects);
    }

    return allObjects;
  }
}
