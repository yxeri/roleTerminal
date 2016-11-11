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

const storage = require('./storage');
const messenger = require('./messenger');
const labels = require('./labels');
const domManipulator = require('./domManipulator');
const socketHandler = require('./socketHandler');

/* eslint-disable global-require */
/**
 * @private
 * @type {Object[]}
 */
const commandCollections = [
  require('./cmdsChat'),
  require('./cmdsInfo'),
  require('./cmdsLocal'),
  require('./cmdsMap'),
  // require('./cmdsSatellite'),
  require('./cmdsTeam'),
  require('./cmdsUser'),
  require('./cmdsUtility'),
  require('./cmdsBbr'),
];
/* eslint-enable global-require */
/**
 * @private
 * @type {Object}
 */
const commandHelper = {
  maxSteps: 0,
  onStep: 0,
  command: null,
  keysBlocked: false,
  data: null,
  hideInput: false,
};
/**
 * Char that is prepended on commands in chat mode
 * @private
 * @type {string[]}
 */
const commandChars = ['-', '/'];
/**
 * @private
 * @type {Object}
 */
const commands = {};

/**
 * Resets commandHelper and everything else changed when a command with multipe steps has been used
 * @param {boolean} [aborted] - Has command be prematurely aborted?
 */
function resetCommand(aborted) {
  const room = storage.getStaticInputStart() ? storage.getDefaultInputStart() : (storage.getRoom() || storage.getDefaultInputStart());
  commandHelper.command = null;
  commandHelper.onStep = 0;
  commandHelper.maxSteps = 0;
  commandHelper.fallbackStep = 0;
  commandHelper.keysBlocked = false;
  commandHelper.data = null;
  commandHelper.hideInput = false;
  commandHelper.allowAutoComplete = false;

  if (aborted) {
    messenger.queueMessage({ text: labels.getText('errors', 'aborted') });
  }

  domManipulator.setInputStart(room);
  domManipulator.hideInput(false);
}

/**
 * Removes command character, if any, from the beginning of the string
 * @param {string} command - Command input from user
 * @returns {string} - Command without the command character
 */
function trimCommandChar(command) {
  let cmdName = command;

  if (commandChars.indexOf(cmdName[0]) > -1) {
    cmdName = cmdName.slice(1);
  }

  return cmdName;
}

/**
 * Add all commands to one collection
 */
function collectCommands() {
  for (let i = 0; i < commandCollections.length; i += 1) {
    const cmdCollection = commandCollections[i];
    const cmdKeys = Object.keys(cmdCollection);

    for (let j = 0; j < cmdKeys.length; j += 1) {
      const command = cmdKeys[j];

      if (!commands[command]) {
        commands[command] = cmdCollection[command];
      }
    }
  }
}

/**
 * Run command
 * @param {Object} params - Parameters
 * @param {string} params.cmd - Name of the command to be triggered
 * @param {string[]} [params.cmdParams] - Command parameters sent to the commands
 */
function triggerCommand(params) {
  const cmdParams = params.cmdParams;
  const command = trimCommandChar(params.cmd);

  if (commands[command]) {
    if (commands[command].steps) {
      commandHelper.command = commands[command].commandName;
      commandHelper.maxSteps = commands[command].steps.length;
    }

    commands[command].func(cmdParams);
  }
}

/**
 * Get access level from command
 * @param {string} command - Name of command
 * @returns {Number} - Access level
 */
function getCommandAccessLevel(command) {
  return commands[command] ? commands[command].accessLevel : 1;
}

/**
 * Get visibility from command
 * @param {string} command - Name of command
 * @returns {Number} - Visibility
 */
function getCommandVisibility(command) {
  return commands[command] ? commands[command].visibility : 1;
}

/**
 * Get category from command
 * @param {string} command - Name of command
 * @returns {string} - Category
 */
function getCommandCategory(command) {
  return commands[command] ? commands[command].category : '';
}

/**
 * Get valid command characters
 * @returns {string[]} - Valid command characters
 */
function getCommandChars() {
  return commandChars;
}

/**
 * Is the char a command character?
 * @param {string} char - Character to check
 * @returns {boolean} - Is the char a command character?
 */
function isCommandChar(char) {
  return commandChars.indexOf(char) >= 0;
}

