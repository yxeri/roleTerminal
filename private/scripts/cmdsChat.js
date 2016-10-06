/*
 Copyright 2015 Aleksandar Jankovic

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

/** @module */

const labels = require('./labels');
const storage = require('./storage');
const textTools = require('./textTools');
const socketHandler = require('./socketHandler');
const messenger = require('./messenger');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');

/**
 * @static
 * @type {Object}
 */
const commands = {};

/**
 * Copies string to avoid the original being consumed
 * @private
 * @param {string} text - String to copy
 * @returns {string} - String copy
 */
function copyString(text) {
  return text && text !== null ? JSON.parse(JSON.stringify(text)) : '';
}

/**
 * Callback sent to server on createRoom emit
 * @param {Object} error - Will be set if something went wrong
 * @param {Object} room - Will be set if successful. Undefined means that it failed to create the room, due to it already existing
 */
function createRoomCallback({ error, room }) {
  if (error) {
    return;
  }

  if (room) {
    messenger.queueMessage({
      text: ['Room has been created'],
      text_se: ['Rummet har skapats'],
    });
  } else {
    messenger.queueMessage({
      text: ['Failed to create room. A room with that name already exists'],
      text_se: ['Lyckades inte skapa rummet. Ett rum med det namnet existerar redan'],
    });
  }
}

commands.history = {
  func: (phrases) => {
    const data = {};

    if (phrases.length > 0) {
      if (!isNaN(phrases[0]) || phrases[0] === '*') {
        data.lines = phrases[0];
      } else {
        data.room = { roomName: phrases[0] };

        if (phrases.length > 1 && (!isNaN(phrases[1]) || phrases[1] === '*')) {
          data.lines = phrases[1];
        }
      }
    }

    socketHandler.emit('history', data, ({ error, messages }) => {
      if (error) {
        return;
      }

      messenger.onMessages({ messages });
    });
  },
  clearAfterUse: true,
  clearBeforeUse: true,
  accessLevel: 1,
  category: 'advanced',
  commandName: 'history',
};

