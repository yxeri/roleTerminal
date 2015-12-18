'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const messenger = require('../../messenger');
const dbDefaults = require('../../config/dbPopDefaults');
const logger = require('../../logger');

function handle(socket) {
  // TODO Sub-command?
  socket.on('listDevices', function() {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.list.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      } else if (user.accessLevel < 11) {
        logger.sendSocketErrorMsg(socket, logger.ErrorCodes.unauth, 'You are not allowed to list devices');

        return;
      }

      dbConnector.getAllDevices(function(devErr, devices) {
        if (devErr) {
          logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to get all devices', devErr);

          return;
        }

        // TODO Send objects through list?

        const allDevices = [];

        if (devices.length > 0) {
          for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            let deviceString = '';

            deviceString += 'DeviceID: ' + device.deviceId + '\t';

            if (device.deviceAlias && device.deviceAlias !== device.deviceId) {
              deviceString += 'Alias: ' + device.deviceAlias + '\t';
            }

            deviceString += 'Last user: ' + device.lastUser + '\n';
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
    manager.userAllowedCommand(socket.id, dbDefaults.commands.updatedevice.commandName, function(allowErr, allowed) {
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
          },
        });
        socket.emit('commandFail');

        return;
      }

      messenger.sendSelfMsg({
        socket: socket,
        message: {
          text: ['Device found in the database'],
        },
      });
      socket.emit('commandSuccess', data);
    });
  });
}

exports.handle = handle;
