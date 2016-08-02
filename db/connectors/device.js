'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const databaseConnector = require('../databaseConnector');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, unique: true },
  socketId: String,
  deviceAlias: { type: String, unique: true },
  lastUser: String,
  lastAlive: Date,
}, { collection: 'devices' });

const Device = mongoose.model('Device', deviceSchema);

function updateDeviceSocketId(deviceId, socketId, user, callback) {
  const query = { deviceId };
  const update = {
    $set: {
      socketId,
      lastUser: user,
    },
  };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    (err, device) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device socket Id'],
          err,
        });
        callback(err, null);
      } else if (device === null) {
        const newDevice = new Device({
          deviceId,
          socketId,
          lastUser: user,
          deviceAlias: deviceId,
        });

        databaseConnector.saveObject(newDevice, 'device', callback);
      } else {
        callback(err, device);
      }
    }
  );
}

function updateDeviceLastAlive(deviceId, value, callback) {
  const query = { deviceId };
  const update = { $set: { lastAlive: value } };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    (err, device) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device Id'],
          err,
        });
      }

      callback(err, device);
    }
  );
}

function updateDeviceAlias(deviceId, value, callback) {
  const query = { deviceId };
  const update = { $set: { deviceAlias: value } };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    (err, device) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device Id'],
          err,
        });
      }

      callback(err, device);
    }
  );
}

function getDevice(deviceCode, callback) {
  const query = { $or: [{ deviceId: deviceCode }, { deviceAlias: deviceCode }] };

  Device.findOne(query).lean().exec((err, device) => {
    if (err || device === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get device'],
        err,
      });
    }

    callback(err, device);
  });
}

function getAllDevices(callback) {
  const query = {};
  const filter = { _id: 0 };

  Device.find(query, filter).lean().exec((err, devices) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all devices'],
        err,
      });
    }

    callback(err, devices);
  });
}

exports.updateDeviceAlias = updateDeviceAlias;
exports.updateDeviceSocketId = updateDeviceSocketId;
exports.getDevice = getDevice;
exports.getAllDevices = getAllDevices;
exports.updateDeviceLastAlive = updateDeviceLastAlive;
