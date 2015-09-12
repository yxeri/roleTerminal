'use strict';

const config = {};

// Relative to Node application dir
config.publicBase = 'public';
config.privateBase = 'private';

// Will be appended to the public/private base path
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

config.mode = process.env.MODE || 'prod';

module.exports = config;