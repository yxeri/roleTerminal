/** @module */

const textTools = require('./textTools');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.hackstation = {
  func: () => {
    const text = textTools.createMixedArray({
      amount: 24,
      length: 28,
      upperCase: false,
      codeMode: true,
      requiredStrings: ['BANANA', 'APPLE', 'GRAPE', 'magnet'],
    });

    messenger.queueMessage({ text });
  },
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'hackstation',
};

module.exports = commands;
