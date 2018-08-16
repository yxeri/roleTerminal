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
const LockedRoomDialog = require('../views/dialogs/LockedRoomDialog');

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const roomComposer = require('../../data/composers/RoomComposer');
const userComposer = require('../../data/composers/UserComposer');
const viewSwitcher = require('../../ViewSwitcher');
const accessCentral = require('../../AccessCentral');

class RoomList extends List {
  constructor({
    title,
    minimumAccessLevel,
    classes = [],
    elementId = `rList-${Date.now()}`,
  }) {
    classes.push('roomList');
    classes.push('chatRoomList');

    super({
      title,
      elementId,
      classes,
      minimumAccessLevel: minimumAccessLevel || accessCentral.AccessLevels.STANDARD,
      filter: {
        rules: [
          { paramName: 'isUser', paramValue: false },
          { paramName: 'isWhisper', paramValue: false },
        ],
      },
      userFilter: {
        rules: [{
          paramName: 'followingRooms',
          shouldInclude: true,
          objectParamName: 'objectId',
          shouldBeTrue: false,
        }],
      },
      listItemFields: [
        {
          paramName: 'objectId',
          convertFunc: (objectId) => {
            const room = roomComposer.getRoom({ roomId: objectId });

            if (room) {
              return room.roomName;
            }

            return objectId;
          },
        },
      ],
      focusedId: storageManager.getCurrentRoom(),
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const {
            roomName,
            objectId: roomId,
          } = roomComposer.getRoom({ roomId: objectId });

          roomComposer.follow({
            roomId,
            callback: ({ error }) => {
              if (error) {
                if (error.type === 'not allowed' && error.extraData.param === 'password') {
                  const lockedDialog = new LockedRoomDialog({
                    roomId,
                    roomName,
                    listId: this.elementId,
                    listType: this.listType,
                  });

                  lockedDialog.addToView({
                    element: viewSwitcher.getParentElement(),
                  });

                  return;
                }

                return;
              }

              // eventCentral.emitEvent({
              //   event: eventCentral.Events.SWITCH_ROOM,
              //   params: {
              //     listType: this.ListTypes.ROOMS,
              //     origin: this.elementId,
              //     room: {
              //       objectId: roomId,
              //     },
              //   },
              // });

              eventCentral.emitEvent({
                event: eventCentral.Events.FOLLOWED_ROOM,
                params: {
                  room: { objectId: roomId },
                },
              });
            },
          });
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
      event: eventCentral.Events.FOLLOWED_ROOM,
      func: ({
        room,
      }) => {
        this.removeListItem({ objectId: room.objectId });
      },
    });
  }

  getCollectorObjects() {
    const currentUser = userComposer.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const allRooms = this.collector.getObjects({
      filter: this.filter,
    });
    const { followingRooms = [] } = currentUser;

    return allRooms.filter(object => !followingRooms.includes(object.objectId)).sort((a, b) => {
      const aParam = a.roomName.toLowerCase();
      const bParam = b.roomName.toLowerCase();

      if (aParam < bParam) {
        return -1;
      } else if (aParam > bParam) {
        return 1;
      }

      return 0;
    });
  }
}

module.exports = RoomList;
