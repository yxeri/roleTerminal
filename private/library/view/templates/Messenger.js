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

const StandardView = require('../base/StandardView');
const MessageList = require('../elements/MessageList');
const Message = require('../elements/Message');
const List = require('../base/List');
const DialogBox = require('../DialogBox');

const keyHandler = require('../../KeyHandler');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const soundLibrary = require('../../audio/SoundLibrary');
const textTools = require('../../TextTools');

/**
 * Takes a list of user names and filters out current users user name and aliases
 * @param {string[]} users - List of users
 * @returns {string[]} List of users, excluding current user name and aliases
 */
function filterUserAliases(users) {
  const aliases = storageManager.getAliases();
  aliases.push(storageManager.getUserName());

  return users.filter(user => aliases.indexOf(user) === -1);
}

/**
 * Converts room name to sender and receiver user names
 * @param {string} sentRoomName Whisper room name and user name combined
 * @returns {{userName: string, whisperTo: string}} Name of the user sending whisper and user that is whispered to
 */
function convertWhisperRoomName(sentRoomName) {
  let userName = null;
  let whisperTo = null;

  if (sentRoomName.indexOf('-whisper-') > -1) {
    const roomSplit = sentRoomName.split('-whisper-');
    userName = roomSplit[0];
    whisperTo = roomSplit[1];
  }

  return { userName, whisperTo };
}

/**
 * Retrieve history and trigger CHATMSG event
 * @param {string} roomName - Name of the room to retrieve history from
 * @param {number} lines - Number of lines to retrieve
 * @param {boolean} infiniteScroll Did infinite scroll trigger the history retrieval?
 */
function getHistory({ roomName, lines = 50, infiniteScroll = false, callback = () => {} }) {
  const { whisperTo, userName } = convertWhisperRoomName(roomName);
  if (whisperTo) {
    roomName = userName;
  }

  socketManager.emitEvent('getHistory', { room: { roomName }, lines, whisperTo }, ({ data: historyData, error: historyError }) => {
    if (historyError) {
      console.log(historyError);
      callback({ error: historyError });

      return;
    }

    const room = { roomName };

    if (whisperTo) {
      room.roomName = `${userName}-whisper-${whisperTo}`;
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
        room,
      },
    });
  });
}

/**
 * Finds and returns the list item that contains the button with sent text
 * @param {Object} list - List item
 * @param {string} text - Text to compare to
 * @returns {HTMLLIElement} List item element
 */
function findItem(list, text) {
  if (!list.element.lastElementChild) {
    return null;
  }

  const listItems = Array.from(list.element.lastElementChild.getElementsByTagName('LI'));

  return listItems.find(item => (item.firstElementChild.getAttribute('data') || '') === text);
}

class Messenger extends StandardView {
  constructor({ isFullscreen, sendButtonText, isTopDown }) {
    super({ isFullscreen });

    this.element.setAttribute('id', 'messenger');
    this.inputField = document.createElement('TEXTAREA');
    this.inputField.setAttribute('rows', '3');
    this.inputField.setAttribute('placeholder', 'Input message. alt+enter to send');
    this.inputField.addEventListener('input', () => { this.resizeInputField(); });
    this.selectedItem = null;
    this.selectedAliasItem = null;
    this.messageList = new MessageList({ isTopDown });

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

    const buttons = document.createElement('DIV');
    buttons.classList.add('buttons');

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

    this.viewer.classList.add('selectedView');

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

    this.populate();
  }

