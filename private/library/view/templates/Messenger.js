/*
 Copyright 2017 Aleksandar Jankovic

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

const View = require('../base/View');
const ItemList = require('../elements/ItemList');
const Message = require('../elements/Message');

class Messenger extends View {
  constructor({ isFullscreen, socketManager, sendButtonText, isTopDown, keyHandler }) {
    super({ isFullscreen });

    this.keyHandler = keyHandler;
    this.keyHandler.addKey(13, () => { this.sendMessage(); });

    this.socketManager = socketManager;
    this.element.setAttribute('id', 'messenger');

    this.inputField = document.createElement('TEXTAREA');
    this.inputField.setAttribute('rows', '3');
    this.inputField.addEventListener('input', () => { this.resizeInputField(); });

    this.messageList = new ItemList({ isTopDown });

    const sendButton = document.createElement('BUTTON');
    sendButton.appendChild(document.createTextNode(sendButtonText));
    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    const inputArea = document.createElement('DIV');
    inputArea.classList.add('inputArea');
    inputArea.appendChild(this.inputField);
    inputArea.appendChild(sendButton);

    if (isTopDown) {
      inputArea.classList.add('topDown');
      this.element.appendChild(inputArea);
      this.element.appendChild(this.messageList.element);
    } else {
      inputArea.classList.add('bottomUp');
      this.element.appendChild(this.messageList.element);
      this.element.appendChild(inputArea);
    }
  }

  sendMessage() {
    if (this.inputField.value.trim() !== '') {
      this.socketManager.emitEvent('chatMsg', { message: { text: this.inputField.value.split('\n'), roomName: 'public' } }, ({ data, error }) => {
        if (error) {
          console.log(error);

          return;
        }

        this.messageList.addItem(new Message(data.message, { printable: true }));
        this.clearInputField();
      });
      this.inputField.focus();
    }
  }

  addMessage(message, options) {
    this.messageList.addItem(new Message(message, options));
  }

  addMessages({ messages, options, shouldScroll }) {
    const convertedMessages = messages.map(message => new Message(message, options));

    this.messageList.addItems(convertedMessages, shouldScroll);
  }

  resizeInputField() {
    this.inputField.style.height = 'auto';
    this.inputField.style.height = `${this.inputField.scrollHeight}px`;
  }

  clearInputField() {
    this.inputField.value = '';
    this.resizeInputField();
  }

  removeView() {
    this.keyHandler.removeKey(13);
    super.removeView();
  }
}

module.exports = Messenger;
