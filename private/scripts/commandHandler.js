const storage = require('./storage');
const messenger = require('./messenger');
const labels = require('./labels');
const domManipulator = require('./domManipulator');
const socketHandler = require('./socketHandler');

const commandCollections = [
  // require('./bbr'),
  require('./admin'),
  require('./chat'),
  require('./info'),
  require('./local'),
  require('./map'),
  require('./satellite'),
  require('./team'),
  require('./user'),
  require('./utility'),
];

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
 * @type {string[]}
 */
const commandChars = ['-', '/'];
const commands = {};

function resetCommand(aborted) {
  const room = storage.getStaticInputStart() ? storage.getDefaultInputStart() : (storage.getRoom() || storage.getDefaultInputStart());
  commandHelper.command = null;
  commandHelper.onStep = 0;
  commandHelper.maxSteps = 0;
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

function trimCommandChar(command) {
  let cmdName = command;

  if (commandChars.indexOf(cmdName[0]) > -1) {
    cmdName = cmdName.slice(1);
  }

  return cmdName;
}

function collectCommands() {
  for (const cmdCollection of commandCollections) {
    for (const command of Object.keys(cmdCollection)) {
      if (!commands[command]) {
        commands[command] = cmdCollection[command];
      } else {
        // console.log(`Command ${command} already exists in a collection outside ${cmdCollection}`);
      }
    }
  }
}

/**
 * @param {Object} params
 * @param {string} params.cmd - Name of the command to be triggered
 * @param {string[]} params.cmdParams - Command parameters sent to the commands
 */
function triggerCommand(params) {
  const cmdParams = params.cmdParams;
  const command = trimCommandChar(params.cmd);

  if (commands[command]) {
    commands[command].func(cmdParams);
  }
}

function getCommandHelper() {
  return commandHelper;
}

function getCommandAccessLevel(command) {
  return commands[command] ? commands[command].accessLevel : 1;
}

function getCommandVisibility(command) {
  return commands[command] ? commands[command].visibility : 1;
}

function getCommandChars() {
  return commandChars;
}

function isCommandChar(char) {
  return commandChars.indexOf(char) >= 0;
}

function getCommands() {
  return Object.keys(commands);
}

/**
 * @param {string} command
 */
function getCommand(command) {
  const cmdName = trimCommandChar(command);

  return commands[cmdName];
}

function abortCommand(command) {
  if (commands[command] && commands[command].abortFunc) {
    commands[command].abortFunc();
  }
}

function triggerCommandStep(cmdParams) {
  commands[commandHelper.command].steps[commandHelper.onStep](cmdParams, socketHandler.getSocket());
}

function updateCommand(command) {
  const existingCommand = commands[command.commandName];

  if (existingCommand) {
    existingCommand.accessLevel = command.accessLevel;
    existingCommand.category = command.category;
    existingCommand.visibility = command.visibility;
    existingCommand.authGroup = command.authGroup;
  }
}

collectCommands();

exports.triggerCommand = triggerCommand;
exports.getCommandHelper = getCommandHelper;
exports.resetCommand = resetCommand;
exports.getCommandAccessLevel = getCommandAccessLevel;
exports.getCommandVisibility = getCommandVisibility;
exports.getCommandChars = getCommandChars;
exports.isCommandChar = isCommandChar;
exports.getCommands = getCommands;
exports.abortCommand = abortCommand;
exports.triggerCommandStep = triggerCommandStep;
exports.getCommand = getCommand;
exports.updateCommand = updateCommand;
