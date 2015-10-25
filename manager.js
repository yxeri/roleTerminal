'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');
const logger = require('./logger.js');
const appConfig = require('./config/appConfig');

const messageSort = function(a, b) {
  if (a.time < b.time) {
    return -1;
  } else if (a.time > b.time) {
    return 1;
  }

  return 0;
};

function getUserById(socketId, callback) {
  dbConnector.getUserById(socketId, function(err, user) {
    callback(err, user);
  });
}

function getCommand(commandName, callback) {
  dbConnector.getCommand(commandName, function(err, command) {
    callback(err, command);
  });
}

function userAllowedCommand(socketId, commandName, callback) {
  let isAllowed = false;
  const callbackFunc = function(err, user) {
    if (err) {
      callback(err);
    } else {
      getCommand(commandName, function(cmdErr, command) {
        if (cmdErr) {
          callback(cmdErr);
        } else {
          const userLevel = user ? user.accessLevel : 0;
          const commandLevel = command.accessLevel;

          if (userLevel >= commandLevel) {
            isAllowed = true;
          }
        }

        callback(cmdErr, isAllowed, user);
      });
    }
  };

  getUserById(socketId, callbackFunc);
}

/**
 *
 * @param {array} rooms History from these rooms will retrieved
 * @param {int} lines Amount of lines returned for each room
 * @param {boolean} missedMsgs If true, only messages that the user missed since last login are sent
 * @param {date} lastOnline Last time user was online. Used to determine which missed messages to send
 * @param {function} callback Callback
 * @returns {undefined} Returns undefined
 */
function getHistory(rooms, lines, missedMsgs, lastOnline, callback) {
  dbConnector.getHistoryFromRooms(rooms, function(err, history) {
    let historyMessages = [];

    if (err || null === history) {
      logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to get history', err);
    } else {
      const maxLines = null === lines || isNaN(lines) ? appConfig.historyLines : lines;

      for (let i = 0; i < history.length; i++) {
        historyMessages = historyMessages.concat(history[i].messages);
      }

      historyMessages.sort(messageSort);
      historyMessages = historyMessages.slice(-maxLines);

      if (missedMsgs) {
        for (let i = historyMessages.length - 1; 0 < i; i--) {
          const message = historyMessages[i];

          if (lastOnline > message.time) {
            historyMessages = historyMessages.slice(i + 1);

            break;
          }
        }
      }
    }

    callback(err, historyMessages);
  });
}

/**
 *
 * @param {object} newRoom Room name to create
 * @param {object} user User who added the room
 * @param {function} callback Callback
 * @returns {undefined} Returns undefined
 */
function createRoom(newRoom, user, callback) {
  newRoom.roomName = newRoom.roomName.toLowerCase();

  dbConnector.createRoom(newRoom, null, function(err, room) {
    if (err || null === room) {
      logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to create room for user ' + user.userName, err);
      callback(err);
    } else {
      dbConnector.addRoomToUser(user.userName, room.roomName, function(roomErr) {
        if (roomErr) {
          logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to add user ' + user.userName + ' to its room', roomErr);
        }

        callback(roomErr, room.roomName);
      });
    }
  });
}

function updateUserSocketId(socketId, userName, callback) {
  dbConnector.updateUserSocketId(userName, socketId, function(err, user) {
    if (err) {
      logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to update Id', err);
    }

    callback(err, user);
  });
}

function joinRooms(rooms, socket, device) {
  const allRooms = rooms;

  allRooms.push(dbDefaults.rooms.important.roomName);
  allRooms.push(dbDefaults.rooms.broadcast.roomName);

  if (device) {
    allRooms.push(device + dbDefaults.device);
  }

  for (let i = 0; i < allRooms.length; i++) {
    const room = allRooms[i];

    socket.join(room);
  }
}

exports.userAllowedCommand = userAllowedCommand;
exports.getHistory = getHistory;
exports.createRoom = createRoom;
exports.updateUserSocketId = updateUserSocketId;
exports.joinRooms = joinRooms;
