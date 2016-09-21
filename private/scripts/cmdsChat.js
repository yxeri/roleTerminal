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

    socketHandler.emit('history', data);
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

      for (let i = 0; i < phrases.length; i++) {
        if (phrases[i] === '-s' || phrases[i] === '-silent') {
          morsePhrases.splice(i, 1);
          data.silent = true;
        }
      }

      const morseCodeText = morsePhrases.join(' ').toLowerCase();

      if (morseCodeText.length > 0) {
        data.morseCode = morseCodeText;

        socketHandler.emit('morse', data);
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
        const phrase = phrases.join(' ');
        commandHandler.commandHelper.data.message.customSender = phrase;
      }

      messenger.queueMessage({ text: labels.getText('info', 'typeLineEnter') });
      commandHandler.commandHelper.onStep++;
    },
    (phrases) => {
      const message = commandHandler.commandHelper.data.message;
      let dataText;

      if (phrases.length > 0 && phrases[0] !== '') {
        const phrase = phrases.join(' ');

        message.text.push(phrase);
      } else {
        dataText = copyString(message.text);
        commandHandler.commandHelper.onStep++;

        messenger.queueMessage({ text: labels.getText('info', 'preview') });
        messenger.queueMessage({ text: textTools.prependBroadcastMessage({ sender: message.customSender }).concat(dataText, textTools.createFullLine()) });
        messenger.queueMessage({ text: labels.getText('info', 'isThisOk') });
      }
    },
    (phrases) => {
      if (phrases.length > 0 && phrases[0].toLowerCase() === 'yes') {
        socketHandler.emit('broadcastMsg', commandHandler.commandHelper.data);
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
  func: (phrases) => {
    const data = {};

    if (phrases.length > 1) {
      data.message = {};
      data.message.roomName = phrases[0].toLowerCase();
      data.message.text = [phrases.slice(1).join(' ')];
      data.message.userName = storage.getUser();
      data.message.whisper = true;

      socketHandler.emit('whisperMsg', data);
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
    const data = {
      message: {
        text: [],
        userName: storage.getUser(),
        hideName: true,
      },
    };
    commandHandler.commandHelper.data = data;

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
          commandHelper.onStep++;
          commandHandler.triggerCommandStep();
        }
      }
    },
    () => {
      const commandHelper = commandHandler.commandHelper;

      commandHelper.onStep++;
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
        commandHelper.onStep++;

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
          commandHandler.commandHelper.onStep++;

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

        socketHandler.emit('importantMsg', commandHelper.data);
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

        socketHandler.emit('switchRoom', data);
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
        socketHandler.emit('removeRoom', commandHandler.commandHelper.data);
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
      commandHelper.onStep++;

      if (password.length > 0) {
        commandHelper.data.room.password = password;

        domManipulator.setInputStart('Repeat passwd');
        messenger.queueMessage({
          text: ['Repeat the password'],
          text_se: ['Skriv in lösenordet igen'],
        });
      } else {
        commandHelper.onStep++;
        socketHandler.emit('createRoom', commandHelper.data);
        commandHandler.resetCommand(false);
      }
    },
    (phrases = ['']) => {
      const commandHelper = commandHandler.commandHelper;
      const password = phrases[0];

      if (password === commandHelper.data.room.password) {
        socketHandler.emit('createRoom', commandHelper.data);
        commandHandler.resetCommand(false);
      } else {
        commandHelper.onStep--;

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
      socketHandler.emit('inviteToRoom', data);
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
