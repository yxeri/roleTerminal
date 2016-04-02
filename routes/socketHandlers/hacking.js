'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../../logger');
const objectValidator = require('../../objectValidator');

function handle(socket) {
  /**
   * Checks if a room is hackable (user needs to have high enough access level versus the rooms visibility)
   * Emits commandFail or commandSuccess if the user's access level is higher than the room's visibility
   */
  socket.on('roomHackable', function(data) {
    if (!objectValidator.isValidData(data, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.hackroom.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !user) {
        logger.sendSocketErrorMsg({
          socket: socket,
          code: logger.ErrorCodes.general,
          text: ['Unable to hack the room. Something is broken'],
          text_se: ['Kunde inte hacka rummet. Något är trasigt'],
        });

        return;
      }

      const roomName = data.room.roomName.toLowerCase();

      dbConnector.getRoom(roomName, function(err, room) {
        if (err || room === null || user.accessLevel < room.visibility) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Room is not hackable by you or doesn\'t exist'],
            text_se: ['Rummet kan inte hackas av dig eller existerar inte'],
            err: err,
          });
          socket.emit('commandFail');

          return;
        }

        socket.emit('commandSuccess');
      });
    });
  });

  /**
   * Joins room to user's socket
   * Emits follow
   */
  socket.on('hackRoom', function(data) {
    if (!objectValidator.isValidData(data, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.hackroom.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !user) {
        return;
      }

      const roomName = data.room.roomName.toLowerCase();

      dbConnector.addRoomToUser(user.userName, roomName, function(err) {
        if (err) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to follow the room'],
            text_se: ['Misslyckades med att följa rummet'],
            err: err,
          });

          return;
        }

        const room = { roomName: roomName };

        socket.join(roomName);
        socket.emit('follow', { room: room });
      });
    });
  });
}

exports.handle = handle;
