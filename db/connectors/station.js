'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const databaseConnector = require('../databaseConnector');

const stationSchema = new mongoose.Schema({
  stationId: { type: Number, unique: true },
  stationName: String,
  signalValue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  owner: String,
}, { collection: 'stations' });

const Station = mongoose.model('Station', stationSchema);

function updateSignalValue(stationId, signalValue, callback) {
  const query = { stationId };
  const update = { $set: { signalValue } };

  Station.findOneAndUpdate(query, update).lean().exec((err, station) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to set signal value on station ${stationId}`],
        err,
      });
    }

    callback(err, station);
  });
}

function getStation(stationId, callback) {
  const query = { stationId };
  const filter = { _id: 0 };

  Station.findOne(query, filter).lean().exec((err, foundStation) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to find station'],
        err,
      });
    }

    callback(err, foundStation);
  });
}

function getAllStations(callback) {
  const query = {};
  const sort = { stationName: 1 };
  const filter = { _id: 0 };

  Station.find(query, filter).sort(sort).lean().exec((err, stations) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get stations'],
        err,
      });
    }

    callback(err, stations);
  });
}

function createStation(station, callback) {
  const newStation = new Station(station);

  getStation(station.stationId, (err, foundStation) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if user exists'],
        err,
      });
    } else if (foundStation === null) {
      databaseConnector.saveObject(newStation, 'station', callback);
    } else {
      callback(err, null);
    }
  });
}

function updateIsActive(stationId, isActive, callback) {
  const query = { stationId };
  const update = { $set: { isActive } };

  Station.findOneAndUpdate(query, update).lean().exec((err, station) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to set active on station ${stationId}`],
        err,
      });
    }

    callback(err, station);
  });
}

exports.updateSignalValue = updateSignalValue;
exports.getStation = getStation;
exports.getAllStations = getAllStations;
exports.createStation = createStation;
exports.updateIsActive = updateIsActive;
