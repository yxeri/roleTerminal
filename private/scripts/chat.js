const labels = require('./labels');
const storage = require('./storage');
const textTools = require('./textTools');
const socketHandler = require('./socketHandler');
const messenger = require('./messenger');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');

/**
 * Symbolizes space between words in morse string
 * @type {string}
 */
const morseSeparator = '#';
const morseCodes = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',
  '#': morseSeparator,
};
const commands = {};

function copyString(text) {
  return text && text !== null ? JSON.parse(JSON.stringify(text)) : '';
}

function parseMorse(text) {
  let morseCode;
  let morseCodeText = '';
  let filteredText = text.toLowerCase();

  filteredText = filteredText.replace(/[åä]/g, 'a');
  filteredText = filteredText.replace(/[ö]/g, 'o');
  filteredText = filteredText.replace(/\s/g, '#');
  filteredText = filteredText.replace(/[^a-z0-9#]/g, '');

  for (let i = 0; i < filteredText.length; i++) {
    morseCode = morseCodes[filteredText.charAt(i)];

    for (let j = 0; j < morseCode.length; j++) {
      morseCodeText += `${morseCode[j]} `;
    }

    morseCodeText += '   ';
  }

  return morseCodeText;
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

      const morseCodeText = parseMorse(morsePhrases.join(' ').toLowerCase());

      if (morseCodeText.length > 0) {
        data.morseCode = morseCodeText;

        socketHandler.emit('morse', data);
      }
    }
  },
  accessLevel: 13,
  category: 'admin',
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
};

commands.broadcast = {
  func: () => {
    commandHandler.getCommandHelper().data = {
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
        commandHandler.getCommandHelper().data.message.customSender = phrase;
      }

      messenger.queueMessage({ text: labels.getText('info', 'typeLineEnter') });
      commandHandler.getCommandHelper().onStep++;
    },
    (phrases) => {
      const message = commandHandler.getCommandHelper().data.message;
      let dataText;

      if (phrases.length > 0 && phrases[0] !== '') {
        const phrase = phrases.join(' ');

        message.text.push(phrase);
      } else {
        dataText = copyString(message.text);
        commandHandler.getCommandHelper().onStep++;

        messenger.queueMessage({ text: labels.getText('info', 'preview') });
        messenger.queueMessage({ text: textTools.prependBroadcastMessage({ sender: message.customSender }).concat(dataText, textTools.createFullLine()) });
        messenger.queueMessage({ text: labels.getText('info', 'isThisOk') });
      }
    },
    (phrases) => {
      if (phrases.length > 0 && phrases[0].toLowerCase() === 'yes') {
        socketHandler.emit('broadcastMsg', commandHandler.getCommandHelper().data);
        commandHandler.resetCommand();
      } else {
        commandHandler.resetCommand(true);
      }
    },
  ],
  accessLevel: 13,
  clearAfterUse: true,
  category: 'admin',
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
    commandHandler.getCommandHelper().data = data;

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
        const commandHelper = commandHandler.getCommandHelper();
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
          commands[commandHelper.command].steps[commandHelper.onStep]();
        }
      }
    },
    () => {
      const commandHelper = commandHandler.getCommandHelper();

      commandHelper.onStep++;
      messenger.queueMessage({ text: labels.getText('info', 'typeLineEnter') });
      messenger.queueMessage({ text: labels.getText('info', 'keepShortMorse') });
    },
    (phrases) => {
      const commandHelper = commandHandler.getCommandHelper();
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
          commandHandler.getCommandHelper().onStep++;

          messenger.queueMessage({ text: labels.getText('info', 'sendMorse') });
        } else {
          commandHandler.resetCommand(true);
        }
      }
    },
    (phrases) => {
      if (phrases.length > 0) {
        const commandHelper = commandHandler.getCommandHelper();

        if (phrases[0].toLowerCase() === 'yes') {
          commandHelper.data.morse = {
            morseCode: parseMorse(commandHelper.data.message.text[0]),
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
};

commands.removeroom = {
  func: (phrases) => {
    const data = { room: {} };

    if (phrases.length > 0) {
      data.room.roomName = phrases[0].toLowerCase();
      commandHandler.getCommandHelper().data = data;

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
        socketHandler.emit('removeRoom', commandHandler.getCommandHelper().data);
      }

      commandHandler.resetCommand();
    },
  ],
  accessLevel: 13,
  category: 'advanced',
};

commands.createroom = {
  func: (phrases = ['']) => {
    if (phrases.length > 0) {
      const roomName = phrases[0].toLowerCase();

      if (roomName.length > 0 && roomName.length <= 6 && textTools.isTextAllowed(roomName)) {
        const data = { room: {} };
        data.room.roomName = roomName;
        data.room.owner = storage.getUser();
        commandHandler.getCommandHelper().data = data;
        commandHandler.getCommandHelper().hideInput = true;

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
      const commandHelper = commandHandler.getCommandHelper();
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
      const commandHelper = commandHandler.getCommandHelper();
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
  category: 'advanced',
};

commands.myrooms = {
  func: () => {
    const data = { user: {}, device: {} };

    data.user.userName = storage.getUser();
    data.device.deviceId = storage.getDeviceId();

    socketHandler.emit('myRooms', data);
  },
  accessLevel: 13,
  category: 'advanced',
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
};

commands.follow = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const commandHelper = commandHandler.getCommandHelper();
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
      const commandHelper = commandHandler.getCommandHelper();

      if (phrases.length > 0) {
        commandHelper.data.room.password = phrases[0];
      }

      socketHandler.emit('follow', { room: commandHelper.data.room });
    },
  ],
  autocomplete: { type: 'rooms' },
  accessLevel: 13,
  category: 'advanced',
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
};

module.exports = commands;
