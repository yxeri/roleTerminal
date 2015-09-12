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

module.exports = config;