'use strict';

const config = {};

config.routes = [
  {
    sitePath : '/',
    filePath : './routes/index.js'
  }, {
    sitePath : '*',
    filePath : './routes/error.js'
  }
];
/*
 * Array of route paths
 * Should contain objects of site and file paths
 * sitePath : REQUESTPATH
 * filePath : ROUTEFILE
 *
 * Example:
 * {
 *   sitePath : '*',
 *   filePath : './routes/index.js'
 * }
 */

module.exports = config;
