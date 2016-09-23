'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const databaseConnector = require('../databaseConnector');

const stationSchema = new mongoose.Schema({
  stationId: { type: Number, unique: true },
  stationName: String,
  signalValue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
}, { collection: 'stations' });

const Station = mongoose.model('Station', stationSchema);

/**
 * Update signal value on station
 * @param {number} stationId - Station ID
 * @param {number} signalValue - New signal value
 * @param {Function} callback - Callback
 */
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

/**
 * Get station
 * @param {number} stationId - Station ID
 * @param {Function} callback - Callback
 */
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

/**
 * Get all stations. Sorted on station ID
 * @param {Function} callback - Callback
 */
function getAllStations(callback) {
  const query = {};
  const sort = { stationId: 1 };
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

/**
 * Create and save station
 * @param {Object} station - New station
 * @param {Function} callback - Callback
 */
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

/**
 * Set new isActive on station
 * @param {number} stationId - ID of station
 * @param {boolean} isActive - Is the station active?
 * @param {Function} callback - Callback
 */
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

/**
 * Get active stations
 * @param {Function} callback - Callback
 */
function getActiveStations(callback) {
  const query = { isActive: true };
  const sort = { stationId: 1 };
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

exports.updateSignalValue = updateSignalValue;
exports.getStation = getStation;
exports.getAllStations = getAllStations;
exports.createStation = createStation;
exports.updateIsActive = updateIsActive;
exports.getActiveStations = getActiveStations;
