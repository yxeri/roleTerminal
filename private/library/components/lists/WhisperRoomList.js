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

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const roomComposer = require('../../data/composers/RoomComposer');
const userComposer = require('../../data/composers/UserComposer');
const aliasComposer = require('../../data/composers/AliasComposer');
const accessCentral = require('../../AccessCentral');

class RoomList extends List {
  constructor({
    title,
    minimumAccessLevel,
    effect,
    whisperText = ' <-> ',
    classes = [],
    elementId = `wRList-${Date.now()}`,
  }) {
    classes.push('roomList');
    classes.push('whisperRoomList');

    super({
      title,
      elementId,
      classes,
      effect,
      sorting: {
        paramName: 'roomName',
      },
      minimumAccessLevel: minimumAccessLevel || accessCentral.AccessLevels.STANDARD,
      listType: 'whisperRooms',
      filter: {
        rules: [
          { paramName: 'isWhisper', paramValue: true },
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

                const identities = userComposer.getWhisperIdentities({ participantIds });
                const thisIdentityName = currentUser.aliases && currentUser.aliases.length > 0
                  ? identities[0].username || identities[0].aliasName
                  : '';

                return identities.length > 0
                  ? `${thisIdentityName}${whisperText}${identities[1].username || identities[1].aliasName}`
                  : '';
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
          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_ROOM,
            params: {
              listType: this.ListTypes.ROOMS,
              origin: this.elementId,
              room: {
                objectId,
              },
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
      event: eventCentral.Events.SWITCH_ROOM,
      func: ({
        room,
        origin,
        listType = '',
      }) => {
        const { objectId } = room;

        this.unmarkItem({ objectId });

        if ((origin && origin === this.elementId) || listType !== this.ListTypes.ROOMS) {
          return;
        }

        if (!origin || origin !== this.elementId) {
          this.removeFocusOnItem();
        }

        this.setFocusedListItem(objectId);
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.MESSAGE,
      func: ({
        message,
      }) => {
        const { roomId } = message;

        if (storageManager.getCurrentRoom() === roomId) {
          return;
        }

        this.markItem({ objectId: roomId });
      },
    });
  }

  hasAccess({ object, user = {} }) {
    const access = super.hasAccess({ object, user });

    return {
      canSee:
        (user.aliases && object.participantIds.some(participant => user.aliases.includes(participant)))
        || (user.objectId && object.participantIds.includes(user.objectId))
        || access.canSee,
    };
  }

  getCollectorObjects() {
    const currentUser = userComposer.getCurrentUser();
    const userAliases = [currentUser.objectId].concat(aliasComposer.getCurrentUserAliases().map(alias => alias.objectId));
    const allRooms = this.collector.getObjects({
      filter: this.filter,
    });

    if (!currentUser) {
      return [];
    }

    return allRooms.filter((room) => {
      return userAliases.find(objectId => room.participantIds.includes(objectId));
    }).sort((a, b) => {
      const aParam = a.roomName.toLowerCase();
      const bParam = b.roomName.toLowerCase();

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

module.exports = RoomList;
