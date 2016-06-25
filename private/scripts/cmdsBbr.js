/** @module */

const textTools = require('./textTools');
const socketHandler = require('./socketHandler');
const commandHandler = require('./commandHandler');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

function humanReadableHints(hints) {
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

  return hints.reduce((previous, current) => `${createReadable(previous)}${createReadable(current)}`);
}

commands.hackstation = {
  func: () => {
    commandHandler.commandHelper.data = {};

    socketHandler.emit('getGameUsersSelection', { userAmount: 3 });
  },
  steps: [
    (params) => {
      const users = params.users;
      const passwords = params.passwords;
      const codeColumns = [];

      for (let i = 0; i < 2; i++) {
        codeColumns.push(textTools.createMixedArray({
          amount: 24,
          length: 28,
          upperCase: false,
          codeMode: true,
          requiredStrings: passwords[i],
        }));
      }

      commandHandler.commandHelper.data.codeColumns = codeColumns;

      messenger.queueMessage({ text: users.map((user) => `User: ${user.userName}. Gathered password information: ${humanReadableHints(user.hints)}`) });

      messenger.queueMessage({ text: codeColumns[0] });
      messenger.queueMessage({ text: codeColumns[1] });
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
