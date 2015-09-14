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
config.logLevel = process.env.LOGLEVEL || 'tiny';

// Database host name
config.dbHost = process.env.DBHOST || 'localhost';

// Database port
config.dbPort = process.env.DBPORT || 27017;

// Database database name
config.dbName = process.env.DBNAME;

// Node server port number
config.port = process.env.PORT || 8888;

/*
 * Server mode. Options:
 * prod, dev
 */
config.mode = process.env.MODE || 'prod';

module.exports = config;
