'use strict';

const dbConnector = require('../../databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;
const manager = require('../../manager');
const logger = require('../../logger');
const objectValidator = require('../../objectValidator');
const messenger = require('../../messenger');
const appConfig = require('rolehaven-config').app;

function updateUserTeam(socket, userName, teamName) {
  dbConnector.updateUserTeam(userName, teamName, function(err, user) {
    if (err || user === null) {
      logger.sendSocketErrorMsg({
        socket: socket,
        code: logger.ErrorCodes.general,
        text: ['Failed to add member ' + userName + ' to team ' + teamName],
        text_se: ['Misslyckades med att lägga till medlem ' + userName + ' till teamet ' + teamName],
        err: err,
      });

      return;
    }

    messenger.sendMsg({
      socket: socket,
      message: {
        text: ['You have been added to the team ' + teamName],
        text_se: ['Ni har blivit tillagd i teamet ' + teamName],
        userName: 'SYSTEM',
      },
      sendTo: userName + appConfig.whisperAppend,
    });
  });
}

function getTeam(socket, user, callback) {
  dbConnector.getTeam(user.team, function(err, team) {
    let newErr;

    if (err || team === null) {
      logger.sendSocketErrorMsg({
        socket: socket,
        code: logger.ErrorCodes.general,
        text: ['Failed'],
        err: err,
      });
      newErr = {};
    }

    callback(newErr, team);
  });
}

function handle(socket) {
  socket.on('getTeam', function() {
    const cmdName = databasePopulation.commands.inviteteam.commandName;

    manager.userAllowedCommand(socket.id, cmdName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      getTeam(socket, user, function(err) {
        if (err) {
          return;
        }
      });
    });
  });

  socket.on('teamExists', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.createteam.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !data || !data.team) {
        socket.emit('commandFail');

        return;
      }

      dbConnector.getTeam(data.team.teamName, function(err, foundTeam) {
        if (err) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to check if team exists'],
            text_se: ['Misslyckades med att försöka hitta teamet'],
            err: err,
          });
          socket.emit('commandFail');

          return;
        } else if (foundTeam !== null) {
          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['Team with that name already exists'],
              text_se: ['Ett team med det namnet existerar redan'],
            },
          });
          socket.emit('commandFail');

          return;
        }

        socket.emit('commandSuccess', { freezeStep: true });
      });
    });
  });

  socket.on('inviteToTeam', function(data) {
    const cmdName = databasePopulation.commands.inviteteam.commandName;

    manager.userAllowedCommand(socket.id, cmdName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !data.user || !data.user.userName) {
        return;
      }

      getTeam(socket, user, function(err, team) {
        if (err) {
          return;
        } else if (team.owner !== user.userName && team.admins.indexOf(user.userName) === -1) {
          const errMsg = 'You are not an admin of the team. You are not allowed to add new team mebers';

          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: [errMsg],
            err: err,
          });

          return;
        }

        updateUserTeam(socket, data.userName, team.teamName);
      });
    });
  });

  socket.on('createTeam', function(data) {
    if (!objectValidator.isValidData(data, { team: { teamName: true, owner: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.createteam.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !data.team || !data.team.teamName) {
        return;
      }

      const teamName = data.team.teamName;
      const owner = data.team.owner;
      const admins = data.team.admins;

      dbConnector.getUser(owner, function(userErr, user) {
        if (userErr) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to create team'],
            text_se: ['Misslyckades med att skapa teamet'],
            err: userErr,
          });

          return;
        } else if (user === null) {
          logger.sendSocketErrorMsg({
            socket: socket, code: logger.ErrorCodes.general,
            text: ['User with the name ' + owner + ' does not exist. Failed to create team'],
            text_se: ['Användare med namnet ' + owner + ' existerar inte. Misslyckades med att skapa teamet'],
          });

          return;
        }

        dbConnector.addTeam(data.team, function(err, team) {
          if (err || team === null) {
            logger.sendSocketErrorMsg({
              socket: socket,
              code: logger.ErrorCodes.db,
              text: ['Failed to create team'],
              text_se: ['Misslyckades med att skapa teamet'],
              err: err,
            });

            return;
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['Team has been created'],
              text_se: ['Teamet har skapats'],
            },
          });

          updateUserTeam(socket, owner, teamName);

          if (admins) {
            for (let i = 0; i < admins.length; i++) {
              updateUserTeam(socket, admins[i], teamName);
            }
          }
        });
      });
    });
  });
}

exports.handle = handle;
