/** @module */

const socketHandler = require('./socketHandler');
const messenger = require('./messenger');

const commands = {};

commands.list = {
  func: (phrases = []) => {
    if (phrases.length > 0) {
      const listOption = phrases[0].toLowerCase();

      if (listOption === 'rooms') {
        socketHandler.emit('listRooms');
      } else if (listOption === 'users') {
        socketHandler.emit('listUsers');
      } else if (listOption === 'devices') {
        socketHandler.emit('listDevices');
      } else {
        messenger.queueMessage({
          text: [`${listOption} is not a valid type`],
          text_se: [`${listOption} är inte en giltig typ`],
        });
      }
    } else {
      messenger.queueMessage({
        text: [
          'You have to input which type you want to list',
          'Available types: users, rooms, devices',
          'Example: list rooms',
        ],
        text_se: [
          'Ni måste skriva in vilken typ ni vill lista',
          'Tillgängliga typer: users, rooms, devices',
          'Exempel: list rooms',
        ],
      });
    }
  },
  autocomplete: { type: 'lists' },
  accessLevel: 13,
  category: 'basic',
  commandName: 'list',
  options: {
    users: { description: 'List users' },
    rooms: { description: 'List rooms' },
    devices: { description: 'List devices' },
  },
};

module.exports = commands;
