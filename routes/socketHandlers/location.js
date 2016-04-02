'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../../logger');
const objectValidator = require('../../objectValidator');

/**
 * Prepares a position
 * @param position
 * @returns {}
 */
function createUserPosition(user) {
  const position = user.position;
  const timestamp = new Date(position.timestamp);
  const locObj = {};
  const coords = {};

  coords.latitude = position.latitude;
  coords.longitude = position.longitude;
  coords.heading = position.heading;
  locObj.coords = coords;
  locObj.timestamp = timestamp;
  locObj.accuracy = position.accuracy;

  return locObj;
}

function handle(socket) {
  /**
   * Locate command. Returns location for one or more users
   * Emits locationMsg
   */
  socket.on('locate', function(data) {
    if (!objectValidator.isValidData(data, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.locate.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      const locationData = {};

      // Return all user locations
      if (data.user.userName === '*') {
        dbConnector.getAllUserLocations(data.user, function(err, users) {
          if (err || users === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);

            return;
          }

          for (let i = 0; i < users.length; i++) {
            const currentUser = users[i];
            const userName = currentUser.userName;

            if (users[i].position !== undefined) {
              locationData[userName] = createUserPosition(currentUser);
            }
          }

          socket.emit('locationMsg', locationData);
        });
      } else {
        dbConnector.getUserLocation(user, data.user.userName, function(err, foundUser) {
          if (err || foundUser === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);
          } else if (foundUser.position !== undefined) {
            const userName = foundUser.userName;
            locationData[userName] = createUserPosition(foundUser);

            socket.emit('locationMsg', locationData);
          } else {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.notFound, 'Unable to locate ' + data.user.userName);
          }
        });
      }
    });
  });
}

module.exports = handle;
