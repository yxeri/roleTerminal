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
const messageComposer = require('../../data/MessageComposer');

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
      triggerCallback: ({ text }) => {
        messageComposer.sendMessage({
          message: {
            text,
            roomId: messageList.getRoomId(),
            messageType: dataHandler.messages.MessageTypes.CHAT,
          },
          callback: ({ data, error }) => {
            if (error) {
              console.log('sendMessage', error);

              return;
            }

            this.messageList.addOneItem({
              object: data.message,
              shouldAnimate: true,
            });
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
    let roomList;

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
      roomList = new RoomList({});

      messageList.setRoomListId(roomList.getElementId());

      switch (roomListPlacement) {
        case 'left': {
          columns.push({
            components: [{ component: roomList }],
            classes: ['columnRoomList'],
          });
          columns.push(mainColumn);

          break;
        }
        default: {
          columns.push(mainColumn);
          columns.push({
            components: [{ component: roomList }],
            classes: ['columnRoomList'],
          });

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
}

module.exports = ChatView;
