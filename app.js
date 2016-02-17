'use strict';

const express = require('express');
const socketIo = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const minifier = require('./minifier');
const appConfig = require('rolehaven-config').app;
const logger = require('./logger');
const app = express();
let appSpecific;

/**
 * Watches for files changes in the private directory and adds new changes to public. Used in dev mode
 * Note! fs.watch is unstable. Recursive might only work in OS X
 *
 * @returns {undefined} Returns undefined
 */
function watchPrivate() {
  // fs.watch is unstable. Recursive only works in OS X.
  fs.watch(appConfig.privateBase, { persistant: true, recursive: true }, function(triggeredEvent, filePath) {
    const fullPath = path.join(appConfig.privateBase, filePath);

    if ((triggeredEvent === 'rename' || triggeredEvent === 'change') && path.extname(fullPath) !== '.tmp' && fullPath.indexOf('___') < 0 && fullPath.indexOf('-transpile') < 0) {
      fs.readFile(fullPath, function(err) {
        if (err) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'fs.watch error. Automatic update of changed files disabled');

          return;
        }

        minifier.minifyFile(fullPath, path.join(appConfig.publicBase, filePath));
        logger.sendInfoMsg('Event: ' + triggeredEvent + '. File: ' + fullPath);
      });
    }
  });
}

try {
  /*
   * appSpecific.js contains code that is specific for the current app.
   * Add whatever you need in there that should not be part of the base server.
   */
  appSpecific = require('./appSpecific');
} catch (e) {
  logger.sendErrorMsg(logger.ErrorCodes.general, 'appSpecific.js is missing. Check the documentation (code or standalone) for more information');
  throw e;
}

app.io = socketIo();

// view engine setup
app.set('views', path.join(__dirname, appConfig.publicBase, appConfig.viewsPath));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(compression());

// Logging
app.use(morgan(appConfig.logLevel));

// Serve files from public path
app.use(express.static(path.join(__dirname, appConfig.publicBase)));

/*
 * Add all request paths and corresponding file paths to Express
 */
for (let i = 0; i < appConfig.routes.length; i++) {
  const route = appConfig.routes[i];

  app.use(route.sitePath, require(path.resolve(route.filePath))(app.io));
}

if (appConfig.watchDir === true) {
  watchPrivate();
}

appSpecific();

module.exports = app;
