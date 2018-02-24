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
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');

class MessageList extends List {
  /**
   * MessageList constructor.
   * @param {Object} params - Parameters.
   * @param {boolean} [params.shouldSwitchRoom] - Should the messages only be retrieved from the user's current room?
   * @param {boolean} [params.lockedToRoom] - Should the list be unaffected by room switches triggered by the user?
   * @param {string[]} [params.classes] - CSS classes.
   * @param {string} [params.elementId] - Id of the list element.
   */
  constructor({
    shouldSwitchRoom = false,
    lockedToRoom = false,
    classes = [],
    elementId = `mList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'roomId',
        convertFunc: (objectId) => {
          const room = dataHandler.rooms.getObject({ objectId });

          return room ? room.roomName : objectId;
        },
      }, {
        paramName: 'ownerAliasId',
        fallbackTo: 'ownerId',
        convertFunc: (objectId) => {
          const user = dataHandler.users.getObject({ objectId });

          return user ? user.username : objectId;
        },
      },
    ];

    const superParams = {
      elementId,
      classes: classes.concat(['msgList']),
      dependencies: [
        dataHandler.users,
        dataHandler.rooms,
      ],
      shouldFocusOnClick: false,
      collector: dataHandler.messages,
      listItemFields: headerFields,
      fieldToAppend: 'text',
    };

    if (shouldSwitchRoom) {
      superParams.filter = {
        rules: [
          { paramName: 'roomId', paramValue: storageManager.getCurrentRoom() },
        ],
      };

      if (!lockedToRoom) {
        eventCentral.addWatcher({
          event: eventCentral.Events.SWITCH_ROOM,
          func: ({ room }) => {
            this.showMessagesByRoom({ roomId: room.objectId });
          },
        });
      }
    }

    super(superParams);

    eventCentral.addWatcher({
      event: eventCentral.Events.ROOM,
      func: ({ room }) => {
        if ((shouldSwitchRoom && room.objectId === storageManager.getCurrentRoom()) || !shouldSwitchRoom) {

        }
      },
    });
  }

  showMessagesByRoom({ roomId }) {
    this.filter = { rules: [{ paramName: 'roomId', paramValue: roomId }] };
    this.appendList();
  }
}

module.exports = MessageList;
