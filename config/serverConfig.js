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

/* eslint-disable */

// Morgan log level
config.logLevel = process.env.LOGLEVEL || 'tiny';

// Database host name
config.dbHost = process.env.DBHOST || 'localhost';

// Database port
config.dbPort = process.env.DBPORT || 27017;

// Database database name
config.dbName = process.env.DBNAME || 'roleHaven';

// Node server port number
config.port = process.env.PORT || 8888;

/*
 * Set to true to watch for file changes in the private folder and
 * automatically minify and move the file to public.
 * Note! fs.watch is unstable and might only work in OS X
 * Recommended setting is false for production
 */
config.watchDir = process.env.WATCHDIR || false;

/*
 * Retrieve socket.io from local server or cdn
 * Note! Android 2.2 fails when using cdn
 */
config.socketPath = 'cdn' === process.env.SOCKETPATH
  ? 'https://cdn.socket.io/socket.io-1.3.5.js' : '/scripts/socket.io-1.3.5.js';

/*
 * Server mode. Options:
 * prod, dev
 */
config.mode = process.env.MODE || 'prod';

/* eslint-enable */

module.exports = config;
