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

import BaseView from './BaseView';
import EditRoomDialog from './dialogs/EditRoomDialog';

import elementCreator from '../../ElementCreator';
import roomComposer from '../../data/composers/RoomComposer';
import userComposer from '../../data/composers/UserComposer';
import eventCentral from '../../EventCentral';
import storageManager from '../../react/StorageManager';
import accessCentral from '../../AccessCentral';

class RoomInfo extends BaseView {
  constructor({
    corners = [],
    userText = 'User: ',
    whisperText = ' <-> ',
    classes = [],
    elementId = `rInfo-${Date.now()}`,
  }) {
    const nameSpan = elementCreator.createSpan({ text: 'room' });
    const setNameFunc = ({
      isUser,
      roomId,
    }) => {
      const foundRoom = roomComposer.getRoom({ roomId }) || {};
      this.roomId = roomId;

      nameSpan.innerHTML = '';

      if (isUser || foundRoom.isUser) {
        nameSpan.appendChild(document.createTextNode(`${userText}${userComposer.getIdentityName({ objectId: roomId })}`));

        return;
      }

      if (foundRoom.isWhisper) {
        const { participantIds } = foundRoom;
        const identities = userComposer.getWhisperIdentities({ participantIds });

        nameSpan.appendChild(document.createTextNode(identities.length > 0
          ? `${identities[0].username || identities[0].aliasName}${whisperText}${identities[1].username || identities[1].aliasName}`
          : ''));

        return;
      }

      if (foundRoom.roomName) {
        nameSpan.appendChild(document.createTextNode(foundRoom.roomName));
      }
    };

    super({
      corners,
      elementId,
      useDefaultCss: false,
      classes: classes.concat([
        'roomInfo',
        'clickable',
      ]),
    });

    this.roomId = null;

    this.element.appendChild(nameSpan);
    this.element.addEventListener('click', () => {
      if (this.roomId) {
        const { hasFullAccess } = accessCentral.hasAccessTo({
          objectToAccess: roomComposer.getRoom({ roomId: this.roomId }),
          toAuth: userComposer.getCurrentUser(),
        });

        if (!hasFullAccess) {
          return;
        }

        const dialog = new EditRoomDialog({
          roomId: this.roomId,
        });

        dialog.addToView({});
      }
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_ROOM,
      func: () => {
        setNameFunc({ roomId: storageManager.getCurrentRoom() });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_ROOM,
      func: ({
        isUser,
        room,
      }) => {
        setNameFunc({
          isUser,
          roomId: room.objectId,
        });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.ROOM,
      func: ({ room }) => {
        if (this.roomId && room.objectId === this.roomId) {
          setNameFunc({ roomId: this.roomId });
        }
      },
    });
  }
}

export default RoomInfo;
