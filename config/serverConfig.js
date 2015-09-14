'use strict';

const config = {};

/*
 * Base directory for public and private files
 */
config.publicBase = 'public';
config.privateBase = 'private';

/*
 * Sub directories for public and private files
 * Will be appended to the base directories
 */
config.paths = {
  views : 'views',
  styles : 'styles',
  scripts : 'scripts',
  favicon : 'images/favicon.ico'
};

// Morgan log level
config.logLevel = process.env.LOGLEVEL || 'tiny'; //eslint-disable-line no-process-env

// Database host name
config.dbHost = process.env.DBHOST || 'localhost'; //eslint-disable-line no-process-env

// Database port
config.dbPort = process.env.DBPORT || 27017; //eslint-disable-line no-process-env

// Database database name
config.dbName = process.env.DBNAME; //eslint-disable-line no-process-env

// Node server port number
config.port = process.env.PORT || 8888; //eslint-disable-line no-process-env

/*
 * Server mode. Options:
 * prod, dev
 */
config.mode = process.env.MODE || 'prod'; //eslint-disable-line no-process-env

module.exports = config;
