'use strict';

const dbUser = require('../../db/connectors/user');
const dbLocation = require('../../db/connectors/location');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');
const objectValidator = require('../../utils/objectValidator');
const mapCreator = require('../../utils/mapCreator');
const messenger = require('../../socketHelpers/messenger');

/**
 * @param {Object} socket - Socket.IO socket
 */
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
        dbUser.getAllUserPositions(user, (err, mapPositions) => {
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
        dbUser.getUserPosition(user, positionName, (err, mapPosition) => {
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

      dbUser.updateUserIsTracked(user.userName, true, (trackingErr) => {
        if (trackingErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to update user isTracking'],
            err: trackingErr,
          });
        }
      });

      dbLocation.updatePosition({
        positionName: user.userName,
        position: params.position,
        type: 'user',
        group: user.team,
        callback: (userErr) => {
          if (userErr) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.db,
              text: ['Failed to update position'],
              err: userErr,
            });

            return;
          }

          dbLocation.getPosition(user.userName, (err, position) => {
            if (err) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.db,
                text: ['Failed to broadcast new user position'],
                err: userErr,
              });

              return;
            }

            dbUser.getAllUsers(user, (allErr, users) => {
              if (allErr) {
                logger.sendErrorMsg({
                  code: logger.ErrorCodes.db,
                  text: ['Failed to get all users to broadcast new user position to'],
                  err: userErr,
                });

                return;
              }

              for (const socketUser of users) {
                if (socketUser.socketId && socket.id !== socketUser.socketId && socketUser.isTracked) {
                  socket.broadcast.to(socketUser.socketId).emit('mapPositions', {
                    positions: [position],
                    currentTime: (new Date()),
                  });
                }
              }

              socket.broadcast.emit('mapPositions', {
                positions: [position],
                currentTime: (new Date()),
              });
            });
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

      /**
       * Get and send positions
       * @private
       * @param {string} type - Position type
       * @param {Object[]} positions - All positions
       */
      function getPositions(type, positions) {
        switch (type) {
          case 'static': {
            dbLocation.getAllStaticPositions((err, staticPositions) => {
              if (err) {
                return;
              }

              getPositions(types.shift(), positions.concat(staticPositions));
            });

            break;
          }
          case 'users': {
            if (user.isTracked) {
              dbUser.getAllUserPositions(user, (err, userPositions) => {
                if (err) {
                  return;
                }

                getPositions(types.shift(), positions.concat(userPositions));
              });
            } else {
              messenger.sendSelfMsg({
                socket,
                message: {
                  text: [
                    'DETECTED: TRACKING DISABLED',
                    'UNABLE TO RETRIEVE USER LOCATIONS',
                    'DISABLING TRACKING IS A MAJOR OFFENSE',
                    'REPORT IN FOR IMMEDIATE RE-EDUCATION SESSION',
                  ],
                },
              });
            }

            break;
          }
          default: {
            socket.emit('mapPositions', {
              positions,
              team: user.team,
              currentTime: (new Date()),
            });

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

        socket.emit('mapPositions', { positions: googlePositions });
      });
    });
  });
}

exports.handle = handle;
