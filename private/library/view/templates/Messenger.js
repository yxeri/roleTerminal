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
const ItemList = require('../elements/MessageList');
const Message = require('../elements/Message');

const aliasUpdater = require('../../aliasUpdater');
const storage = require('../../storage');

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

    this.imagePreview = new Image();
    this.imagePreview.classList.add('hide');

    const imageInput = document.createElement('INPUT');
    imageInput.classList.add('hide');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/png, image/jpeg');
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        this.imagePreview.classList.remove('hide');
        this.imagePreview.setAttribute('src', reader.result);
        this.imagePreview.setAttribute('name', file.name);
        this.imagePreview.classList.add('imagePreview');
        this.inputField.focus();
      });

      reader.readAsDataURL(file);
    });

    const sendButton = document.createElement('BUTTON');
    sendButton.appendChild(document.createTextNode(sendButtonText));
    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    const imageButton = document.createElement('BUTTON');
    imageButton.appendChild(document.createTextNode('Bild'));
    imageButton.appendChild(imageInput);
    imageButton.addEventListener('click', () => {
      imageInput.click();
    });
    imageButton.classList.add('hide');
    this.accessElements.push({
      element: imageButton,
      accessLevel: 2,
    });

    const aliasDiv = document.createElement('DIV');
    const aliasListButton = document.createElement('BUTTON');
    const aliasList = document.createElement('UL');
    aliasList.classList.add('hide');
    aliasListButton.addEventListener('click', () => {
      aliasList.classList.toggle('hide');
    });
    aliasUpdater.addAliasList(aliasList, aliasListButton);
    aliasDiv.appendChild(aliasList);
    aliasDiv.appendChild(aliasListButton);

    const buttons = document.createElement('DIV');
    buttons.classList.add('buttons');

    buttons.appendChild(aliasDiv);
    buttons.appendChild(imageButton);
    buttons.appendChild(sendButton);

    const inputArea = document.createElement('DIV');
    inputArea.classList.add('inputArea');
    inputArea.classList.add('hide');
    inputArea.appendChild(this.imagePreview);
    inputArea.appendChild(this.inputField);
    inputArea.appendChild(buttons);
    this.accessElements.push({
      element: inputArea,
      accessLevel: 1,
    });

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
      const chatMsgData = {
        message: {
          text: this.inputField.value.split('\n'),
          roomName: 'public' },
      };

      const imageSource = this.imagePreview.getAttribute('src');

      if (imageSource) {
        chatMsgData.image = {
          source: imageSource,
          imageName: this.imagePreview.getAttribute('name'),
          width: this.imagePreview.naturalWidth,
          height: this.imagePreview.naturalHeight,
        };

        this.imagePreview.removeAttribute('src');
        this.imagePreview.removeAttribute('name');
        this.imagePreview.classList.add('hide');
      }

      const selectedAlias = storage.getSelectedAlias();

      if (selectedAlias) {
        chatMsgData.message.userName = selectedAlias;
      }

      this.socketManager.emitEvent('chatMsg', chatMsgData, ({ data, error }) => {
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
    this.inputField.style.height = `${this.inputField.scrollHeight + 10}px`;
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
