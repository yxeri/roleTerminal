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
const MessageDialog = require('../views/dialogs/MessageDialog');

const dataHandler = require('../../data/DataHandler');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const textTools = require('../../TextTools');
const userComposer = require('../../data/composers/UserComposer');
const accessCentral = require('../../AccessCentral');
const messageComposer = require('../../data/composers/MessageComposer');

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
    roomId,
    multiRoom = false,
    shouldSwitchRoom = false,
    whisperText = ' - ',
    roomLists = [],
    classes = [],
    elementId = `mList-${Date.now()}`,
  }) {
    const superParams = {
      elementId,
      sorting: {
        paramName: 'customTimeCreated',
        fallbackParamName: 'timeCreated',
      },
      listItemClickFuncs: {
        onlyListItemFields: true,
        leftFunc: (objectId) => {
          const message = messageComposer.getMessage({ messageId: objectId });
          const {
            hasFullAccess,
          } = accessCentral.hasAccessTo({
            objectToAccess: message,
            toAuth: userComposer.getCurrentUser(),
          });

          if (hasFullAccess) {
            const messageDialog = new MessageDialog({
              messageId: message.objectId,
              text: message.text,
            });

            messageDialog.addToView({
              element: this.getParentElement(),
            });
          }
        },
      },
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
            const identity = userComposer.getIdentity({ objectId });

            if (identity) {
              return identity.username || identity.aliasName;
            }

            return objectId;
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

            if (room) {
              const { isWhisper, participantIds } = room;

              if (isWhisper) {
                const identities = userComposer.getWhisperIdentities({ participantIds });

                return identities.length > 0
                  ? `${identities[0].username || identities[0].aliasName}${whisperText}${identities[1].username || identities[1].aliasName}`
                  : '';
              }

              return room.roomName.slice(0, 24);
            }

            return objectId;
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

    this.onCreateFunc = ({ object }) => {
      this.roomLists.every((roomList) => {
        const rooms = roomList.getCollectorObjects();
        const foundRoom = rooms.find(room => object.roomId === room.objectId);

        if (foundRoom) {
          roomList.animateElement({ elementId: foundRoom.objectId });

          return false;
        }

        return true;
      });
    };
    this.roomLists = roomLists;
    this.roomId = roomId || this.getRoomId();

    if (shouldSwitchRoom) {
      eventCentral.addWatcher({
        event: eventCentral.Events.SWITCH_ROOM,
        func: ({ origin, room }) => {
          if (!origin || this.roomLists.map(roomList => roomList.elementId).some(roomListId => roomListId === origin)) {
            this.getParentElement().classList.remove('flash');
            this.getParentElement().classList.add('flash');

            setTimeout(() => {
              this.getParentElement().classList.remove('flash');
            }, 400);

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
