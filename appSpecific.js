'use strict';

const app = require('./app');
const appConfig = require('./config/appConfig');

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');

function run() {
  dbConnector.populateDbUsers(dbDefaults.users);
  dbConnector.populateDbRooms(dbDefaults.rooms, dbDefaults.users.superuser);
  dbConnector.populateDbCommands(dbDefaults.commands);
}

module.exports = run;