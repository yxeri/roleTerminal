'use strict';

const appConfig = require('./appConfig');
const databasePop = require('./databasePopulation');

/**
 * Sets configuration
 * @param {Object} config - Configuration
 */
function setConfig(config) {
  require('./../modified/config').setConfig(config);
}

/**
 * Sets database defaults
 * @param {Object} databasePopulation - Database defaults
 */
function setDatabasePopulation(databasePopulation) {
  require('./../modified/databasePopulation').setDatabasePopulation(databasePopulation);
}

exports.app = appConfig;
exports.databasePopulation = databasePop;
exports.setConfig = setConfig;
exports.setDatabasePopulation = setDatabasePopulation;
