/** @module */

const labels = require('./labels');
const storage = require('./storage');
const socketHandler = require('./socketHandler');
const textTools = require('./textTools');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.whoami = {
  func: () => {
    socketHandler.emit('whoAmI');
  },
  accessLevel: 13,
  category: 'basic',
};

commands.register = {
  func: (phrases = []) => {
    const data = {};

    if (storage.getUser() === null) {
      const userName = phrases[0];

      if (userName && userName.length >= 2 && userName.length <= 6 && textTools.isTextAllowed(userName)) {
        const commandHelper = commandHandler.commandHelper;
        data.user = {
          userName,
          registerDevice: storage.getDeviceId(),
        };
        commandHelper.data = data;
        commandHelper.hideInput = true;
        domManipulator.hideInput(true);
        socketHandler.emit('userExists', commandHelper.data);
      } else {
        commandHandler.resetCommand(true);
        messenger.queueMessage({
          text: [
            'Name has to be 2 to 6 characters long',
            'The name can only contain letters and numbers (a-z, 0-9)',
            'Don\'t use whitespace in your name!',
            'example: register myname',
          ],
          text_se: [
            'Namnet behöver vara 2 till 6 tecken långt',
            'Namnet får endast innehålla bokstäver och nummer (a-z, 0-9)',
            'Använd inte blanksteg i ert namn!',
            'Exempel: register myname',
          ],
        });
      }
    } else {
      commandHandler.resetCommand(true);
      messenger.queueMessage({
        text: [
          'You have already registered a user',
          `${storage.getUser()} is registered and logged in`,
        ],
        text_se: [
          'Ni har redan registrerat en användare',
          `${storage.getUser()} är registrerad och inloggad`,
        ],
      });
    }
  },
  steps: [
    () => {
      messenger.queueMessage({
        text: [
          'Input a password and press enter',
          'Your password won\'t appear on the screen as you type it',
          'Don\'t use whitespaces in your password!',
        ],
        text_se: [
          'Skriv in ert lösenord och tryck på enter-knappen',
          'Ert lösenord kommer inte visas på skärmen',
          'Använd inte blanksteg i ert lösenord!',
        ],
      });
      messenger.queueMessage({ text: labels.getText('info', 'cancel') });
      domManipulator.setInputStart('password');
      commandHandler.commandHelper.onStep++;
    },
    (phrases = []) => {
      const password = phrases[0];

      if (phrases && password.length >= 3 && textTools.isTextAllowed(password)) {
        const commandHelper = commandHandler.commandHelper;

        commandHelper.data.user.password = password;
        messenger.queueMessage({
          text: ['Repeat your password one more time'],
          text_se: ['Skriv in ert lösenord en gång till'],
        });
        commandHelper.onStep++;
      } else {
        messenger.queueMessage({
          text: [
            'Password is too short!',
            'It has to be at least 3 characters (a-z, 0-9. Password can mix upper/lowercase)',
            'Please, input a password and press enter',
          ],
          text_se: [
            'Lösenordet är för kort!',
            'Det måste vara minst 3 tecken långt (a-z, 0-9. Lösenordet kan ha en blandning av gemener och versaler)',
            'Skriv in ert lösenord och tryck på enter-knappen',
          ],
        });
      }
    },
    (phrases = []) => {
      const commandHelper = commandHandler.commandHelper;
      const password = phrases[0];

      if (password === commandHelper.data.user.password) {
        messenger.queueMessage({ text: labels.getText('info', 'congratulations') });
        socketHandler.emit('register', commandHelper.data);
        commandHandler.abortCommand(commandHelper.command);
        commandHandler.resetCommand(false);
      } else {
        messenger.queueMessage({
          text: [
            'Passwords don\'t match. Please try again',
            'Input a password and press enter',
          ],
          text_se: [
            'Lösenorden matchar inte. Försök igen',
            'Skriv in ert lösenord och tryck på enter-knappen',
          ],
        });
        commandHelper.onStep--;
      }
    },
  ],
  abortFunc: () => {
    domManipulator.hideInput(false);
  },
  accessLevel: 0,
  category: 'login',
  commandName: 'register',
};

