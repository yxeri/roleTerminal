/*
 Copyright 2018 Aleksandar Jankovic

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
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const aliasComposer = require('../../data/composers/AliasComposer');
const accessCentral = require('../../AccessCentral');

class RoomList extends List {
  constructor({
    title,
    classes = [],
    elementId = `userRList-${Date.now()}`,
  }) {
    classes.push('roomList');
    classes.push('userRoomList');

    const headerFields = [
      { paramName: 'username' },
    ];

    super({
      elementId,
      classes,
      title,
      minAccessLevel: accessCentral.AccessLevels.STANDARD,
      dependencies: [
        dataHandler.rooms,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
      focusedId: storageManager.getCurrentRoom(),
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const whisperPermission = storageManager.getPermissions().SendWhisper || { accessLevel: 1 };

          if (storageManager.getAccessLevel() < whisperPermission.accessLevel) {
            return;
          }

          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_ROOM,
            params: {
              origin: this.elementId,
              listType: this.ListTypes.ROOMS,
              room: {
                objectId,
                isUser: true,
              },
            },
          });
        },
      },
      collector: dataHandler.users,
      listItemFields: headerFields,
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_ROOM,
      func: ({
        room,
        origin,
        listType = '',
      }) => {
        if (origin && origin === this.elementId) {
          return;
        } else if (listType !== this.ListTypes.ROOMS) {
          return;
        }

        const { objectId } = room;

        this.setFocusedListItem(objectId);
      },
    });
  }

  getCollectorObjects() {
    const aliases = [storageManager.getUserId()].concat(aliasComposer.getCurrentUserAliases());

    return this.collector.getObjects({
      filter: this.filter,
      sorting: this.sorting,
    }).filter(object => !aliases.includes(object.objectId));
  }
}

module.exports = RoomList;
