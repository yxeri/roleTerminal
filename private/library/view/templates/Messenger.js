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

const keyHandler = require('../../KeyHandler');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');

class Messenger extends View {
  constructor({ isFullscreen, sendButtonText, isTopDown }) {
    super({ isFullscreen });

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
        this.focusInput();
      });

      reader.readAsDataURL(file);
    });

    const sendButton = document.createElement('BUTTON');
    sendButton.appendChild(document.createTextNode(sendButtonText));
    sendButton.addEventListener('click', () => { this.sendMessage(); });

    const imageButton = document.createElement('BUTTON');
    imageButton.appendChild(document.createTextNode('Bild'));
    imageButton.appendChild(imageInput);
    imageButton.addEventListener('click', () => { imageInput.click(); });
    imageButton.classList.add('hide');
    this.accessElements.push({
      element: imageButton,
      accessLevel: 2,
    });

    const aliasDiv = document.createElement('DIV');
    const aliasListButton = document.createElement('BUTTON');
    const aliasList = document.createElement('UL');
    aliasList.classList.add('hide');
    aliasListButton.addEventListener('click', () => { aliasList.classList.toggle('hide'); });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.ALIAS,
      func: ({ aliases }) => {
        if (aliases.length > 0) {
          const fragment = document.createDocumentFragment();
          const fullAliasList = [storageManager.getUserName()].concat(aliases);

          fullAliasList.forEach((alias) => {
            const row = document.createElement('LI');
            const button = document.createElement('BUTTON');
            button.appendChild(document.createTextNode(alias));
            button.addEventListener('click', () => {
              if (storageManager.getUserName() !== alias) {
                storageManager.setSelectedAlias(alias);
              } else {
                storageManager.removeSelectedAlias();
              }

              aliasListButton.replaceChild(document.createTextNode(`Alias: ${alias}`), aliasListButton.firstChild);
              aliasList.classList.toggle('hide');
            });

            row.appendChild(button);
            fragment.appendChild(row);
          });

          aliasList.innerHTML = ' '; // eslint-disable-line no-param-reassign
          aliasList.appendChild(fragment);

          const chosenName = `Alias: ${storageManager.getSelectedAlias() || storageManager.getUserName() || ''}`;

          if (aliasListButton.firstChild) {
            aliasListButton.replaceChild(document.createTextNode(chosenName), aliasListButton.firstChild);
          } else {
            aliasListButton.appendChild(document.createTextNode(chosenName));
          }
        } else {
          aliasListButton.classList.add('hide');
        }
      },
    });
    aliasDiv.appendChild(aliasList);
    aliasDiv.appendChild(aliasListButton);
    this.accessElements.push({
      element: aliasDiv,
      accessLevel: 2,
    });

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

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.CHATMSG,
      func: ({ messages, options, shouldScroll }) => {
        this.messageList.addItems(messages.map(message => new Message(message, options)), shouldScroll);
      },
    });
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

      const selectedAlias = storageManager.getSelectedAlias();

      if (selectedAlias) { chatMsgData.message.userName = selectedAlias; }

      socketManager.emitEvent('chatMsg', chatMsgData, ({ data, error }) => {
        if (error) {
          console.log(error);

          return;
        }

        eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { messages: data.messages, options: { printable: true }, shouldScroll: true } });
        this.clearInputField();
      });
      this.focusInput();
    }
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
    keyHandler.removeKey(13);
    this.element.parentNode.classList.remove('messengerMain');
    super.removeView();
  }

  focusInput() {
    this.inputField.focus();
  }

  appendTo(parentElement) {
    keyHandler.addKey(13, () => { this.sendMessage(); });
    parentElement.classList.add('messengerMain');
    super.appendTo(parentElement);
    this.focusInput();
    this.messageList.scroll();
  }
}

module.exports = Messenger;
