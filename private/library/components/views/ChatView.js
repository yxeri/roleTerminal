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

const ViewWrapper = require('../ViewWrapper');
const MessageList = require('../lists/MessageList');
const RoomList = require('../lists/RoomList');
const InputArea = require('./inputs/InputArea');
const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');

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
    const messageList = new MessageList({
      shouldSwitchRoom: true,
    });
    const inputArea = new InputArea({
      shouldResize,
      placeholder,
      sendOnEnter,
      classes: [inputPlacement],
      triggerCallback: () => {},
      focusCallback: () => {},
      blurCallback: () => {},
      inputCallback: () => {},
    });
    const columns = [];
    const mainColumn = [];
    let roomList;

    switch (inputPlacement) {
      case 'top': {
        mainColumn.push({ component: inputArea });
        mainColumn.push({ component: messageList });

        break;
      }
      default: {
        mainColumn.push({ component: messageList });
        mainColumn.push({ component: inputArea });

        break;
      }
    }

    if (!hideRoomList) {
      roomList = new RoomList({});

      switch (roomListPlacement) {
        case 'left': {
          columns.push([{ component: roomList }]);
          columns.push(mainColumn);

          break;
        }
        default: {
          columns.push(mainColumn);
          columns.push([{ component: roomList }]);

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

    if (roomList) { this.roomList = roomList; }

    this.inputArea = inputArea;
    this.messageList = messageList;
  }

  sendMessage({
    text,
    messageType,
    roomId,
  }) {
    const message = {
      text,
      messageType,
      roomId,
    };
    let emitType = '';

    switch (messageType) {
      case dataHandler.messages.MessageTypes.CHAT: {
        emitType = socketManager.EmitTypes.CHATMSG;

        break;
      }
      case dataHandler.messages.MessageTypes.WHISPER: {
        emitType = socketManager.EmitTypes.WHISPER;

        break;
      }
      default: {
        console.log('Incorrect message type');

        break;
      }
    }

    socketManager.emitEvent(emitType, { message }, ({ error }) => {
      if (error) {
        console.log('Error sending message');

        return;
      }

      this.inputArea.clearInput();
    });
  }
}

module.exports = ChatView;
