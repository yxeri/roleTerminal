'use strict';

const express = require('express');
const router = new express.Router();
const chatHandler = require('./socketHandlers/chat');
const userHandler = require('./socketHandlers/user');
const dbConnector = require('../dbConnectors/databaseConnector');
const commandHandler = require('./socketHandlers/command');
const teamHandler = require('./socketHandlers/team');
const hackingHandler = require('./socketHandlers/hacking');
const utilityHandler = require('./socketHandlers/utility');
const locationHandler = require('./socketHandlers/location');
const manager = require('../socketHelpers/manager');
const appConfig = require('../config/defaults/config').app;
const databasePopulation = require('../config/defaults/config').databasePopulation;
const logger = require('../utils/logger');
const messenger = require('../socketHelpers/messenger');
const deviceHandler = require('./socketHandlers/device');

function handle(io) {
  router.get('/', (req, res) => {
    res.render('index', {
      title: appConfig.title,
      socketPath: appConfig.socketPath,
    });
  });

  io.on('connection', (socket) => {
    userHandler.handle(socket, io);
    chatHandler.handle(socket, io);
    commandHandler.handle(socket, io);
    deviceHandler.handle(socket, io);
    teamHandler.handle(socket, io);
    hackingHandler.handle(socket, io);
    utilityHandler.handle(socket, io);
    locationHandler.handle(socket, io);

    socket.on('disconnect', () => {
      dbConnector.getUserById(socket.id, (err, user) => {
        if (err || user === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: ['User has disconnected. Couldn\'t retrieve user name'],
            err,
          });

          return;
        }

        dbConnector.updateUserSocketId(user.userName, '', (userErr, socketUser) => {
          if (userErr || socketUser === null) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.general,
              text: ['Failed to reset user socket ID'],
              err: userErr,
            });

            return;
          }

          dbConnector.setUserLastOnline(user.userName, new Date(), (userOnlineErr, settedUser) => {
            if (userOnlineErr || settedUser === null) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.general,
                text: ['Failed to set last online'],
                err: userErr,
              });

              return;
            }

            dbConnector.updateUserOnline(settedUser.userName, false, (onlineErr, updatedUser) => {
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
     * Invitations command. Returns all invitations to rooms and teams for the user
     * Emits commandFail or commandSuccess with the invitations
     */
    socket.on('getInvitations', () => {
      manager.userAllowedCommand(socket.id, databasePopulation.commands.invitations.commandName, (allowErr, allowed, user) => {
        if (allowErr || !allowed) {
          socket.emit('commandFail');

          return;
        }

        dbConnector.getInvitations(user.userName, (err, list) => {
          if (err || list === null) {
            messenger.sendSelfMsg({
              socket,
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
