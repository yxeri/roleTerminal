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
        socketHandler.emit('listRooms', ({ error, data: { rooms } }) => {
          if (error) {
            return;
          }

          if (rooms.length > 0) {
            messenger.queueMessage({
              text: [rooms.join(' - ')],
            });
          } else {
            messenger.queueMessage({
              text: ['There are no available rooms'],
            });
          }
        });
      } else if (listOption === 'users') {
        socketHandler.emit('listUsers', ({ error, data: { offlineUsers, onlineUsers } }) => {
          if (error) {
            return;
          }

          if (onlineUsers.length > 0) {
            messenger.queueMessage({
              text: [
                'Online users: ',
                onlineUsers.join(' - '),
              ],
            });
          }

          if (offlineUsers.length > 0) {
            messenger.queueMessage({
              text: [
                'Other users: ',
                offlineUsers.join(' - '),
              ],
            });
          }
        });
      } else if (listOption === 'devices') {
        socketHandler.emit('listDevices', '', ({ error, data: { devices } }) => {
          if (error) {
            return;
          }

          const allDevices = devices.map((device) => {
            let deviceString = '';

            deviceString += `DeviceID: ${device.deviceId}${'\t'}`;

            if (device.deviceAlias && device.deviceAlias !== null && device.deviceAlias !== device.deviceId) {
              deviceString += `Alias: ${device.deviceAlias}${'\t'}`;
            }

            if (device.lastUser && device.lastUser !== null) {
              deviceString += `Last user: ${device.lastUser}${'\t'}`;
            }

            if (device.lastAlive && device.lastAlive !== null) {
              deviceString += `Last alive: ${device.lastAlive}`;
            }

            return deviceString;
          });

          messenger.queueMessage({ text: [allDevices] });
        });
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
