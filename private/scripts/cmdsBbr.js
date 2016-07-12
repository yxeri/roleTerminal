/** @module */

const textTools = require('./textTools');
const socketHandler = require('./socketHandler');
const commandHandler = require('./commandHandler');
const messenger = require('./messenger');
const domManipulator = require('./domManipulator');
const labels = require('./labels');

/**
 * @static
 * @type {Object}
 */
const commands = {};

function humanReadableHints(hints) {
  const modifiedHints = [];

  function createReadable(hint) {
    const splitHint = hint.split(' ');
    let modifiedHint = hint;

    if (splitHint[0] === 'end') {
      modifiedHint = `Password ends with: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'middle') {
      modifiedHint = `Position ${parseInt(splitHint[1], 10) + 1} in the password is: ${splitHint[2]}. `;
    } else if (splitHint[0] === 'start') {
      modifiedHint = `Password starts with: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'type') {
      modifiedHint = `Password is a word of type: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'length') {
      modifiedHint = `Password length is: ${splitHint[1]}. `;
    }

    return modifiedHint;
  }

  for (const hint of hints) {
    modifiedHints.push(createReadable(hint));
  }

  return modifiedHints;
}

commands.hackstation = {
  func: () => {
    commandHandler.commandHelper.data = {};
    commandHandler.commandHelper.fallbackStep = 3;

    socketHandler.emit('getGameUsersSelection', { userAmount: 3 });
  },
  steps: [
    (params) => {
      const users = params.users;
      const passwords = params.passwords;
      const codeColumns = [];

      for (let i = 0; i < 2; i++) {
        codeColumns.push(textTools.createMixedArray({
          amount: 23,
          length: 28,
          upperCase: false,
          codeMode: true,
          requiredStrings: passwords[i],
        }));
      }

      domManipulator.setInputStart('ssm');
      messenger.queueMessage({
        text: labels.getText('info', 'hackStationIntro'),
      });

      commandHandler.commandHelper.data.codeColumns = codeColumns;
      commandHandler.commandHelper.data.users = users;
      commandHandler.commandHelper.onStep++;
    },
    () => {
      const users = commandHandler.commandHelper.data.users;
      let userList = [];
      commandHandler.commandHelper.onStep++;

      for (const user of users) {
        userList.push(textTools.createFullLine());
        userList.push(`User: ${user.userName}`);
        userList.push('Gathered password information:');
        userList = userList.concat(humanReadableHints(user.hints));
      }

      commandHandler.triggerCommand({ cmd: 'clear' });
      messenger.queueMessage({
        text: [
          'Users with authorization to access the station:',
        ].concat(userList),
      });
      messenger.queueMessage({
        text: [
          textTools.createFullLine(),
          'Press enter to continue. Prepare to receive memory dumps',
        ],
      });
    },
    () => {
      const codeColumns = commandHandler.commandHelper.data.codeColumns;

      commandHandler.triggerCommand({ cmd: 'clear' });
      messenger.queueMessage({
        text: [
          'Dumping and translating memory content...',
          textTools.createFullLine(),
        ],
      });
      messenger.queueMessage({ text: codeColumns.shift() });

      if (codeColumns.length === 0) {
        commandHandler.commandHelper.onStep++;
      }
    },
    (params = {}) => {
      commandHandler.commandHelper.onStep++;

      if (!params.reset) {
        commandHandler.triggerCommand({ cmd: 'clear' });
        messenger.queueMessage({
          text: [
            'Memory dump done',
            'All traces cleared',
            'Input authorized user:',
          ],
        });
      } else {
        messenger.queueMessage({
          text: ['Input authorized user:'],
        });
      }

      domManipulator.setInputStart('authUsr');
    },
    (phrases) => {
      if (!phrases) {
        domManipulator.setInputStart('authUsr');
        messenger.queueMessage({
          text: [
            'Incorrect user and/or password',
            'Lockdown will initiate with too many failed attempts',
            'Input authorized user:',
          ],
        });
      } else {
        commandHandler.commandHelper.data.gameUser = { userName: phrases[0].toLowerCase() };
        commandHandler.commandHelper.onStep++;

        domManipulator.setInputStart('passwd');
        messenger.queueMessage({ text: ['Input password:'] });
      }
    },
    (phrases = ['']) => {
      commandHandler.commandHelper.data.gameUser.password = phrases[0];
      commandHandler.commandHelper.onStep++;

      domManipulator.setInputStart('choice');
      messenger.queueMessage({
        text: [
          'Which command do you want to trigger?',
          'Enter the number of your choice:',
          '[1] Boost signal to the station',
          '[2] Block signal to the station',
        ],
      });
    },
    (phrases) => {
      const validOptions = ['1', '2'];

      if (!phrases || validOptions.indexOf(phrases[0]) === -1) {
        messenger.queueMessage({
          text: [
            'Incorrect choice',
            'Which command do you want to trigger?',
            'Enter the number of your choice:',
            '[1] Boost signal to the station',
            '[2] Block signal to the station',
          ],
        });
      } else {
        commandHandler.commandHelper.data.choice = phrases[0];
        commandHandler.commandHelper.onStep++;

        socketHandler.emit('manipulateStation', commandHandler.commandHelper.data);
      }
    },
  ],
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'hackstation',
};

/**
 * emp + 3 numbers (emp5120, emp3310, emp0020)
 */

/**
 * Random passwords need hint for:
 * word type
 */

/**
 * Single character placement
 * String length
 * Multiple character placements
 * Word type (example: fruit)
 */

// commands.addgameuser = {
//   func: (phrases = []) => {
//     if (phrases.length < 2) {
//       commandHandler.resetCommand(true);

//       return;
//     }

//     commandHandler.commandHelper.data = {
//       gameUser: {
//         userName: phrases[0],
//         password: phrases[1],
//       },
//     };

//     messenger.queueMessage({ text: labels.getText('info', 'cancel') });
//     messenger.queueMessage({ text: [
//       'Type a password hint and press enter',
//       'Press enter without any input when you are done',
//     ] });
//     domManipulator.setInputStart('addGmUsr');
//   },
//   steps: [
//     (phrases = []) => {
//       const commandHelper = commandHandler.commandHelper;
//       const gameUser = commandHelper.gameUser;

//       if (phrases.length > 0 && phrases[0] !== '') {

//       } else {
//         messenger.queueMessage({ text:  });
//         messenger.queueMessage({ text: labels.getText('info', 'isThisOk') });
//       }
//     },
//   ],
//   accessLevel: 1,
//   visibility: 1,
//   category: 'admin',
//   commandName: 'addgameuser',
// };

// commands.addallgameusers = {
//   func: () => {

//   },
//   accessLevel: 1,
//   visibility: 1,
//   category: 'admin',
//   commandName: 'addallgameusers',
// };

module.exports = commands;
