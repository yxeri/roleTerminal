'use strict';

const config = {};

config.routes = [
  {
    sitePath : '/',
    filePath : './routes/index'
  }, {
    sitePath : '*',
    filePath : './routes/error'
  }
];

module.exports = config;