/**
 * Get the names of all commands
 * @param {Object} [params] - Parameters
 * @param {boolean} [params.aliases] - Should aliases be included with the returned commands?
 * @param {boolean} [params.filtered] - Should returned commands be filtered based on user's access level?
 * @param {boolean} [params.extras] - Should returned commands contain extra category commands?
 * @returns {string[]} - Names of all commands
 */
function getCommands(params) {
  const keys = Object.keys(commands);
  let allCommands;

  if (params.filtered) {
    allCommands = [];

    for (let i = 0; i < keys.length; i += 1) {
      const commandName = keys[i];
      const commandAccessLevel = getCommandAccessLevel(commandName);
      const commandVisibility = getCommandVisibility(commandName);
      const commandCategory = getCommandCategory(commandName);
      const userAccessLevel = storage.getAccessLevel();

      if (userAccessLevel >= commandAccessLevel && userAccessLevel >= commandVisibility && (userAccessLevel === 0 || commandCategory !== 'login') && (params.extras || commandCategory !== 'extra')) {
        allCommands.push(commandName);
      }
    }
  } else {
    allCommands = keys;
  }

  if (params.aliases) {
    allCommands = allCommands.concat(Object.keys(storage.getAliases()));
  }

  return allCommands.sort();
}

/**
 * Get a command
 * @param {string} command - Name of the command
 * @returns {Object} - Command object
 */
function getCommand(command) {
  const cmdName = trimCommandChar(command);

  return commands[cmdName];
}

/**
 * Call abort function on command
 * @param {string} command - Name of command
 */
function abortCommand(command) {
  if (commands[command] && commands[command].abortFunc) {
    commands[command].abortFunc();
  }
}

/**
 * Run function in command steps
 * @param {string[]} [cmdParams] - Parameters for the function in command steps
 */
function triggerCommandStep(cmdParams) {
  commands[commandHelper.command].steps[commandHelper.onStep](cmdParams, socketHandler.getSocket());
}

/**
 * Update command properties. Most likely triggered by emit from server
 * @param {Object} command - Command
 * @param {Number} command.accessLevel - Required access level to run command
 * @param {string} command.category - Grouping category
 * @param {Number} command.visibility - Required access level to see the command
 * @param {string} command.authGroup - Name of group authorised to use the command
 * @param {string} command.commandName - Name of the command
 */
function updateCommand(command) {
  const existingCommand = commands[command.commandName];

  if (existingCommand) {
    existingCommand.accessLevel = command.accessLevel;
    existingCommand.category = command.category;
    existingCommand.visibility = command.visibility;
    existingCommand.authGroup = command.authGroup;
    existingCommand.commandName = command.commandName;
  }
}

/**
 * Generated command options
 * Triggered by commandHandler
 */
function addSpecialHelpOptions() {
  const filteredCommands = getCommands({ filtered: true, aliases: false });

  for (let i = 0; i < filteredCommands.length; i += 1) {
    const command = filteredCommands[i];

    commands.help.options[command] = { description: command };
  }
}

/**
 * Generated command options.
 * Triggered by emitted mapPositions
 * @param {string} positionName - Name of a position on the map
 * @param {string} type - Type of position (user or location)
 * @param {string} markerId - ID of the marker
 */
function addSpecialMapOption(positionName, type, markerId) {
  if (type === 'user') {
    commands.map.options.locate.next[positionName] = { description: `User: ${positionName}` };
  } else if (type === 'location') {
    commands.map.options.info.next[`[${markerId}] ${positionName}`] = { description: `Location: ${positionName}` };
  }
}

collectCommands();

exports.triggerCommand = triggerCommand;
exports.resetCommand = resetCommand;
exports.getCommandAccessLevel = getCommandAccessLevel;
exports.getCommandVisibility = getCommandVisibility;
exports.getCommandCategory = getCommandCategory;
exports.getCommandChars = getCommandChars;
exports.isCommandChar = isCommandChar;
exports.getCommands = getCommands;
exports.abortCommand = abortCommand;
exports.triggerCommandStep = triggerCommandStep;
exports.getCommand = getCommand;
exports.updateCommand = updateCommand;
exports.commandHelper = commandHelper;
exports.addSpecialMapOption = addSpecialMapOption;
exports.addSpecialHelpOptions = addSpecialHelpOptions;
