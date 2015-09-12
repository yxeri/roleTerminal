'use strict';

const express = require('express');
const socketIo = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const minifier = require('./minifier');
const serverConfig = require('./config/serverConfig');
const routesConfig = require('./config/routesConfig');
const logger = require('./logger');
const app = express();
let appSpecific;

try {
  /*
   * appSpecific.js contains code that is specific for the current app.
   * Add whatever you need in there that should not be part of the base server.
   */
  appSpecific = require('./appSpecific');
} catch (e) {
  console.log('appSpecific.js is missing. Check the documentation (code or standalone) for more information');
  throw e;
}

app.io = socketIo();

// view engine setup
app.set('views', path.join(__dirname, serverConfig.publicBase, serverConfig.paths.views));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(compression());
app.use(morgan(serverConfig.logLevel));
app.use(express.static(path.join(__dirname, serverConfig.publicBase)));

for (let i = 0; i < routesConfig.routes.length; i++) {
  const route = routesConfig.routes[i];

  app.use(route.sitePath, require(path.resolve(route.filePath))(app.io));
}

function watchPrivate() {
  try {
    // fs.watch is unstable. Recursive only works in OS X.
    fs.watch(serverConfig.privateBase, { persistant : true, recursive : true }, function(triggeredEvent, filePath) {
      const fullPath = path.join(serverConfig.privateBase, filePath);

      if ((triggeredEvent === 'rename' || triggeredEvent === 'change') &&
          path.extname(fullPath) !== '.tmp' && fullPath.indexOf('___') < 0) {
        fs.readFile(fullPath, function(err) {
          if (err) {
            throw err;
          }

          minifier.minifyFile(
            fullPath, path.join(serverConfig.publicBase, filePath));
          logger.sendInfoMsg('Event: ' + triggeredEvent + '. File: ' + fullPath);
        });
      }
    });
  } catch (e) {
    console.log('fs.watch error. Automatic update of changed files disabled');
  }
}

if(serverConfig.mode === 'dev') {
  watchPrivate();
}

appSpecific();

module.exports = app;
