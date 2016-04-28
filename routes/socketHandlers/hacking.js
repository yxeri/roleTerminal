'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');
const objectValidator = require('../../utils/objectValidator');

function handle(socket) {
  /**
   * Checks if a room is hackable (user needs to have high enough access level versus the rooms visibility)
   * Emits commandFail or commandSuccess if the user's access level is higher than the room's visibility
   */
  socket.on('roomHackable', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.hackroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        logger.sendSocketErrorMsg({
          socket,
          code: logger.ErrorCodes.general,
          text: ['Unable to hack the room. Something is broken'],
          text_se: ['Kunde inte hacka rummet. Något är trasigt'],
        });

        return;
      }

      const roomName = params.room.roomName.toLowerCase();

      dbConnector.getRoom(roomName, (err, room) => {
        if (err || room === null || user.accessLevel < room.visibility) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: ['Room is not hackable by you or doesn\'t exist'],
            text_se: ['Rummet kan inte hackas av dig eller existerar inte'],
            err,
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
  socket.on('hackRoom', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.hackroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      const roomName = params.room.roomName.toLowerCase();

      dbConnector.addRoomToUser(user.userName, roomName, (err) => {
        if (err) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to follow the room'],
            text_se: ['Misslyckades med att följa rummet'],
            err,
          });

          return;
        }

        const room = { roomName };

        socket.join(roomName);
        socket.emit('follow', { room });
      });
    });
  });
}

exports.handle = handle;
