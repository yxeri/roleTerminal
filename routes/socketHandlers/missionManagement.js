'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../../logger');

function handle(socket) {
  socket.on('getAllMissions', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.jobs.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getAllMissions(function(err, missions) {
        if (err || missions === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to get all missions', err);
        }

        socket.emit('missions', missions);
      });
    });
  });

  socket.on('getActiveMissions', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.jobs.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getActiveMissions(function(err, missions) {
        if (err || missions === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to get active missions', err);
        }
      });

      socket.emit('missions', missions);
    });
  });
}

exports.handle = handle;
