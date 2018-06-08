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
const textTools = require('../../TextTools');

class MessageList extends List {
  /**
   * MessageList constructor.
   * @param {Object} params - Parameters.
   * @param {boolean} [params.multiRoom] - Should messages from all rooms be retrieved and shown in the list?
   * @param {boolean} [params.shouldSwitchRoom] - Should the messages only be retrieved from the user's current room?
   * @param {string} [params.roomId] - Id of the room to retrieve messages from.
   * @param {string[]} [params.classes] - CSS classes.
   * @param {string} [params.elementId] - Id of the list element.
   */
  constructor({
    multiRoom = false,
    shouldSwitchRoom = false,
    roomId,
    roomListId = '',
    userRoomListId = '',
    classes = [],
    elementId = `mList-${Date.now()}`,
  }) {
    const superParams = {
      elementId,
      shouldScrollToBottom: true,
      classes: classes.concat(['msgList']),
      dependencies: [
        dataHandler.users,
        dataHandler.rooms,
        dataHandler.aliases,
        dataHandler.teams,
      ],
      shouldFocusOnClick: false,
      collector: dataHandler.messages,
      fieldToAppend: 'text',
      appendClasses: ['msgLine'],
      listItemFieldsClasses: ['msgInfo'],
      listItemFields: [
        {
          paramName: 'ownerAliasId',
          fallbackTo: 'ownerId',
          convertFunc: (objectId) => {
            const user = dataHandler.users.getObject({ objectId });

            return user ? user.username : objectId;
          },
        }, {
          paramName: 'customTimeCreated',
          fallbackTo: 'timeCreated',
          convertFunc: (date) => {
            const timestamp = textTools.generateTimestamp({ date });

            return `${timestamp.fullTime} ${timestamp.fullDate}`;
          },
        }, {
          classes: ['msgRoomName'],
          paramName: 'roomId',
          convertFunc: (objectId) => {
            const room = dataHandler.rooms.getObject({ objectId });

            return room ? room.roomName : objectId;
          },
        },
      ],
    };

    if (!multiRoom) {
      superParams.filter = {
        rules: [
          { paramName: 'roomId', paramValue: roomId || storageManager.getCurrentRoom() },
        ],
      };
    }

    super(superParams);

    this.userRoomListId = userRoomListId;
    this.roomListId = roomListId;
    this.roomId = roomId || this.getRoomId();

    eventCentral.addWatcher({
      event: eventCentral.Events.FOLLOWED_ROOM,
      func: ({ room }) => {
        if (room.objectId === this.getRoomId()) {
          this.showMessagesByRoom({ roomId: room.objectId });
        }
      },
    });

    if (shouldSwitchRoom) {
      eventCentral.addWatcher({
        event: eventCentral.Events.SWITCH_ROOM,
        func: ({ origin, room }) => {
          if (!origin || (this.roomListId === origin || this.userRoomListId === origin)) {
            this.showMessagesByRoom({ roomId: room.objectId });
          }
        },
      });
    }
  }

  showMessagesByRoom({ roomId }) {
    this.roomId = roomId;
    this.filter = { rules: [{ paramName: 'roomId', paramValue: roomId }] };

    this.appendList();
  }

  setRoomListId(id) {
    this.roomListId = id;
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  getRoomId() {
    return this.roomId || storageManager.getCurrentRoom();
  }
}

module.exports = MessageList;
