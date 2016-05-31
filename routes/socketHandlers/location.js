'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');
const objectValidator = require('../../utils/objectValidator');
const mapCreator = require('../../utils/mapCreator');

function handle(socket) {
  /**
   * Locate command. Returns location for one or more users
   * Emits locationMsg
   */
  socket.on('locate', (params) => {
    if (!objectValidator.isValidData(params, { mapPosition: { positionName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.locate.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const positionName = params.mapPosition.positionName;
      const locationData = {};

      // Return all user locations
      if (positionName === '*') {
        dbConnector.getAllUserPositions(user, (err, mapPositions) => {
          if (err || mapPositions === null) {
            logger.sendSocketErrorMsg({
              socket,
              code: logger.ErrorCodes.db,
              text: ['Failed to get user location'],
              err,
            });

            return;
          }

          for (const userLocation of mapPositions) {
            const userName = userLocation.positionName;
            locationData[userName] = userLocation;
          }

          socket.emit('locationMsg', locationData);
        });
      } else {
        dbConnector.getUserPosition(user, positionName, (err, mapPosition) => {
          if (err || mapPosition === null) {
            logger.sendSocketErrorMsg({
              socket,
              code: logger.ErrorCodes.db,
              text: ['Failed to get user location'],
              err,
            });
          } else if (mapPosition !== null) {
            const userName = mapPosition.positionName;
            locationData[userName] = mapPosition;

            socket.emit('locationMsg', locationData);
          } else {
            logger.sendSocketErrorMsg({
              socket,
              code: logger.ErrorCodes.notFound,
              text: [`Unable to locate ${positionName}`],
            });
          }
        });
      }
    });
  });

  socket.on('updateLocation', (params) => {
    if (!objectValidator.isValidData(params, { position: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.map.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.updatePosition({
        positionName: user.userName,
        position: params.position,
        type: 'user',
        callback: (userErr) => {
          if (userErr) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.db,
              text: ['Failed to update position'],
              err: userErr,
            });

            return;
          }

          dbConnector.getPosition(user.userName, (err, position) => {
            if (err) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.db,
                text: ['Failed to broadcast new user position'],
                err: userErr,
              });

              return;
            }

            socket.broadcast.emit('mapPositions', [position]);
          });
        },
      });
    });
  });

  socket.on('getMapPositions', (params) => {
    if (!objectValidator.isValidData(params, { types: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.map.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const types = params.types;

      function getPositions(type, positions) {
        switch (type) {
          case 'static': {
            dbConnector.getStaticPositions((err, staticPositions) => {
              if (err) {
                return;
              }

              getPositions(types.shift(), positions.concat(staticPositions));
            });

            break;
          }
          case 'users': {
            dbConnector.getAllUserPositions(user, (err, userPositions) => {
              if (err) {
                return;
              }

              getPositions(types.shift(), positions.concat(userPositions));
            });

            break;
          }
          default: {
            socket.emit('mapPositions', positions);

            break;
          }
        }
      }

      getPositions(types.shift(), []);
    });
  });

  socket.on('getGooglePositions', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.map.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      mapCreator.getGooglePositions((err, googlePositions) => {
        if (err || googlePositions === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: ['Failed to get world positions'],
            err,
          });

          return;
        }

        socket.emit('mapPositions', googlePositions);
      });
    });
  });
}

exports.handle = handle;
