'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const messenger = require('../../messenger');
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../../logger');

function handle(socket) {
  socket.on('getCommands', function() {
    dbConnector.getAllCommands(function(err, commands) {
      if (err || commands === null || commands.length === 0) {
        messenger.sendImportantMsg({
          message: {
            text: [
              'Failure to retrieve commands',
              'Please try rebooting with the command "reboot"',
            ],
            text_se: [
              'Lyckades inte hämta kommandon',
              'Försök att starta om med kommandot "reboot"',
            ],
          },
          socket: socket,
        });

        return;
      }

      socket.emit('updateCommands', { commands: commands });
    });
  });

  socket.on('updateCommand', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.updatecommand.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const commandName = data.command.commandName;
      const field = data.field;
      const value = data.value;
      const callback = function(err, command) {
        if (err || command === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to update command'],
            text_se: ['Misslyckades med att uppdatera kommandot'],
          });
        } else {
          messenger.sendSelfMsg({
            message: {
              text: ['Command has been updated'],
              text_se: ['Kommandot har uppdaterats'],
            },
            socket: socket,
          });
          socket.emit('updateCommands', { commands: [command] });
          socket.broadcast.emit('updateCommands', { commands: [command] });
        }
      };
      switch (field) {
      case 'visibility':
        dbConnector.updateCommandVisibility(commandName, value, callback);

        break;
      case 'accesslevel':
        dbConnector.updateCommandAccessLevel(commandName, value, callback);

        break;
      default:
        logger.sendSocketErrorMsg({
          socket: socket,
          code: logger.ErrorCodes.notFound,
          text: ['Invalid field. Command doesn\'t have ' + field],
          text_se: ['Ej giltigt fält. Kommandon har inte fältet ' + field],
        });

        break;
      }
    });
  });
}

exports.handle = handle;
