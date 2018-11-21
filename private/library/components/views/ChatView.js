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
const UserList = require('../lists/UserList');
const WhisperRoomList = require('../lists/WhisperRoomList');
const RoomFollowingList = require('../lists/RoomFollowingList');
const RoomInfo = require('./RoomInfo');

const messageComposer = require('../../data/composers/MessageComposer');
const accessCentral = require('../../AccessCentral');
const roomComposer = require('../../data/composers/RoomComposer');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const textTools = require('../../TextTools');
const viewSwitcher = require('../../ViewSwitcher');

class ChatView extends ViewWrapper {
  constructor({
    shouldResize,
    placeholder,
    title,
    sendOnEnter = true,
    hideRoomList = false,
    classes = [],
    roomListPlacement = 'left',
    inputPlacement = 'bottom',
    elementId = `chView-${Date.now()}`,
  }) {
    const roomList = new RoomList({
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      title: 'Rooms',
    });
    const roomFollowingList = new RoomFollowingList({
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      title: 'Following',
    });
    const whisperRoomList = new WhisperRoomList({
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      title: 'Whispers',
    });
    const userList = new UserList({
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      title: 'Users',
      shouldFocusOnClick: false,
    });
    const messageList = new MessageList({
      shouldSwitchRoom: true,
      roomLists: [
        roomFollowingList,
        whisperRoomList,
        roomList,
        userList,
      ],
    });
    const inputArea = new InputArea({
      shouldResize,
      placeholder,
      sendOnEnter,
      minimumAccessLevel: storageManager.getPermissions().SendMessage
        ? storageManager.getPermissions().SendMessage.accessLevel
        : accessCentral.AccessLevels.STANDARD,
      classes: [inputPlacement],
      triggerCallback: ({ text }) => {
        if (textTools.trimSpace(text.join('')).length === 0) {
          return;
        }

        const roomId = messageList.getRoomId();
        const room = roomComposer.getRoom({ roomId });
        const participantIds = room.isWhisper
          ? room.participantIds
          : [];
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

            this.inputArea.clearInput();

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
          },
        });
      },
      focusCallback: () => {},
      blurCallback: () => {},
      inputCallback: () => {},
    });
    const roomInfo = new RoomInfo({});
    const columns = [];
    const mainColumn = {
      components: [{ component: roomInfo }],
      classes: ['columnChat'],
    };
    const roomListComponent = {
      components: [
        { component: roomFollowingList },
        { component: whisperRoomList },
        { component: roomList },
        { component: userList },
      ],
      classes: [
        'columnList',
        'columnRoomList',
      ],
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
      title,
      classes: classes.concat(['chatView']),
    });

    this.inputArea = inputArea;
    this.whisperRoomList = whisperRoomList;
    this.userRoomList = userList;
    this.messageList = messageList;
    this.roomList = roomList;

    eventCentral.addWatcher({
      event: eventCentral.Events.VIEW_SWITCHED,
      func: ({ view }) => {
        if (view.viewType === viewSwitcher.ViewTypes.CHAT) {
          this.messageList.scrollList();
        }
      },
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
