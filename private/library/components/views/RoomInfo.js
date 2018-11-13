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

const ViewWrapper = require('../ViewWrapper');
const EditRoomDialog = require('./dialogs/EditRoomDialog');

const roomComposer = require('../../data/composers/RoomComposer');
const userComposer = require('../../data/composers/UserComposer');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const storageManager = require('../../StorageManager');
const accessCentral = require('../../AccessCentral');

class RoomInfo extends ViewWrapper {
  constructor({
    userText = 'User: ',
    whisperText = ' <-> ',
    classes = [],
    elementId = `rInfo-${Date.now()}`,
  }) {
    const nameSpan = elementCreator.createSpan({ text: 'room' });
    const editButton = elementCreator.createButton({
      text: 'Edit',
      clickFuncs: {
        leftFunc: () => {
          const dialog = new EditRoomDialog({
            roomId,
          });

          dialog.addToView({});
        },
      },
    });
    const setNameFunc = ({
      isUser,
      roomId,
    }) => {
      nameSpan.innerHTML = '';

      const foundRoom = roomComposer.getRoom({ roomId });

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

      nameSpan.appendChild(document.createTextNode(foundRoom.roomName));
    };

    super({
      elementId,
      useDefaultCss: false,
      classes: classes.concat(['roomInfo']),
    });

    this.element.appendChild(nameSpan);

    accessCentral.addAccessElement({
      element: editButton,
      minimumAccessLevel: 1,
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

module.exports = RoomInfo;
