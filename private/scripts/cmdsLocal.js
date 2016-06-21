/** @module */

const labels = require('./labels');
const storage = require('./storage');
const audio = require('./audio');
const messenger = require('./messenger');
const commandHandler = require('./commandHandler');
const textTools = require('./textTools');
const domManipulator = require('./domManipulator');

/**
 * @static
 * @type {Object}
 */
const commands = {};

/**
 * Reloads the page
 * @private
 */
function refreshApp() {
  window.location.reload();
}

commands.reboot = {
  func: () => {
    refreshApp();
  },
  accessLevel: 1,
  category: 'basic',
};

commands.alias = {
  func: (phrases) => {
    const aliasName = phrases.shift();
    const sequence = phrases;
    const aliases = storage.getAliases();
    const commandKeys = Object.keys(commands);

    if (aliasName && sequence && commandKeys.indexOf(aliasName) === -1) {
      aliases[aliasName] = sequence;
      storage.setAliases(aliases);
    } else if (commandKeys.indexOf(aliasName) > -1) {
      messenger.queueMessage({
        text: [`${aliasName} is a built-in command. You may not override built-in commands`],
        text_se: [`${aliasName} är ett inbyggt kommando. Inbyggda kommandon kan inte ersättas`],
      });
    } else {
      messenger.queueMessage({
        text: [
          'You have to input a name and sequence',
          'Example: alias goodalias msg hello',
        ],
        text_se: [
          'Ni måste skriva in ett namn och sekvens',
          'Exempel: alias goodalias msg hello',
        ],
      });
    }
  },
  accessLevel: 13,
  category: 'basic',
  commandName: 'alias',
};

commands.radio = {
  func: (phrases = []) => {
    if (phrases.length === 0) {
      messenger.queueMessage({
        text: labels.getText('instructions', 'radio'),
      });

      return;
    }

    const channels = storage.getRadioChannels();
    const choice = phrases[0];

    switch (choice) {
      case 'on': {
        if (!phrases[1]) {
          messenger.queueMessage({
            text: labels.getText('instructions', 'radio'),
          });

          break;
        }

        const chosenChannel = phrases[1].toLowerCase();

        if (channels[chosenChannel] && channels[chosenChannel].url) {
          audio.playAudio({ path: channels[chosenChannel].url, type: 'radio' });
        } else {
          messenger.queueMessage({
            text: labels.getText('instructions', 'radio'),
          });
        }

        break;
      }
      case 'list': {
        messenger.queueMessage({ text: Object.keys(channels).map((channel) => channels[channel].name) });

        break;
      }
      case 'off': {
        audio.resetAudio('radio');

        break;
      }
      default: {
        break;
      }
    }
  },
  visibility: 0,
  accessLevel: 0,
  category: 'basic',
  commandName: 'radio',
  options: {
    on: { description: 'Turn on the radio' },
    list: { description: 'List all channels' },
    off: { description: 'Turn off the radio' },
  },
};

commands.help = {
  func: (phrases) => {
    /**
     * Returns names of all available commands for the user, based on the users access level and the commands visibility
     * @private
     * @returns {string[]} - Names of all available commands for the user
     */
    function getCommands() {
      const allCommands = [];
      // TODO Change from Object.keys for compatibility with older Android
      const keys = commandHandler.getCommands();

      for (let i = 0; i < keys.length; i++) {
        const commandName = keys[i];
        const commandAccessLevel = commandHandler.getCommandAccessLevel(commandName);
        const commandVisibility = commandHandler.getCommandVisibility(commandName);

        if (storage.getAccessLevel() >= commandAccessLevel && storage.getAccessLevel() >= commandVisibility) {
          allCommands.push(commandName);
        }
      }

      return allCommands.concat(Object.keys(storage.getAliases())).sort();
    }

    /**
     * Sends all available commands as a message to the user
     * @private
     */
    function getAll() {
      const allCommands = getCommands();

      if (storage.getUser() === null) {
        messenger.queueMessage({ text: labels.getText('info', 'useRegister') });
      }

      messenger.queueMessage({
        text: allCommands,
        linkable: true,
      });
    }

    if (undefined === phrases || phrases.length === 0) {
      messenger.queueMessage({ text: textTools.createCommandStart('help').concat(labels.getText('instructions', 'helpExtra')) });
      getAll();
    } else if (phrases.length >= 1) {
      messenger.printHelpMessage(phrases[0]);
    }
  },
  accessLevel: 1,
  category: 'basic',
  commandName: 'help',
  options: {},
};

commands.clear = {
  func: () => {
    domManipulator.clearMainFeed();
  },
  clearAfterUse: true,
  accessLevel: 13,
  category: 'basic',
  commandName: 'clear',
};

commands.settings = {
  func: (phrases = []) => {
    if (phrases.length > 1) {
      const setting = phrases[0];
      const value = phrases[1] === 'on';

      switch (setting) {
        case 'fastmode': {
          storage.setFastMode(value);

          if (value) {
            messenger.queueMessage({ text: labels.getText('info', 'fastModeOn') });
          } else {
            messenger.queueMessage({ text: labels.getText('info', 'fastModeOff') });
          }

          break;
        }
        case 'hiddencursor': {
          storage.shouldHideCursor(value);

          if (value) {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenCursorOn') });
          } else {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenCursorOff') });
          }

          break;
        }
        case 'hiddenmenu': {
          storage.shouldHideMenu(value);

          if (value) {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenMenuOn') });
          } else {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenMenuOff') });
          }

          break;
        }
        case 'hiddencmdinput': {
          storage.shouldHideCmdInput(value);

          if (value) {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenCmdInputOn') });
          } else {
            messenger.queueMessage({ text: labels.getText('info', 'hiddenCmdInputOff') });
          }

          break;
        }
        case 'thinnerview': {
          storage.shouldThinView(value);

          if (value) {
            messenger.queueMessage({ text: labels.getText('info', 'thinnerViewOn') });
          } else {
            messenger.queueMessage({ text: labels.getText('info', 'thinnerViewOff') });
          }

          break;
        }
        default: {
          messenger.queueMessage({ text: labels.getText('errors', 'invalidSetting') });

          break;
        }
      }
    } else {
      messenger.queueMessage({ text: labels.getText('errors', 'settingUsage') });
    }
  },
  accessLevel: 1,
  visibility: 13,
  category: 'admin',
  commandName: 'settings',
};

module.exports = commands;
