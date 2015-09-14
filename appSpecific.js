'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');

/**
 * Gets called from app.js. Triggers the app specific code
 *
 * @returns {undefined} Returns undefined
 */
function run() {
  dbConnector.populateDbUsers(dbDefaults.users);
  dbConnector.populateDbRooms(dbDefaults.rooms, dbDefaults.users.superuser);
  dbConnector.populateDbCommands(dbDefaults.commands);
}

module.exports = run;
