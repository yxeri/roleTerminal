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

const messageComposer = require('../../data/MessageComposer');
const accessCentral = require('../../AccessCentral');

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
    const roomList = new RoomList({});
    const messageList = new MessageList({
      shouldSwitchRoom: true,
      roomListId: roomList.elementId,
    });
    const inputArea = new InputArea({
      shouldResize,
      placeholder,
      sendOnEnter,
      classes: [inputPlacement],
      triggerCallback: ({ text }) => {
        if (text.join('').length === 0) {
          return;
        }

        messageComposer.sendMessage({
          message: {
            text,
            roomId: messageList.getRoomId(),
            messageType: messageComposer.MessageTypes.CHAT,
          },
          callback: ({ error }) => {
            if (error) {
              console.log('sendMessage', error);

              return;
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
      components: [{ component: roomList }],
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

    if (!hideRoomList) { this.roomList = roomList; }

    this.inputArea = inputArea;
    this.messageList = messageList;

    accessCentral.addAccessElement({
      element: this.inputArea.element,
      minimumAccessLevel: 1,
    });
  }
}

module.exports = ChatView;
