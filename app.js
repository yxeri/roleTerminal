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
const dbConnector = require('./databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;
const app = express();

/**
 * Watches for files changes in the private directory and adds new changes to public.
 * Used in dev mode. It should not be used in production
 * Note! fs.watch is unstable. Recursive might only work in OS X
 */
function watchPrivate() {
  fs.watch(appConfig.privateBase, { persistant: true, recursive: true }, function(triggeredEvent, filePath) {
    const fullPath = path.join(appConfig.privateBase, filePath);

    if ((triggeredEvent === 'rename' || triggeredEvent === 'change') && path.extname(fullPath) !== '.tmp' && fullPath.indexOf('___') < 0 && fullPath.indexOf('-transpile') < 0) {
      fs.readFile(fullPath, function(err) {
        if (err) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: ['fs.watch error. Automatic update of changed files disabled'],
          });

          return;
        }

        minifier.minifyFile(fullPath, path.join(appConfig.publicBase, filePath));
        logger.sendInfoMsg(`Event: ${triggeredEvent}. File: ${fullPath}`);
      });
    }
  });
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

dbConnector.populateDbUsers(databasePopulation.users);
dbConnector.populateDbRooms(databasePopulation.rooms, databasePopulation.users.superuser);
dbConnector.populateDbCommands(databasePopulation.commands);

/*
 * Catches all exceptions and keeps the server running
 */
process.on('uncaughtException', function(err) {
  console.log('Caught exception', err);
  console.log(err.stack);
});

module.exports = app;
