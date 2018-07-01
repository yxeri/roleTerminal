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
const roomComposer = require('../../data/composers/RoomComposer');
const userComposer = require('../../data/composers/UserComposer');

class RoomList extends List {
  constructor({
    title,
    whisperText = ' <-> ',
    classes = [],
    elementId = `rList-${Date.now()}`,
  }) {
    classes.push('roomList');
    classes.push('chatRoomList');

    super({
      title,
      elementId,
      classes,
      filter: {
        rules: [
          { paramName: 'isUser', paramValue: false },
        ],
      },
      listItemFields: [
        {
          paramName: 'objectId',
          convertFunc: (objectId) => {
            const currentUser = userComposer.getCurrentUser();
            const room = roomComposer.getRoom({ roomId: objectId });
            const { isWhisper, participantIds } = room;

            if (room) {
              if (isWhisper) {
                if (!currentUser) {
                  return '';
                }

                const users = userComposer.getWhisperUsers({ participantIds });

                return users.length > 0 ? `${users[0].username}${whisperText}${users[1].username}` : '';
              }

              return room.roomName;
            }

            return '';
          },
        },
      ],
      focusedId: storageManager.getCurrentRoom(),
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const roomId = objectId;

          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_ROOM,
            params: {
              listType: this.ListTypes.ROOMS,
              origin: this.elementId,
              room: {
                objectId: roomId,
              },
            },
          });

          roomComposer.follow({ roomId });
        },
      },
      dependencies: [
        dataHandler.rooms,
        dataHandler.users,
        dataHandler.aliases,
        dataHandler.teams,
      ],
      collector: dataHandler.rooms,
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
        } if (listType !== this.ListTypes.ROOMS) {
          return;
        }

        const { objectId } = room;

        this.setFocusedListItem(objectId);
      },
    });
  }
}

module.exports = RoomList;
