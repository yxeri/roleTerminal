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

import {
  rooms,
  users,
  aliases,
  teams,
} from '../../data/DataHandler';
import eventCentral from '../../EventCentral';
import storageManager from '../../StorageManager';
import roomComposer from '../../data/composers/RoomComposer';
import userComposer from '../../data/composers/UserComposer';
import labelHandler from '../../labels/LabelHandler';

export default class RoomFollowingList extends List {
  constructor({
    effect,
    shouldToggle,
    classes = [],
    elementId = `rFList-${Date.now()}`,
  }) {
    classes.push('roomList');
    classes.push('chatRoomFollowingList');

    super({
      title: labelHandler.getLabel({ baseObject: 'List', label: 'following' }),
      elementId,
      classes,
      effect,
      shouldToggle,
      sorting: {
        paramName: 'roomName',
      },
      listType: 'followedRooms',
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
          shouldBeTrue: true,
          objectParamName: 'objectId',
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
        right: (objectId) => {
          roomComposer.unfollow({
            roomId: objectId,
          });
        },
      },
      dependencies: [
        rooms,
        users,
        aliases,
        teams,
      ],
      collector: rooms,
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_ROOM,
      func: ({
        room,
        origin,
      }) => {
        const { objectId } = room;

        this.unmarkItem({ objectId });

        if (!origin || origin !== this.elementId) {
          this.removeFocusOnItem();
        }
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.FOLLOWED_ROOM,
      func: ({
        room,
        invited = false,
      }) => {
        const { objectId } = room;

        this.addOneItem({ object: room });

        if (!invited) {
          this.setFocusedListItem(objectId);

          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_ROOM,
            params: {
              room,
              origin: this.elementId,
            },
          });
        }
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

  getCollectorObjects() {
    const currentUser = userComposer.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const allRooms = this.collector.getObjects({
      filter: this.filter,
    });
    const { followingRooms = [] } = currentUser;

    return allRooms.filter((object) => followingRooms.includes(object.objectId)).sort((a, b) => {
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
