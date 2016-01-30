'use strict';

const config = {};

/*
 * Base directory for public and private files
 */
config.publicBase = process.env.PUBLICBASE || 'public';
config.privateBase = process.env.PRIVATEBASE || 'private';

/*
 * Sub directories for public and private files
 * Will be appended to the base directories
 */
config.paths = {
  views: process.env.VIEWSPATH || 'views',
  styles: process.env.STYLESPATH || 'styles',
  scripts: process.env.SCRIPTSPATH || 'scripts',
  required: process.env.REQUIREDPATH || 'required',
  favicon: process.env.FAVICONPATH || 'images/favicon.ico',
};

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

// TODO Move to paths
/*
 * Retrieve socket.io from local server or cdn
 * Note! Android 2.2 fails when using cdn
 */
config.socketPath = process.env.SOCKETPATH === 'cdn' ?
                    'https://cdn.socket.io/socket.io-1.4.5.js' : (process.env.SOCKETPATH || '/scripts/socket.io-1.4.5.js');

/*
 * Server mode. Options:
 * prod, dev
 */
config.mode = process.env.MODE || 'prod';

config.transpileEs6 = process.env.TRANSPILE || true;

module.exports = config;
