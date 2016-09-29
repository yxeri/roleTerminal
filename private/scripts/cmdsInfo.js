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

const socketHandler = require('./socketHandler');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
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
