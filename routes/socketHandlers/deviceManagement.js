'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const messenger = require('../../messenger');
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../../logger');

function handle(socket) {
  // TODO Sub-command?
  socket.on('listDevices', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      } else if (user.accessLevel < 11) {
        logger.sendSocketErrorMsg({
          socket: socket,
          code: logger.ErrorCodes.unauth,
          text: ['You are not allowed to list devices'],
          text_se: ['Ni har inte tillåtelse att lista enheter'],
        });

        return;
      }

      dbConnector.getAllDevices(function(devErr, devices) {
        if (devErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get all devices'],
            err: devErr,
          });

          return;
        }

        // TODO Send objects through list?

        const allDevices = [];

        if (devices.length > 0) {
          for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            let deviceString = '';

            deviceString += 'DeviceID: ' + device.deviceId + '\t';

            if (device.deviceAlias && device.deviceAlias !== null && device.deviceAlias !== device.deviceId) {
              deviceString += 'Alias: ' + device.deviceAlias + '\t';
            }

            if (device.lastUser && device.lastUser !== null) {
              deviceString += 'Last user: ' + device.lastUser;
            }

            allDevices.push(deviceString);
          }

          messenger.sendList({
            socket: socket,
            itemList: {
              listTitle: 'Devices',
              itemList: allDevices,
            },
          });
        }
      });
    });
  });

  socket.on('updateDevice', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.updatedevice.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const deviceId = data.device.deviceId;
      const field = data.field;
      const value = data.value;
      const callback = function(err, device) {
        if (err || device === null) {
          let errMsg = 'Failed to update device';

          if (err && err.code === 11000) {
            errMsg += '. Alias already exists';
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: [errMsg],
            },
          });
          console.log(errMsg, err);

          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Device has been updated'],
            text_se: ['Enheten har uppdaterats'],
          },
        });
      };

      switch (field) {
      case 'alias':
        dbConnector.updateDeviceAlias(deviceId, value, callback);

        break;
      default:
        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Invalid field. Device doesn\'t have ' + field],
            text_se: ['Inkorrekt fält. Enheter har inte fältet ' + field],
          },
        });

        break;
      }
    });
  });

  socket.on('verifyDevice', function(data) {
    dbConnector.getDevice(data.device, function(err, device) {
      if (err || device === null) {
        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Device is not in the database'],
            text_se: ['Enheten finns inte i databasen'],
          },
        });
        socket.emit('commandFail');

        return;
      }

      messenger.sendSelfMsg({
        socket: socket,
        message: {
          text: ['Device found in the database'],
          text_se: ['Enheten funnen i databasen'],
        },
      });
      socket.emit('commandSuccess', data);
    });
  });
}

exports.handle = handle;
