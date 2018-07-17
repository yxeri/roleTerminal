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
const MessageList = require('../lists/MessageList');
const RoomList = require('../lists/RoomList');
const InputArea = require('./inputs/InputArea');
const UserRoomList = require('../lists/UserRoomList');
const WhisperRoomList = require('../lists/WhisperRoomList');
const RoomFollowingList = require('../lists/RoomFollowingList');

const messageComposer = require('../../data/composers/MessageComposer');
const accessCentral = require('../../AccessCentral');
const roomComposer = require('../../data/composers/RoomComposer');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const textTools = require('../../TextTools');

class ChatView extends ViewWrapper {
  constructor({
    shouldResize,
    placeholder,
    sendOnEnter = true,
    hideRoomList = false,
    classes = [],
    roomListPlacement = 'left',
    inputPlacement = 'bottom',
    elementId = `chView-${Date.now()}`,
  }) {
    const roomList = new RoomList({
      title: 'room',
    });
    const roomFollowingList = new RoomFollowingList({
      title: 'following',
    });
    const whisperRoomList = new WhisperRoomList({
      title: 'whisper',
    });
    const userRoomList = new UserRoomList({
      title: 'user',
    });
    const messageList = new MessageList({
      shouldSwitchRoom: true,
      roomLists: [
        roomFollowingList,
        roomList,
        whisperRoomList,
        userRoomList,
      ],
    });
    const inputArea = new InputArea({
      shouldResize,
      placeholder,
      sendOnEnter,
      classes: [inputPlacement],
      triggerCallback: ({ text }) => {
        if (textTools.trimSpace(text.join('')).length === 0) {
          return;
        }

        const roomId = messageList.getRoomId();
        const room = roomComposer.getRoom({ roomId });
        const participantIds = room.isWhisper ?
          room.participantIds :
          [];
        const message = {
          text,
          roomId,
        };

        if (room.isUser) {
          message.messageType = messageComposer.MessageTypes.WHISPER;
          participantIds.push(storageManager.getAliasId() || storageManager.getUserId());
          participantIds.push(roomId);
        } else if (room.isWhisper) {
          message.messageType = messageComposer.MessageTypes.WHISPER;
        } else {
          message.messageType = messageComposer.MessageTypes.CHAT;
        }

        messageComposer.sendMessage({
          message,
          participantIds,
          callback: ({ error, data }) => {
            if (error) {
              console.log('sendMessage', error);

              return;
            }

            const { message: newMessage } = data;

            if (room.isUser) {
              eventCentral.emitEvent({
                event: eventCentral.Events.SWITCH_ROOM,
                params: {
                  listType: roomList.ListTypes.ROOMS,
                  room: { objectId: newMessage.roomId },
                },
              });
            }

            this.inputArea.clearInput();
          },
        });
      },
      focusCallback: () => {},
      blurCallback: () => {},
      inputCallback: () => {},
    });
    const columns = [];
    const mainColumn = {
      components: [],
      classes: ['columnChat'],
    };
    const roomListComponent = {
      components: [
        { component: roomFollowingList },
        { component: roomList },
        { component: whisperRoomList },
        { component: userRoomList },
      ],
      classes: ['columnRoomList'],
    };

    switch (inputPlacement) {
      case 'top': {
        mainColumn.components.push({ component: inputArea });
        mainColumn.components.push({ component: messageList });

        break;
      }
      default: {
        mainColumn.components.push({ component: messageList });
        mainColumn.components.push({ component: inputArea });

        break;
      }
    }

    if (!hideRoomList) {
      messageList.setRoomListId(roomList.getElementId());

      switch (roomListPlacement) {
        case 'left': {
          columns.push(roomListComponent);
          columns.push(mainColumn);

          break;
        }
        default: {
          columns.push(mainColumn);
          columns.push(roomListComponent);

          break;
        }
      }
    } else {
      columns.push(mainColumn);
    }

    super({
      elementId,
      columns,
      classes: classes.concat(['chatView']),
    });

    if (!hideRoomList) {
      this.roomList = roomList;
      this.whisperRoomList = whisperRoomList;
      this.roomFollowingList = roomFollowingList;
    }

    this.inputArea = inputArea;
    this.messageList = messageList;

    accessCentral.addAccessElement({
      element: this.inputArea.element,
      minimumAccessLevel: storageManager.getPermissions().SendMessage ?
        storageManager.getPermissions().SendMessage.accessLevel :
        accessCentral.AccessLevels.STANDARD,
    });
  }

  addToView(params) {
    this.inputArea.showView();

    super.addToView(params);
  }

  removeFromView() {
    super.removeFromView();

    this.inputArea.hideView();
  }
}

module.exports = ChatView;
