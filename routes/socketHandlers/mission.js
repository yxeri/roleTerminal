'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');

function handle(socket) {
  /**
   * Returns all missions
   * Emits missions
   */
  socket.on('getAllMissions', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.jobs.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getAllMissions((err, missions) => {
        if (err || missions === null) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get all missions'],
            text_se: ['Misslyckades med att hämta alla uppdrag'],
            err,
          });

          return;
        }

        socket.emit('missions', missions);
      });
    });
  });

  /**
   * Returns all active (not yet completed) missions
   * Emits missions
   */
  socket.on('getActiveMissions', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.jobs.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getActiveMissions((err, missions) => {
        if (err || missions === null) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get active missions'],
            text_se: ['Misslyckades med att hämta alla aktiva uppdrag'],
            err,
          });

          return;
        }

        socket.emit('missions', missions);
      });
    });
  });
}

exports.handle = handle;
