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
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get all missions'],
            text_se: ['Misslyckades med att hämta alla uppdrag'],
            err: err,
          });

          return;
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
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get active missions'],
            text_se: ['Misslyckades med att hämta alla aktiva uppdrag'],
            err: err,
          });

          return;
        }

        socket.emit('missions', missions);
      });
    });
  });
}

exports.handle = handle;
