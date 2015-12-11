'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const messenger = require('../../messenger');
const dbDefaults = require('../../config/dbPopDefaults');
const logger = require('../../logger');

function handle(socket) {
  socket.on('getCommands', function() {
    dbConnector.getAllCommands(function(err, commands) {
      if (err || commands === null || commands.length === 0) {
        messenger.sendImportantMsg({
          message: {
            text: [
              'Failure to retrieve commands',
              'Please try rebooting with "reboot"',
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
    manager.userAllowedCommand(socket.id, dbDefaults.commands.updatecommand.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const commandName = data.command.commandName;
      const field = data.field;
      const value = data.value;
      const callback = function(err, command) {
        if (err || command === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to update command');
        } else {
          messenger.sendSelfMsg({
            message: {
              text: ['Command has been updated'],
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
        logger.sendSocketErrorMsg(socket, logger.ErrorCodes.notFound, 'Invalid field. Command doesn\'t have ' + field);

        break;
      }
    });
  });
}

exports.handle = handle;
