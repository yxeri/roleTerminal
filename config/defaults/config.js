'use strict';

const appConfig = require('./appConfig');
const databasePop = require('./databasePopulation');

function setConfig(config) {
  require('./../modified/config').setConfig(config);
}

function setDatabasePopulation(databasePopulation) {
  require('./../modified/databasePopulation').setDatabasePopulation(databasePopulation);
}

exports.app = appConfig;
exports.databasePopulation = databasePop;
exports.setConfig = setConfig;
exports.setDatabasePopulation = setDatabasePopulation;