commands.morse = {
  func: (phrases, local) => {
    if (phrases && phrases.length > 0) {
      const data = {
        local,
      };
      const morsePhrases = phrases;

      for (let i = 0; i < phrases.length; i += 1) {
        if (phrases[i] === '-s' || phrases[i] === '-silent') {
          morsePhrases.splice(i, 1);
          data.silent = true;
        }
      }

      const morseCodeText = morsePhrases.join(' ').toLowerCase();

      if (morseCodeText.length > 0) {
        data.morseCode = morseCodeText;

        socketHandler.emit('morse', data, ({ error }) => {
          if (error) {
            return;
          }
        });
      }
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'morse',
};

commands.msg = {
  func: (phrases) => {
    let writtenMsg;

    if (phrases && phrases.length > 0) {
      writtenMsg = phrases.join(' ');

      socketHandler.emit('chatMsg', {
        message: {
          text: [writtenMsg],
          userName: storage.getUser(),
          roomName: storage.getRoom(),
        },
      }, ({ error, message }) => {
        if (error) {
          return;
        }

        messenger.onMessage({ message });
      });
    } else {
      messenger.queueMessage({
        text: ['You forgot to type the message!'],
        text_se: ['Ni glömde skriva in ett meddelande!'],
      });
    }
  },
  clearAfterUse: true,
  accessLevel: 13,
  category: 'advanced',
  commandName: 'msg',
};

commands.broadcast = {
  func: () => {
    commandHandler.commandHelper.data = {
      message: {
        text: [],
        title: [],
        hideName: true,
      },
    };

    messenger.queueMessage({ text: labels.getText('info', 'whoFrom') });
    messenger.queueMessage({ text: labels.getText('info', 'cancel') });
    domManipulator.setInputStart('broadcast');
  },
  steps: [
    (phrases) => {
      if (phrases.length > 0 && phrases[0] !== '') {
        commandHandler.commandHelper.data.message.customSender = phrases.join(' ');
      }

      messenger.queueMessage({ text: labels.getText('info', 'typeLineEnter') });
      commandHandler.commandHelper.onStep += 1;
    },
    (phrases) => {
      const message = commandHandler.commandHelper.data.message;
      let dataText;

      if (phrases.length > 0 && phrases[0] !== '') {
        const phrase = phrases.join(' ');

        message.text.push(phrase);
      } else {
        dataText = copyString(message.text);
        commandHandler.commandHelper.onStep += 1;

        messenger.queueMessage({ text: labels.getText('info', 'preview') });
        messenger.queueMessage({ text: textTools.prependBroadcastMessage({ sender: message.customSender }).concat(dataText, textTools.createFullLine()) });
        messenger.queueMessage({ text: labels.getText('info', 'isThisOk') });
      }
    },
    (phrases) => {
      if (phrases.length > 0 && phrases[0].toLowerCase() === 'yes') {
        socketHandler.emit('broadcastMsg', commandHandler.commandHelper.data, ({ error, message }) => {
          if (error) {
            return;
          }

          messenger.onMessage({ message });
        });
        commandHandler.resetCommand();
      } else {
        commandHandler.resetCommand(true);
      }
    },
  ],
  accessLevel: 13,
  clearAfterUse: true,
  category: 'admin',
  commandName: 'broadcast',
};

commands.whisper = {
  func: (phrases = []) => {
    const data = {};

    if (phrases.length > 1) {
      data.message = {};
      data.message.roomName = phrases[0].toLowerCase();
      data.message.text = [phrases.slice(1).join(' ')];
      data.message.userName = storage.getUser();
      data.message.whisper = true;

      socketHandler.emit('whisperMsg', data, ({ error, message }) => {
        if (error) {
          return;
        }

        messenger.onMessage({ message });
      });
    } else {
      messenger.queueMessage({
        text: ['You forgot to type the message!'],
        text_se: ['Ni glömde skriva in ett meddelande!'],
      });
    }
  },
  clearAfterUse: true,
  autocomplete: { type: 'users' },
  accessLevel: 13,
  category: 'basic',
  commandName: 'whisper',
};

commands.importantmsg = {
  func: () => {
    commandHandler.commandHelper.data = {
      message: {
        text: [],
        userName: storage.getUser(),
        hideName: true,
      },
    };

    messenger.queueMessage({ text: labels.getText('info', 'cancel') });
    messenger.queueMessage({
      text: [
        'Do you want to send it to a specific device?',
        'Enter the device ID or alias to send it to a specific device',
        'Leave it empty and press enter if you want to send it to all users',
      ],
      text_se: [
        'Vill ni skicka meddelandet till en specifik enhet?',
        'Skriv in ID eller alias till en enhet för att skicka meddelandet till endast den enheten',
        'Lämna det tomt och tryck på enter-knappen om ni vill skicka det till alla användare',
      ],
    });
    domManipulator.setInputStart('imprtntMsg');
  },
  steps: [
    (phrases) => {
      if (phrases.length > 0) {
        const commandHelper = commandHandler.commandHelper;
        const deviceId = phrases[0];

        if (deviceId.length > 0) {
          commandHelper.data.device = { deviceId };
          messenger.queueMessage({
            text: ['Searching for device...'],
            text_se: ['Letar efter enheten...'],
          });
          socketHandler.emit('verifyDevice', commandHelper.data);
        } else {
          commandHelper.onStep += 1;
          commandHandler.triggerCommandStep();
        }
      }
    },
    () => {
      const commandHelper = commandHandler.commandHelper;

      commandHelper.onStep += 1;
      messenger.queueMessage({ text: labels.getText('info', 'typeLineEnter') });
      messenger.queueMessage({ text: labels.getText('info', 'keepShortMorse') });
    },
    (phrases) => {
      const commandHelper = commandHandler.commandHelper;
      const message = commandHelper.data.message;

      if (phrases.length > 0 && phrases[0] !== '') {
        const phrase = phrases.join(' ');

        message.text.push(phrase);
      } else {
        const dataText = copyString(message.text);
        commandHelper.onStep += 1;

        messenger.queueMessage({ text: labels.getText('info', 'preview') });
        messenger.queueMessage({
          text: dataText,
          extraClass: 'importantMsg',
        });
        messenger.queueMessage({ text: labels.getText('info', 'isThisOk') });
      }
    },
    (phrases) => {
      if (phrases.length > 0) {
        if (phrases[0].toLowerCase() === 'yes') {
          commandHandler.commandHelper.onStep += 1;

          messenger.queueMessage({ text: labels.getText('info', 'sendMorse') });
        } else {
          commandHandler.resetCommand(true);
        }
      }
    },
    (phrases) => {
      if (phrases.length > 0) {
        const commandHelper = commandHandler.commandHelper;

        if (phrases[0].toLowerCase() === 'yes') {
          commandHelper.data.morse = {
            morseCode: commandHelper.data.message.text[0],
            local: true,
          };
        }

        socketHandler.emit('importantMsg', commandHelper.data, ({ error, message, device }) => {
          if (error) {
            return;
          }

          if (device) {
            messenger.queueMessage({
              text: ['Sent important message to device'],
              text_se: ['Skickade viktigt meddelande till enheten'],
            });
          } else {
            messenger.onImportantMsg({ message });
          }
        });
        commandHandler.resetCommand();
      }
    },
  ],
  accessLevel: 13,
  category: 'admin',
  commandName: 'importantmsg',
};

commands.room = {
  func: (phrases) => {
    const data = { room: {} };

    if (phrases.length > 0) {
      const roomName = phrases[0].toLowerCase();

      if (roomName) {
        data.room.roomName = roomName;
        /**
         * Flag that will be used in .on function locally to
         * show user they have entered
         */
        data.room.entered = true;

        socketHandler.emit('switchRoom', data, ({ error }) => {
          if (error) {
            return;
          }
        });
      }
    } else {
      messenger.queueMessage({
        text: ['You have to specify which room to switch to'],
        text_se: ['Ni måste specificera vilket ni vill byta till'],
      });
    }
  },
  autocomplete: { type: 'myRooms' },
  accessLevel: 13,
  category: 'advanced',
  commandName: 'room',
};

commands.removeroom = {
  func: (phrases) => {
    const data = { room: {} };

    if (phrases.length > 0) {
      data.room.roomName = phrases[0].toLowerCase();
      commandHandler.commandHelper.data = data;

      messenger.queueMessage({
        text: [
          'Do you really want to remove the room?',
          'Confirm by writing "yes"',
        ],
        text_se: [
          'Vill ni verkligen ta bort rummet?',
          'Skriv "ja" om ni är säkra',
        ],
      });

      domManipulator.setInputStart('removeroom');
    } else {
      commandHandler.resetCommand(true);

      messenger.queueMessage({
        text: ['You forgot to input the room name'],
        text_se: ['Ni glömde bort att skriva in ett rumsnamn'],
      });
    }
  },
  steps: [
    (phrases) => {
      if (phrases[0].toLowerCase() === 'yes') {
        socketHandler.emit('removeRoom', commandHandler.commandHelper.data, ({ error }) => {
          if (error) {
            return;
          }

          messenger.queueMessage({
            text: ['Removed the room'],
            text_se: ['Rummet borttaget'],
          });
        });
      }

      commandHandler.resetCommand();
    },
  ],
  accessLevel: 13,
  category: 'advanced',
  commandName: 'removeroom',
};

commands.createroom = {
  func: (phrases = ['']) => {
    if (phrases.length > 0) {
      const roomName = phrases[0].toLowerCase();

      if (roomName.length > 0 && roomName.length <= 6 && textTools.isTextAllowed(roomName)) {
        const data = { room: {} };
        data.room.roomName = roomName;
        data.room.owner = storage.getUser();
        commandHandler.commandHelper.data = data;
        commandHandler.commandHelper.hideInput = true;

        messenger.queueMessage({
          text: [
            'Enter a password for the room',
            'Leave it empty if you don\'t want to password protect the room',
          ],
          text_se: [
            'Skriv in ett lösenord för rummet',
            'Ni kan lämna det tomt om ni inte vill skydda rummet med ett lösenord',
          ],
        });
        domManipulator.setInputStart('Set passwd');
        domManipulator.hideInput(true);
      } else {
        commandHandler.resetCommand(true);
        messenger.queueMessage({ text: labels.getText('errors', 'failedRoom') });
      }
    } else {
      commandHandler.resetCommand(true);
      messenger.queueMessage({ text: labels.getText('errors', 'failedRoom') });
    }
  },
  steps: [
    (phrases = ['']) => {
      const commandHelper = commandHandler.commandHelper;
      const password = phrases[0];
      commandHelper.onStep += 1;

      if (password.length > 0) {
        commandHelper.data.room.password = password;

        domManipulator.setInputStart('Repeat passwd');
        messenger.queueMessage({
          text: ['Repeat the password'],
          text_se: ['Skriv in lösenordet igen'],
        });
      } else {
        commandHelper.onStep += 1;
        socketHandler.emit('createRoom', commandHelper.data, createRoomCallback);
        commandHandler.resetCommand(false);
      }
    },
    (phrases = ['']) => {
      const commandHelper = commandHandler.commandHelper;
      const password = phrases[0];

      if (password === commandHelper.data.room.password) {
        socketHandler.emit('createRoom', commandHelper.data, createRoomCallback);
        commandHandler.resetCommand(false);
      } else {
        commandHelper.onStep -= 1;

        messenger.queueMessage({
          text: [
            'Passwords don\'t match. Try again',
            'Enter a password for the room',
            'Leave it empty if you don\'t want password-protect the room',
          ],
          text_se: [
            'Lösenorden matchar inte. Försök igen',
            'Skriv in lösenordet för rummet',
            'Lämna det tomt om ni inte vill skydda rummet med ett lösenord',
          ],
        });
        domManipulator.setInputStart('Set passwd');
      }
    },
  ],
  accessLevel: 13,
  visibility: 13,
  category: 'advanced',
  commandName: 'createroom',
};

commands.inviteroom = {
  func: (phrases) => {
    const data = {
      user: { userName: phrases[0] },
      room: { roomName: phrases[1] },
    };

    if (data.user.userName && data.room.roomName) {
      socketHandler.emit('inviteToRoom', data, ({ error, user }) => {
        if (error) {
          if (error.code && error.code === 11000) {
            messenger.queueMessage({
              text: ['You have already sent an invite to the user'],
              text_se: ['Ni har redan skickat en inbjudan till användaren'],
            });
          }

          return;
        }

        if (user) {
          messenger.queueMessage({
            text: ['Sent an invitation to the user'],
            text_se: ['Skickade en inbjudan till användaren'],
          });
        } else {
          messenger.queueMessage({
            text: ['The user is already following the room'],
            text_se: ['Användaren följer redan rummet'],
          });
        }
      });
    } else {
      messenger.queueMessage({
        text: ['You have to enter a user name and a room name. Example: inviteroom bob room1'],
        text_se: ['Ni måste skriva in ett användarnamn och ett rumsnamn. Exempel: inviteroom bob rum1'],
      });
    }
  },
  accessLevel: 13,
  category: 'basic',
  commandName: 'inviteroom',
};

commands.follow = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const commandHelper = commandHandler.commandHelper;
      const room = {
        roomName: phrases[0].toLowerCase(),
      };

      commandHelper.data = { room };
      commandHelper.hideInput = true;
      domManipulator.hideInput(true);

      messenger.queueMessage({
        text: ['Enter the password for the room. Leave empty and press enter if the room is not protected'],
        text_se: ['Skriv in rummets lösenord. Lämna det tomt och tryck på enter-knappen om rummet inte är skyddat'],
      });
      domManipulator.setInputStart('password');
    } else {
      messenger.queueMessage({
        text: ['You have to specify which room to follow'],
        text_se: ['Ni måste specificera vilket rum ni vill följa'],
      });
      commandHandler.resetCommand(false);
    }
  },
  steps: [
    (phrases) => {
      const commandHelper = commandHandler.commandHelper;

      if (phrases.length > 0) {
        commandHelper.data.room.password = phrases[0];
      }

      socketHandler.emit('follow', { room: commandHelper.data.room });
    },
  ],
  autocomplete: { type: 'rooms' },
  accessLevel: 13,
  category: 'advanced',
  commandName: 'follow',
};

commands.unfollow = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const room = {
        roomName: phrases[0].toLowerCase(),
      };

      if (room.roomName === storage.getRoom()) {
        room.exited = true;
      }

      socketHandler.emit('unfollow', { room });
    } else {
      messenger.queueMessage({
        text: ['You have to specify which room to unfollow'],
        text_se: ['Ni måste specificera vilket rum ni vill sluta följa'],
      });
    }
  },
  autocomplete: { type: 'myRooms' },
  accessLevel: 13,
  category: 'advanced',
  commandName: 'unfollow',
};

module.exports = commands;
