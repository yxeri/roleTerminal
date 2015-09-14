'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');

// Config with app specific configuration
const appConfig = require('./config/appConfig');

/**
 * Gets called from app.js. Triggers the app specific code
 */
function run() {
  dbConnector.populateDbUsers(dbDefaults.users);
  dbConnector.populateDbRooms(dbDefaults.rooms, dbDefaults.users.superuser);
  dbConnector.populateDbCommands(dbDefaults.commands);
}

module.exports = run;
