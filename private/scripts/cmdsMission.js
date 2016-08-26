/** @module */

// const storage = require('./storage');
// const labels = require('./labels');
// const socketHandler = require('./socketHandler');
// const textTools = require('./textTools');
// const messenger = require('./messenger');
// const commandHandler = require('./commandHandler');
// const domManipulator = require('./domManipulator');

const commands = {};

commands.createmission = {
  func: () => {

  },
  steps: [],
  accessLevel: 1,
  visibility: 13,
  category: 'basic',
  commandName: 'createmission',
};

commands.mission = {
  func: () => {

  },
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'mission',
  options: {
    complete: { description: 'Mark a misison as done. You can only mark missions that you have created as done' },
    list: { description: 'Show all active missions', next: {
      all: { description: 'Show all missions, including completed ones' },
    } },
  },
};

module.exports = commands;
