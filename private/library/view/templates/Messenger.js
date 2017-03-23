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
const DialogBox = require('../DialogBox');

const keyHandler = require('../../KeyHandler');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const soundLibrary = require('../../audio/SoundLibrary');

/**
 * Retrieve history and trigger CHATMSG event
 * @param {string} roomName - Name of the room to retrieve history from
 * @param {number} lines - Number of lines to retrieve
 * @param {boolean} infiniteScroll Did infinite scroll trigger the history retrieval?
 */
function getHistory({ roomName, lines = 50, infiniteScroll = false, callback = () => {} }) {
  socketManager.emitEvent('history', { room: { roomName }, lines }, ({ data: historyData, error: historyError }) => {
    if (historyError) {
      console.log(historyError);
      callback({ error: historyError });

      return;
    }

    eventCentral.triggerEvent({
      event: eventCentral.Events.CHATMSG,
      params: {
        messages: historyData.messages,
        options: { printable: false },
        shouldScroll: !infiniteScroll,
        isHistory: true,
        infiniteScroll,
        following: historyData.following,
      },
    });
  });
}

class Messenger extends View {
  constructor({ isFullscreen, sendButtonText, isTopDown }) {
    super({ isFullscreen });

    this.element.setAttribute('id', 'messenger');
    this.inputField = document.createElement('TEXTAREA');
    this.inputField.setAttribute('rows', '3');
    this.inputField.addEventListener('input', () => { this.resizeInputField(); });
    this.selectedItem = null;
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

          aliasList.innerHTML = '';
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

    this.viewer = new Viewer({}).element;
    this.viewer.classList.add('selectedView');
    const container = elementCreator.createContainer({ classes: ['viewContainer'] });

    if (isTopDown) {
      this.inputArea.classList.add('topDown');
      this.viewer.appendChild(this.inputArea);
      this.viewer.appendChild(this.messageList.element);
    } else {
      this.inputArea.classList.add('bottomUp');
      this.viewer.appendChild(this.messageList.element);
      this.viewer.appendChild(this.inputArea);
    }

    this.viewer.addEventListener('mousewheel', () => {
      if (this.viewer.firstElementChild) {
        if (!this.messageList.isTopDown) {
          // getHistory({ roomName: storageManager.getRoom() });
        }
      }
    });

    container.appendChild(this.chatSelect);
    container.appendChild(this.viewer);
    this.element.appendChild(container);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.SWITCHROOM,
      func: ({ room: roomName }) => {
        this.messageList.element.classList.remove('flash');

        if (storageManager.getRoom() !== '') {
          setTimeout(() => {
            this.messageList.element.innerHTML = '';
            this.messageList.element.classList.add('flash');

            getHistory({ roomName, switchedRoom: true });
          }, 100);
        }
      },
    });

    this.populateList();
  }

  sendMessage() {
    if (this.inputField.value.trim() !== '') {
      const chatMsgData = {
        message: {
          text: this.inputField.value.split('\n'),
          roomName: storageManager.getRoom(),
        },
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
    this.viewer.scrollTop = this.viewer.scrollHeight;
  }

  clearInputField() {
    this.inputField.value = '';
    this.resizeInputField();
  }

  removeView() {
    keyHandler.removeKey(13);
    this.element.parentNode.classList.remove('messengerMain');
    super.removeView();

    this.messageList.element.classList.remove('flash');

    // forEach on childNodes does not work in iOS 7
    for (let i = 0; i < this.messageList.element.childNodes.length; i += 1) {
      const listItem = this.messageList.element.childNodes[i];

      listItem.classList.remove('flash');
    }
  }

  focusInput() {
    this.inputField.focus();
  }

  populateList() {
    const followList = new List({
      title: 'Following',
      shouldSort: false,
    });
    const roomsList = new List({
      title: 'Rooms',
      shouldSort: true,
    });
    const createButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create room',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                createDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = createDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const room = {
                  roomName: createDialog.inputs.find(({ inputName }) => inputName === 'roomName').inputElement.value,
                  password: createDialog.inputs.find(({ inputName }) => inputName === 'password').inputElement.value,
                };

                socketManager.emitEvent('createRoom', { room }, ({ error: createError, data: { room: createdRoom } }) => {
                  if (createError) {
                    console.log(createError);

                    return;
                  }

                  eventCentral.triggerEvent({
                    event: eventCentral.Events.CREATEROOM,
                    params: { room: { roomName: createdRoom.roomName } },
                  });
                  eventCentral.triggerEvent({
                    event: eventCentral.Events.FOLLOWROOM,
                    params: { room: { roomName: createdRoom.roomName } },
                  });
                  createDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Name of the room',
            inputName: 'roomName',
            isRequired: true,
          }, {
            placeholder: 'Optional passowrd',
            inputName: 'password',
          }],
          description: ['Employees are strictly prohibited from having more than 5% fun in their group room.'],
          extraDescription: ['Enter a name and optional password for the room'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
    });

    this.chatSelect.appendChild(createButton);
    this.chatSelect.appendChild(followList.element);
    this.chatSelect.appendChild(roomsList.element);

    this.accessElements.push({
      element: createButton,
      accessLevel: 1,
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.CHATMSG,
      func: ({ messages, options, shouldScroll, isHistory, following }) => {
        const roomName = messages[0].roomName;

        if (roomName === storageManager.getRoom()) {
          const itemsOptions = {
            animation: 'flash',
            shouldScroll,
            isHistory,
          };

          if (isHistory) {
            if (following) {
              this.inputArea.classList.remove('hide');
              this.messageList.element.classList.remove('fullHeight');
            } else {
              this.inputArea.classList.add('hide');
              this.messageList.element.classList.add('fullHeight');
            }
          }

          this.messageList.addItems(messages.map(message => new Message(message, options)), itemsOptions);
        } else {
          const listItems = Array.from(followList.element.lastElementChild.getElementsByTagName('LI'));
          const listItem = listItems.find(item => item.firstElementChild.innerText === roomName);

          if (listItem) {
            listItem.firstElementChild.classList.add('selected');
          }
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: followList,
      event: eventCentral.Events.FOLLOWROOM,
      func: ({ room: { roomName } }) => {
        followList.addItem({ item: this.createRoomButton(roomName) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: roomsList,
      event: eventCentral.Events.NEWROOM,
      func: ({ room: { roomName } }) => {
        roomsList.addItem({ item: this.createRoomButton(roomName) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        this.messageList.element.innerHTML = '';
        this.viewer.classList.remove('selectedView');

        socketManager.emitEvent('listRooms', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { rooms = [], followedRooms = [] } = data;

          followList.replaceAllItems({ items: followedRooms.map(room => this.createRoomButton(room)) });
          roomsList.replaceAllItems({ items: rooms.map(room => this.createRoomButton(room)) });
        });
      },
    });
  }

  appendTo(parentElement) {
    keyHandler.addKey(13, () => { this.sendMessage(); });
    super.appendTo(parentElement);
    this.messageList.scroll();
  }

  createRoomButton(roomName) {
    const button = elementCreator.createButton({
      text: roomName,
      func: () => {
        if (this.selectedItem) {
          this.selectedItem.classList.remove('selectedItem');
        }

        this.selectedItem = button.parentElement;
        this.viewer.classList.add('selectedView');
        this.selectedItem.classList.add('selectedItem');
        button.classList.remove('selected');

        socketManager.emitEvent('authUserToRoom', { room: { roomName } }, ({ error }) => {
          if (error) {
            const passwordDialog = new DialogBox({
              buttons: {
                left: {
                  text: 'Cancel',
                  eventFunc: () => { passwordDialog.removeView(); },
                },
                right: {
                  text: 'Confirm',
                  eventFunc: () => {
                    socketManager.emitEvent('follow', {
                      room: {
                        password: passwordDialog.inputs.find(({ inputName }) => inputName === 'password').inputElement.value,
                        roomName,
                      },
                    }, ({ error: followError }) => {
                      if (followError) {
                        console.log(followError);
                        passwordDialog.changeExtraDescription({ text: ['Incorrect password'] });

                        return;
                      }

                      eventCentral.triggerEvent({
                        event: eventCentral.Events.FOLLOWROOM,
                        params: { room: { roomName } },
                      });
                      storageManager.setRoom(roomName);
                      passwordDialog.removeView();
                    });
                  },
                },
              },
              inputs: [{
                placeholder: 'Password',
                inputName: 'password',
                type: 'password',
                isRequired: true,
              }],
              description: ['You need authorization to join the room'],
              extraDescription: ['Input the correct password to proceed'],
            });
            passwordDialog.appendTo(this.element.parentElement);

            return;
          }

          storageManager.setRoom(roomName);
        });
      },
    });

    return button;
  }
}

module.exports = Messenger;
