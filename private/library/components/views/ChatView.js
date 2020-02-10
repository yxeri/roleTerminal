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
const FindUserByIdDialog = require('./dialogs/FindUserByIdDialog');

const messageComposer = require('../../data/composers/MessageComposer');
const accessCentral = require('../../AccessCentral');
const roomComposer = require('../../data/composers/RoomComposer');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const textTools = require('../../TextTools');
const viewSwitcher = require('../../ViewSwitcher');
const elementCreator = require('../../ElementCreator');

class ChatView extends ViewWrapper {
  constructor({
    effect,
    shouldResize,
    placeholder,
    title,
    whisperText,
    showTeam,
    allowImages,
    hideDate,
    fullDate,
    corners,
    hideUserList = false,
    showUserImage = true,
    sendOnEnter = false,
    hideRoomList = false,
    classes = [],
    roomListPlacement = 'left',
    inputPlacement = 'bottom',
    elementId = `chView-${Date.now()}`,
  }) {
    const roomList = new RoomList({
      effect,
      shouldToggle: true,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
    });
    const roomFollowingList = new RoomFollowingList({
      effect,
      shouldToggle: true,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
    });
    const whisperRoomList = new WhisperRoomList({
      effect,
      whisperText,
      shouldToggle: true,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
    });
    const userList = new UserList({
      effect,
      shouldToggle: true,
      showImage: showUserImage,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      shouldFocusOnClick: false,
    });

    roomList.onToggle = () => {
      roomFollowingList.hideList();
      whisperRoomList.hideList();
      userList.hideList();
    };
    roomFollowingList.onToggle = () => {
      roomList.hideList();
      whisperRoomList.hideList();
      userList.hideList();
    };
    whisperRoomList.onToggle = () => {
      roomFollowingList.hideList();
      roomList.hideList();
      userList.hideList();
    };
    userList.onToggle = () => {
      roomFollowingList.hideList();
      whisperRoomList.hideList();
      roomList.hideList();
    };

    const messageList = new MessageList({
      effect,
      whisperText,
      showTeam,
      fullDate,
      hideDate,
      corners,
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
      allowImages,
      corners,
      minimumAccessLevel: storageManager.getPermissions().SendMessage
        ? storageManager.getPermissions().SendMessage.accessLevel
        : accessCentral.AccessLevels.STANDARD,
      classes: [inputPlacement],
      triggerCallback: ({ text }) => {
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

        const imagePreview = document.getElementById('imagePreview-input');
        let image;

        if (imagePreview && imagePreview.getAttribute('src')) {
          image = {
            source: imagePreview.getAttribute('src'),
            imageName: imagePreview.getAttribute('name'),
            width: imagePreview.naturalWidth,
            height: imagePreview.naturalHeight,
          };
        }

        if (!image && textTools.trimSpace(text.join('')).length === 0) {
          return;
        }

        messageComposer.sendMessage({
          message,
          image,
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
    const roomInfo = new RoomInfo({
      whisperText,
      corners,
    });
    const columns = [];
    const mainColumn = {
      components: [{ component: roomInfo }],
      classes: ['columnChat'],
    };
    const roomListColumn = {
      components: [
        {
          component: elementCreator.createButton({
            text: 'Find user by ID',
            clickFuncs: {
              leftFunc: () => {
                const dialog = new FindUserByIdDialog({});

                dialog.addToView({ element: viewSwitcher.getParentElement() });
              },
            },
          }),
        },
        { component: roomFollowingList },
        { component: whisperRoomList },
        { component: roomList },
      ],
      classes: [
        'columnList',
        'columnRoomList',
      ],
    };

    if (!hideUserList) {
      roomListColumn.components.push({ component: userList });
    }

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
          columns.push(roomListColumn);
          columns.push(mainColumn);

          break;
        }
        default: {
          columns.push(mainColumn);
          columns.push(roomListColumn);

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

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGOUT,
      func: () => {
        eventCentral.emitEvent({
          event: eventCentral.Events.SWITCH_ROOM,
          params: {
            room: { objectId: storageManager.getPublicRoomId() },
          },
        });
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
