'use strict';

const dbConnector = require('../../databaseConnector');
const dbDefaults = require('../../config/dbPopDefaults');
const manager = require('../../manager');
const logger = require('../../logger');

function updateUserTeam(socket, userName, teamName) {
  dbConnector.updateUserTeam(userName, teamName, function(err, user) {
    if (err || user === null) {
      logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to add member to team', err);
    }
  });
}

function getTeam(socket, user, callback) {
  dbConnector.getTeam(user.team, function(err, team) {
    let newErr;

    if (err || team === null) {
      logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed', err);
      newErr = {};
    }

    callback(newErr, team);
  });
}

function handle(socket) {
  socket.on('getTeam', function() {
    const cmdName = dbDefaults.commands.inviteteam.commandName;

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

  socket.on('inviteToTeam', function(data) {
    const cmdName = dbDefaults.commands.inviteteam.commandName;

    manager.userAllowedCommand(socket.id, cmdName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !data.userName) {
        return;
      }

      getTeam(socket, user, function(err, team) {
        if (err) {
          return;
        } else if (team.owner !== user.userName && team.admins.indexOf(user.userName) === -1) {
          const errMsg = 'You are not an admin of the team. You are not allowed to add new team mebers';

          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, errMsg, err);

          return;
        }

        updateUserTeam(socket, data.userName, team.teamName);
      });
    });
  });

  socket.on('createTeam', function(data) {
    const cmdName = dbDefaults.commands.createteam.commandName;

    manager.userAllowedCommand(socket.id, cmdName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !data.team) {
        return;
      }

      dbConnector.addTeam(data.team, function(err, team) {
        if (err || team === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to create team', err);

          return;
        }

        updateUserTeam(socket, user.userName, data.team.teamName);
      });
    });
  });
}

exports.handle = handle;
