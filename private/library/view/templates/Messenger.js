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
const MessageList = require('../elements/MessageList');
const Message = require('../elements/Message');
const Viewer = require('../base/Viewer');
const List = require('../base/List');

const keyHandler = require('../../KeyHandler');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');

/**
 * Creates a list and returns the element
 * @param {string[]} rooms - Room names to add to the list
 * @param {string} title - List title
 * @param {boolean} shouldSort - Should the list be sorted?
 * @returns {*} Element
 */
function createList({ rooms, title, shouldSort }) {
  const list = new List({
    title,
    shouldSort: shouldSort || false,
    listItems: rooms.map((room) => {
      return elementCreator.createButton({
        text: room,
        func: () => {
          this.switchRoom(room);

          socketManager.emitEvent('history', { room: { roomName: room }, lines: 50 }, ({ data: historyData, historyError }) => {
            if (historyError) {
              console.log('history', historyError);

              return;
            }

            eventCentral.triggerEvent({
              event: eventCentral.Events.CHATMSG,
              params: {
                messages: historyData.messages,
                options: { printable: false },
                shouldScroll: true,
                isHistory: true,
              },
            });
          });
        },
      });
    }),
  });

  return list.element;
}

class Messenger extends View {
  constructor({ isFullscreen, sendButtonText, isTopDown }) {
    super({ isFullscreen });

    this.element.setAttribute('id', 'messenger');
    this.inputField = document.createElement('TEXTAREA');
    this.inputField.setAttribute('rows', '3');
    this.inputField.addEventListener('input', () => { this.resizeInputField(); });

    this.messageList = new MessageList({ isTopDown });
    this.chatSelect = elementCreator.createContainer({ classes: ['list'] });

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

    const sendButton = elementCreator.createButton({
      func: () => { this.sendMessage(); },
      text: sendButtonText,
    });


    const imageButton = elementCreator.createButton({
      func: () => { imageInput.click(); },
      text: 'Pic',
      classes: ['hide'],
    });
    imageButton.appendChild(imageInput);
    this.accessElements.push({
      element: imageButton,
      accessLevel: 2,
    });

    const aliasDiv = document.createElement('DIV');
    const aliasList = elementCreator.createList({
      classes: ['list', 'hide'],
    });
    const aliasListButton = elementCreator.createButton({
      func: () => { aliasList.classList.toggle('hide'); },
      text: '-',
    });
    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.ALIAS,
      func: ({ aliases }) => {
        if (aliases.length > 0) {
          const fragment = document.createDocumentFragment();
          const fullAliasList = [storageManager.getUserName()].concat(aliases);

          fullAliasList.forEach((alias) => {
            const row = document.createElement('LI');
            const button = elementCreator.createButton({
              func: () => {
                if (storageManager.getUserName() !== alias) {
                  storageManager.setSelectedAlias(alias);
                } else {
                  storageManager.removeSelectedAlias();
                }

                aliasListButton.replaceChild(document.createTextNode(`Alias: ${alias}`), aliasListButton.firstChild);
                aliasList.classList.toggle('hide');
              },
              text: alias,
            });

            row.appendChild(button);
            fragment.appendChild(row);
          });

          aliasList.innerHTML = ' '; // eslint-disable-line no-param-reassign
          aliasList.appendChild(fragment);

          elementCreator.setButtonText(aliasListButton, `Alias: ${storageManager.getSelectedAlias() || storageManager.getUserName() || ''}`);
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

    this.inputArea = document.createElement('DIV');
    this.inputArea.classList.add('inputArea');
    this.inputArea.classList.add('hide');
    this.inputArea.appendChild(this.imagePreview);
    this.inputArea.appendChild(this.inputField);
    this.inputArea.appendChild(buttons);
    this.accessElements.push({
      element: this.inputArea,
      accessLevel: 1,
    });

    const viewer = new Viewer({}).element;
    const container = elementCreator.createContainer({ classes: ['viewContainer'] });

    if (isTopDown) {
      this.inputArea.classList.add('topDown');
      viewer.appendChild(this.inputArea);
      viewer.appendChild(this.messageList.element);
    } else {
      this.inputArea.classList.add('bottomUp');
      viewer.appendChild(this.messageList.element);
      viewer.appendChild(this.inputArea);
    }

    container.appendChild(this.chatSelect);
    container.appendChild(viewer);
    this.element.appendChild(container);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.CHATMSG,
      func: ({ messages, options, shouldScroll, isHistory }) => {
        const itemsOptions = {
          animation: 'flash',
          shouldScroll,
          isHistory,
        };

        this.messageList.addItems(messages.map(message => new Message(message, options)), itemsOptions);
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

        eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { messages: data.messages, options: { printable: false }, shouldScroll: true } });
        this.clearInputField();
      });
      this.focusInput();
    }
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
    keyHandler.removeKey(13);
    this.element.parentNode.classList.remove('messengerMain');
    super.removeView();

    // forEach on childNodes does not work in iOS 7
    for (let i = 0; i < this.messageList.element.childNodes.length; i += 1) {
      const listItem = this.messageList.element.childNodes[i];

      listItem.classList.remove('flash');
    }
  }

  focusInput() {
    this.inputField.focus();
  }

  switchRoom(room) {
    storageManager.setRoom(room);
    this.messageList.element.innerHTML = '';
  }

  populateList() {
    socketManager.emitEvent('listRooms', {}, ({ error, data: { rooms, followedRooms = [], ownedRooms = [] } }) => {
      if (error) {
        console.log(error);

        return;
      }

      const fragment = document.createDocumentFragment();

      if (ownedRooms.length > 0) { fragment.appendChild(createList({ rooms: ownedRooms, title: 'Yours', shouldSort: true })); }
      if (followedRooms.length > 0) { fragment.appendChild(createList({ rooms: followedRooms, title: 'Following' })); }

      fragment.appendChild(createList({ rooms, title: 'Rooms', shouldSort: true }));
      this.chatSelect.appendChild(fragment);
    });
  }

  appendTo(parentElement) {
    this.populateList();
    keyHandler.addKey(13, () => { this.sendMessage(); });
    parentElement.classList.add('messengerMain');
    super.appendTo(parentElement);
    this.focusInput();
    this.messageList.scroll();
  }
}

module.exports = Messenger;
