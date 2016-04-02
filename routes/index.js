'use strict';

const express = require('express');
const router = new express.Router();
const chatHandler = require('./socketHandlers/chat');
const userHandler = require('./socketHandlers/user');
const dbConnector = require('../databaseConnector');
const commandHandler = require('./socketHandlers/command');
const teamHandler = require('./socketHandlers/team');
const hackingHandler = require('./socketHandlers/hacking');
const utilityHandler = require('./socketHandlers/utility');
const locationHandler = require('./socketHandlers/location');
const manager = require('../manager');
const appConfig = require('rolehaven-config').app;
const databasePopulation = require('rolehaven-config').databasePopulation;
const logger = require('../logger');
const messenger = require('../messenger');
const deviceHandler = require('./socketHandlers/device');
const objectValidator = require('../objectValidator');

function handle(io) {
  router.get('/', function(req, res) {
    res.render('index', {
      title: appConfig.title,
      socketPath: appConfig.socketPath,
    });
  });

  io.on('connection', function(socket) {
    userHandler.handle(socket, io);
    chatHandler.handle(socket, io);
    commandHandler.handle(socket, io);
    deviceHandler.handle(socket, io);
    teamHandler.handle(socket, io);
    hackingHandler.handle(socket, io);
    utilityHandler.handle(socket, io);
    locationHandler.handle(socket, io);

    socket.on('disconnect', function() {
      dbConnector.getUserById(socket.id, function(err, user) {
        if (err || user === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: [`User has disconnected. Couldn't retrieve user name`],
            err: err,
          });

          return;
        }

        dbConnector.updateUserSocketId(user.userName, '', function(userErr, socketUser) {
          if (userErr || socketUser === null) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.general,
              text: ['Failed to reset user socket ID'],
              err: userErr,
            });

            return;
          }

          dbConnector.setUserLastOnline(user.userName, new Date(), function(userOnlineErr, settedUser) {
            if (userOnlineErr || settedUser === null) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.general,
                text: ['Failed to set last online'],
                err: userErr,
              });

              return;
            }

            dbConnector.updateUserOnline(settedUser.userName, false, function(onlineErr, updatedUser) {
              if (onlineErr || updatedUser === null) {
                logger.sendErrorMsg({
                  code: logger.ErrorCodes.general,
                  text: ['Failed to update online'],
                  err: userErr,
                });
              }
            });
          });
        });

        logger.sendInfoMsg(`${socket.id} ${user.userName} has disconnected`);
      });
    });

    // TODO This should be moved
    /**
     * Updates socketID and user name on a device in the database
     */
    socket.on('updateDeviceSocketId', function(data) {
      if (!objectValidator.isValidData(data, { user: { userName: true }, device: { deviceId: true } })) {
        return;
      }

      const deviceId = data.device.deviceId;
      const userName = data.user.userName;

      socket.join(deviceId + appConfig.deviceAppend);

      dbConnector.updateDeviceSocketId(deviceId, socket.id, userName, function(err, device) {
        if (err || device === null) {
          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Device has been updated'],
            text_se: ['Enheten har uppdaterats'],
          },
        });
      });
    });

    // TODO This should be moved
    /**
     * Invitations command. Returns all invitations to rooms and teams for the user
     * Emits commandFail or commandSuccess with the invitations
     */
    socket.on('getInvitations', function() {
      manager.userAllowedCommand(socket.id, databasePopulation.commands.invitations.commandName, function(allowErr, allowed, user) {
        if (allowErr || !allowed) {
          socket.emit('commandFail');

          return;
        }

        dbConnector.getInvitations(user.userName, function(err, list) {
          if (err || list === null) {
            messenger.sendSelfMsg({
              socket: socket,
              message: {
                text: ['Failed to get invitations'],
                text_se: ['Misslyckades med att hämta alla inbjudan'],
              },
            });
            socket.emit('commandFail');

            return;
          }

          socket.emit('commandSuccess', { invitations: list.invitations, freezeStep: true });
        });
      });
    });
  });

  return router;
}

module.exports = handle;
