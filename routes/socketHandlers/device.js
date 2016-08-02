'use strict';

const dbDevice = require('../../db/connectors/device');
const manager = require('../../socketHelpers/manager');
const messenger = require('../../socketHelpers/messenger');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');
const objectValidator = require('../../utils/objectValidator');
const appConfig = require('../../config/defaults/config').app;

function handle(socket) {
  /**
   * Returns all devices from database, if the user has high enough access level
   * Emits list
   */
  socket.on('listDevices', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      } else if (user.accessLevel < 11) {
        logger.sendSocketErrorMsg({
          socket,
          code: logger.ErrorCodes.unauth,
          text: ['You are not allowed to list devices'],
          text_se: ['Ni har inte tillåtelse att lista enheter'],
        });

        return;
      }

      dbDevice.getAllDevices((devErr, devices) => {
        if (devErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get all devices'],
            err: devErr,
          });

          return;
        }

        const allDevices = devices.map(device => {
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

        if (allDevices.length > 0) {
          messenger.sendList({
            socket,
            itemList: {
              listTitle: 'Devices',
              itemList: allDevices,
            },
          });
        }
      });
    });
  });

  socket.on('updateDeviceLastAlive', (params) => {
    if (!objectValidator.isValidData(params, { device: { deviceId: true, lastAlive: true } })) {
      return;
    }

    dbDevice.updateDeviceLastAlive(params.device.deviceId, params.device.lastAlive, (err) => {
      if (err) {
        return;
      }
    });
  });

  /**
   * Updates a field on a device in the database
   */
  socket.on('updateDevice', (params) => {
    if (!objectValidator.isValidData(params, { device: { deviceId: true }, field: true, value: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.updatedevice.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      const deviceId = params.device.deviceId;
      const field = params.field;
      const value = params.value;
      const callback = (err, device) => {
        if (err || device === null) {
          let errMsg = 'Failed to update device';

          if (err && err.code === 11000) {
            errMsg += '. Alias already exists';
          }

          logger.sendSocketErrorMsg({
            socket,
            text: [errMsg],
            err,
            code: logger.ErrorCodes.general,
          });

          return;
        }
      };

      switch (field) {
        case 'alias': {
          dbDevice.updateDeviceAlias(deviceId, value, callback);

          break;
        }
        default: {
          messenger.sendSelfMsg({
            socket,
            message: {
              text: [`Invalid field. Device doesn't have ${field}`],
              text_se: [`Inkorrekt fält. Enheter har inte fältet ${field}`],
            },
          });

          break;
        }
      }
    });
  });

  /**
   * Checks if the device is in the database
   * Emits commandFail or commandSuccess if the device was found
   */
  socket.on('verifyDevice', (params) => {
    // TODO Check if either device.alias or device.deviceId is set
    if (!objectValidator.isValidData(params, { device: { deviceId: true } })) {
      return;
    }

    dbDevice.getDevice(params.device.deviceId, (err, device) => {
      if (err || device === null) {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Device is not in the database'],
            text_se: ['Enheten finns inte i databasen'],
          },
        });
        socket.emit('commandFail');

        return;
      }

      messenger.sendSelfMsg({
        socket,
        message: {
          text: ['Device found in the database'],
          text_se: ['Enheten funnen i databasen'],
        },
      });
      socket.emit('commandSuccess', params);
    });
  });

  /**
   * Updates socketID and user name on a device in the database
   */
  socket.on('updateDeviceSocketId', (data) => {
    if (!objectValidator.isValidData(data, { user: { userName: true }, device: { deviceId: true } })) {
      return;
    }

    const deviceId = data.device.deviceId;
    const userName = data.user.userName;

    socket.join(deviceId + appConfig.deviceAppend);

    dbDevice.updateDeviceSocketId(deviceId, socket.id, userName, (err, device) => {
      if (err || device === null) {
        return;
      }
    });
  });
}

exports.handle = handle;