  sendMessage() {
    if (this.inputField.value.trim() !== '') {
      const { whisperTo } = convertWhisperRoomName(storageManager.getRoom());
      const roomName = whisperTo || storageManager.getRoom();

      const chatMsgData = {
        message: {
          text: this.inputField.value.split('\n'),
          userName: storageManager.getSelectedAlias() || storageManager.getUserName(),
          roomName,
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

      const event = whisperTo ? 'whisperMsg' : 'chatMsg';

      socketManager.emitEvent(event, chatMsgData, ({ data, error }) => {
        if (error) {
          console.log(error);

          return;
        }

        eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { whisper: data.whisper, room: { roomName }, messages: data.messages, options: { printable: false }, shouldScroll: true } });
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

  populate() {
    const systemList = new List({
      title: 'SYSTEM',
      shouldSort: false,
    });
    const aliasList = new List({
      title: 'ALIASES',
      shouldSort: true,
      minimumToShow: 2,
    });
    const followList = new List({
      title: 'FOLLOWING',
      shouldSort: false,
    });
    const roomsList = new List({
      title: 'PUBLIC',
      shouldSort: true,
    });
    const userList = new List({
      title: 'USERS',
      shouldSort: true,
    });
    const privateList = new List({
      title: 'PRIVATE',
      shouldSort: true,
    });

    const createAliasButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create alias',
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

                const alias = createDialog.inputs.find(({ inputName }) => inputName === 'alias').inputElement.value.toLowerCase();

                socketManager.emitEvent('addAlias', { alias }, ({ error: createError }) => {
                  if (createError) {
                    console.log(createError);

                    return;
                  }

                  eventCentral.triggerEvent({
                    event: eventCentral.Events.NEWALIAS,
                    params: { alias },
                  });
                  createDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Alias',
            inputName: 'alias',
            isRequired: true,
            maxLength: 10,
          }],
          description: [
            textTools.createMixedString(60, false, true),
            'Alter Ego Creator 0.0.2',
            'Made available by Razor',
            'For your enjoyment',
            textTools.createMixedString(63, false, true),
          ],
          extraDescription: ['Enter your new alias'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
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
            maxLength: 10,
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

    systemList.addItems({ items: [createButton, createAliasButton] });

    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(aliasList.element);
    this.itemList.appendChild(followList.element);
    this.itemList.appendChild(roomsList.element);
    this.itemList.appendChild(userList.element);
    this.itemList.appendChild(privateList.element);

    this.accessElements.push({
      element: systemList.element,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: aliasList.element,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: createButton,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: createAliasButton,
      accessLevel: 1,
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.ALIAS,
      func: ({ alias }) => {
        const aliasItem = findItem(aliasList, alias);

        if (aliasItem) {
          this.selectedAliasItem = aliasItem;
          this.selectedAliasItem.classList.add('selectedItem');
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.NEWALIAS,
      func: ({ alias }) => {
        aliasList.addItem({ item: this.createAliasButton({ alias }) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.CHATMSG,
      func: ({ messages, options, shouldScroll, isHistory, following, room, whisper }) => {
        const userName = storageManager.getSelectedAlias() || storageManager.getUserName();
        let { roomName } = room;

        if (whisper) {
          if (messages[0].userName === userName) {
            roomName = `${messages[0].userName}-whisper-${roomName}`;
          } else {
            roomName += `-${messages[0].userName}`;
          }
        }

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
          const listItem = findItem(followList, roomName);

          if (listItem) {
            listItem.firstElementChild.classList.add('selected');
          }
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.BCASTMSG,
      func: ({ message }) => {
        const itemsOptions = {
          animation: 'flash',
          shouldScroll: true,
        };

        const intro = [
          '-------------------------------',
          'THIS IS A PUBLIC ANNOUNCEMENT',
          'EMPLOYEE. STAND AT ATTENTION',
          '-------------------------------',
        ];
        const extro = [
          '-------------------------------',
          'END OF MESSAGE',
          'RETURN TO YOUR DUTY',
          '-------------------------------',
        ];

        message.text = intro.concat(message.text).concat(extro);

        this.messageList.addItems([new Message(message, {})], itemsOptions);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.SWITCHROOM,
      func: ({ room: roomName }) => {
        const listItem = findItem(followList, storageManager.getRoom());

        if (listItem) {
          this.selectedItem = listItem;
          this.selectedItem.classList.add('selectedItem');
        }

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

    eventCentral.addWatcher({
      watcherParent: followList,
      event: eventCentral.Events.FOLLOWROOM,
      func: ({ room: { roomName }, whisperTo, data, whisper }) => {
        if (!whisper) {
          followList.addItem({ item: this.createRoomButton({ roomName, whisperTo, data: data || roomName }) });
        } else {
          followList.addItem({ item: this.createWhisperButton({ roomName, whisperTo, data: data || roomName }) });
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: roomsList,
      event: eventCentral.Events.NEWROOM,
      func: ({ room: { roomName } }) => {
        roomsList.addItem({ item: this.createRoomButton({ roomName }) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: ({ changedUser, firstConnection }) => {
        if (storageManager.getAccessLevel() > 0) {
          const aliases = storageManager.getAliases();

          if (aliases.length > 0) {
            const selectedAlias = storageManager.getSelectedAlias() || storageManager.getUserName();

            aliasList.replaceAllItems({ items: aliases.map(alias => this.createAliasButton({ alias })) });
            aliasList.addItem({ item: this.createAliasButton({ alias: storageManager.getUserName() }) });

            eventCentral.triggerEvent({ event: eventCentral.Events.ALIAS, params: { alias: selectedAlias } });

            if (firstConnection || changedUser) {
              aliasList.toggleList(true);
            }
          } else {
            const userName = storageManager.getUserName();

            aliasList.replaceAllItems({ items: [] });
            aliasList.addItem({ item: this.createAliasButton({ alias: userName }) });

            const listItem = findItem(aliasList, userName);

            if (listItem) {
              this.selectedItem = listItem;
              this.selectedItem.classList.add('selectedItem');
            }
          }

          socketManager.emitEvent('listUsers', {}, ({ error, data }) => {
            if (error) {
              console.log(error);

              return;
            }

            const { onlineUsers, offlineUsers } = data;
            const allUsers = filterUserAliases(onlineUsers.concat(offlineUsers));
            const userName = storageManager.getSelectedAlias() || storageManager.getUserName();

            userList.replaceAllItems({ items: allUsers.map(listUserName => this.createWhisperButton({ roomName: userName, whisperTo: listUserName })) });
          });
        } else {
          aliasList.replaceAllItems({ items: [] });
          userList.replaceAllItems({ items: [] });
        }

        socketManager.emitEvent('listRooms', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { rooms = [], followedRooms = [], whisperRooms = [] } = data;

          followList.replaceAllItems({ items: followedRooms.map(room => this.createRoomButton({ roomName: room })) });
          followList.addItems({
            items: whisperRooms.map((room) => {
              const { whisperTo, userName } = convertWhisperRoomName(room);

              return this.createWhisperButton({ roomName: `${userName} <-> ${whisperTo}`, data: room });
            }),
          });

          if (followedRooms.length > 0 && (firstConnection || changedUser)) {
            followList.toggleList(true);
          }

          roomsList.replaceAllItems({ items: rooms.map(room => this.createRoomButton({ roomName: room })) });

          const listItem = findItem(followList, storageManager.getRoom());

          if (listItem) {
            this.selectedItem = listItem;
            this.selectedItem.classList.add('selectedItem');
          }

          if (changedUser) {
            this.messageList.element.innerHTML = '';
            getHistory({ roomName: storageManager.getRoom() });
          }
        });
      },
    });
  }

  appendTo(parentElement) {
    keyHandler.addKey(13, () => { this.sendMessage(); });
    super.appendTo(parentElement);
    this.messageList.scroll();
  }

  createAliasButton({ alias }) {
    return elementCreator.createButton({
      data: alias,
      text: alias,
      func: () => {
        if (this.selectedAliasItem) {
          this.selectedAliasItem.classList.remove('selectedItem');
        }

        if (alias !== storageManager.getUserName()) {
          storageManager.setSelectedAlias(alias);
        } else {
          storageManager.removeSelectedAlias();
        }

        eventCentral.triggerEvent({ event: eventCentral.Events.ALIAS, params: { alias } });
      },
    });
  }

  createWhisperButton({ roomName, whisperTo, data }) {
    const { whisperTo: retrievedWhisperTo } = convertWhisperRoomName(data || roomName);

    const button = elementCreator.createButton({
      data: data || roomName,
      text: whisperTo ? `${whisperTo}` : roomName,
      func: () => {
        if (this.selectedItem) {
          this.selectedItem.classList.remove('selectedItem');
        }

        button.classList.remove('selected');

        if (retrievedWhisperTo) {
          storageManager.setRoom(data || roomName);
        } else {
          const userName = storageManager.getSelectedAlias() || storageManager.getUserName();
          const whisperRoomName = `${userName}-whisper-${whisperTo}`;

          socketManager.emitEvent('followWhisper', { room: { roomName: whisperRoomName } }, ({ error }) => {
            if (error) {
              console.log(error);

              return;
            }

            eventCentral.triggerEvent({
              event: eventCentral.Events.FOLLOWROOM,
              params: { room: { roomName: `${userName} <-> ${whisperTo}` }, data: whisperRoomName, whisper: true },
            });
            storageManager.setRoom(whisperRoomName);
          });
        }
      },
    });

    return button;
  }

  createRoomButton({ roomName, whisperTo }) {
    let buttonText = roomName;

    if (whisperTo) {
      buttonText = whisperTo;
    } else if (/-team$/g.test(roomName)) {
      buttonText = 'team';
    }

    const button = elementCreator.createButton({
      data: roomName,
      text: buttonText,
      func: () => {
        if (this.selectedItem) {
          this.selectedItem.classList.remove('selectedItem');
        }

        button.classList.remove('selected');

        socketManager.emitEvent('authUserToRoom', { room: { roomName } }, ({ error, data: { allowed, room } }) => {
          if (error) {
            console.log(error);
          } else if (!allowed) {
            const followDialog = new DialogBox({
              buttons: {
                left: {
                  text: 'Cancel',
                  eventFunc: () => { followDialog.removeView(); },
                },
                right: {
                  text: 'Follow',
                  eventFunc: () => {
                    const passwordInput = followDialog.inputs.find(({ inputName }) => inputName === 'password');

                    socketManager.emitEvent('follow', {
                      room: {
                        password: passwordInput ? passwordInput.inputElement.value : '',
                        roomName,
                      },
                    }, ({ error: followError }) => {
                      if (followError) {
                        console.log(followError);
                        followDialog.changeExtraDescription({ text: ['Failed to join the room'] });

                        return;
                      }

                      button.parentElement.remove();
                      eventCentral.triggerEvent({
                        event: eventCentral.Events.FOLLOWROOM,
                        params: { room: { roomName } },
                      });
                      storageManager.setRoom(roomName);
                      followDialog.removeView();
                    });
                  },
                },
              },
              description: ['Do you wish to enter the room? The members of the room will be informed of you entering it'],
            });

            if (room.password) {
              followDialog.addInput({
                placeholder: 'Password',
                inputName: 'password',
                type: 'password',
                isRequired: true,
              });
              followDialog.changeExtraDescription({ text: ['The room is password protected. Enter the correct password'] });
            }

            followDialog.appendTo(this.element.parentElement);
          } else {
            storageManager.setRoom(roomName);
          }
        });
      },
    });

    return button;
  }
}

module.exports = Messenger;