commands.login = {
  func: (phrases) => {
    const data = { user: {} };

    if (storage.getUser() !== null) {
      messenger.queueMessage({
        text: [
          'You are already logged in',
          'You have to be logged out to log in',
        ],
        text_se: [
          'Ni har redan loggat in',
          'Ni måste vara utloggade för att kunna logga in',
        ],
      });
      commandHandler.resetCommand();
    } else if (phrases.length > 0) {
      const commandHelper = commandHandler.commandHelper;
      data.user.userName = phrases[0].toLowerCase();
      commandHelper.data = data;
      commandHelper.hideInput = true;

      messenger.queueMessage({
        text: ['Input your password'],
        text_se: ['Skriv in ert lösenord'],
      });
      domManipulator.setInputStart('password');
      domManipulator.hideInput(true);
    } else {
      messenger.queueMessage({
        text: [
          'You need to input a user name',
          'Example: login best',
        ],
        text_se: [
          'Ni måste skriva in ert användarnamn',
          'Exempel: login best',
        ],
      });
      domManipulator.resetCommand();
    }
  },
  steps: [
    (phrases) => {
      const commandHelper = commandHandler.commandHelper;
      commandHelper.data.user.password = phrases[0];

      socketHandler.emit('login', commandHelper.data);
      commandHandler.abortCommand(commandHelper.command);
      commandHandler.triggerCommand({ cmd: 'clear' });
      commandHandler.resetCommand();
    },
  ],
  abortFunc: () => {
    domManipulator.hideInput(false);
  },
  clearAfterUse: true,
  accessLevel: 0,
  category: 'login',
  commandName: 'login',
};

commands.password = {
  func: () => {
    commandHandler.commandHelper.hideInput = true;

    domManipulator.hideInput(true);
    domManipulator.setInputStart('Old passwd');
    messenger.queueMessage({ text: labels.getText('info', 'cancel') });
    messenger.queueMessage({
      text: ['Enter your current password'],
      text_se: ['Skriv in ert nuvarande lösenord'],
    });
  },
  steps: [
    (phrases = ['']) => {
      const commandHelper = commandHandler.commandHelper;
      const data = {};
      const oldPassword = phrases[0];
      data.oldPassword = oldPassword;
      commandHelper.data = data;
      commandHelper.onStep++;

      domManipulator.setInputStart('New pass');
      socketHandler.emit('checkPassword', data);
    },
    (phrases = []) => {
      const commandHelper = commandHandler.commandHelper;
      commandHelper.data.newPassword = phrases[0];
      commandHelper.onStep++;

      domManipulator.setInputStart('Repeat passwd');
      messenger.queueMessage({
        text: ['Repeat your new password'],
        text_se: ['Skriv in ert nya lösenord igen'],
      });
    },
    (phrases = []) => {
      const commandHelper = commandHandler.commandHelper;
      const repeatedPassword = phrases[0];

      if (repeatedPassword === commandHelper.data.newPassword) {
        socketHandler.emit('changePassword', commandHelper.data);
        commandHandler.resetCommand(false);
      } else {
        commandHelper.onStep--;

        domManipulator.setInputStart('New pass');
        messenger.queueMessage({
          text: [
            'Password doesn\'t match. Please try again',
            'Enter your new password',
          ],
          text_se: [
            'Lösenorden matchar inte. Försök igen',
            'Skriv in ert nya lösenord',
          ],
        });
      }
    },
  ],
  abortFunc: () => {
    domManipulator.hideInput(false);
  },
  accessLevel: 13,
  category: 'basic',
  commandName: 'password',
};

commands.logout = {
  func: () => {
    socketHandler.emit('logout');
  },
  accessLevel: 13,
  category: 'basic',
  clearAfterUse: true,
  commandName: 'logout',
};

module.exports = commands;
