'use strict';

const dbConnector = require('./databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;

/**
 * Gets called from app.js. Triggers the app specific code
 *
 * @returns {undefined} Returns undefined
 */
function run() {
  dbConnector.populateDbUsers(databasePopulation.users);
  dbConnector.populateDbRooms(databasePopulation.rooms, databasePopulation.users.superuser);
  dbConnector.populateDbCommands(databasePopulation.commands);
}

module.exports = run;
