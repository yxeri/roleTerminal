'use strict';

const dbUser = require('./../db/connectors/user');
const dbCommand = require('./../db/connectors/command');
const dbRoom = require('./../db/connectors/room');
const dbChatHistory = require('./../db/connectors/chatHistory');
const databasePopulation = require('./../config/defaults/config').databasePopulation;
const logger = require('./../utils/logger.js');
const appConfig = require('./../config/defaults/config').app;

/*
 * Sort messages based on timestamp
 */
const messageSort = (a, b) => {
  if (a.time < b.time) {
    return -1;
  } else if (a.time > b.time) {
    return 1;
  }

  return 0;
};

/**
 * Gets user by sent socket ID from socket.io
 * @param socketId Users ID in the socket from socket.io
 * @param callback Function callback
 */
function getUserById(socketId, callback) {
  dbUser.getUserById(socketId, (err, user) => {
    callback(err, user);
  });
}

/**
 * Gets a command
 * @param commandName String Name of the command to retrieve
 * @param callback Function callback
 */
function getCommand(commandName, callback) {
  dbCommand.getCommand(commandName, (err, command) => {
    callback(err, command);
  });
}

/**
 * Checks if the user is allowed to use the command
 * @param socketId The users socket ID from socket.io
 * @param commandName Name of the command
 * @param callback Function callback
 */
function userAllowedCommand(socketId, commandName, callback) {
  let isAllowed = false;
  const callbackFunc = (err, user) => {
    if (err) {
      callback(err);
    } else {
      getCommand(commandName, (cmdErr, command) => {
        if (cmdErr) {
          callback(cmdErr);
        } else {
          const userLevel = user ? user.accessLevel : 0;
          const commandLevel = command.accessLevel;

          if (userLevel >= commandLevel) {
            isAllowed = true;
          }
        }

        if (isAllowed) {
          dbCommand.incrementCommandUsage(commandName);
        }

        callback(cmdErr, isAllowed, user);
      });
    }
  };

  getUserById(socketId, callbackFunc);
}

/**
 * Gets history (messages) from one or more rooms
 * @param rooms The rooms to retrieve the history from
 * @param lines How many message to retrieve
 * @param missedMsgs Set to true if only the messages since the users last connection should be returned
 * @param lastOnline Date of the last time the user was online
 * @param callback Function callback
 */
function getHistory(rooms, lines, missedMsgs, lastOnline, callback) {
  dbChatHistory.getHistoryFromRooms(rooms, (err, history) => {
    let historyMessages = [];

    if (err || history === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get history'],
        err,
      });
    } else {
      const maxLines = lines === null || isNaN(lines) ? appConfig.historyLines : lines;

      for (const roomHistory of history) {
        historyMessages = historyMessages.concat(roomHistory.messages);
      }

      historyMessages.sort(messageSort);

      if (maxLines !== '*') {
        historyMessages = historyMessages.slice(-maxLines);
      }

      if (missedMsgs) {
        for (let i = historyMessages.length - 1; i > 0; i--) {
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
 * Creates a new chat room and adds the user who created it to it
 * @param sentRoom Object of the new room
 * @param user Object of the user
 * @param callback Function callback
 */
function createRoom(sentRoom, user, callback) {
  const newRoom = sentRoom;
  newRoom.roomName = sentRoom.roomName.toLowerCase();

  dbRoom.createRoom(newRoom, null, (err, room) => {
    if (err || room === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to create room for user ${user.userName}`],
        err,
      });
      callback(err);
    } else {
      dbUser.addRoomToUser(user.userName, room.roomName, (roomErr) => {
        if (roomErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: [`Failed to add user ${user.userName} to its room`],
            err: roomErr,
          });
        }

        callback(roomErr, room.roomName);
      });
    }
  });
}

/**
 * Updates user's socket ID in the database
 * @param socketId User's socket ID for socket.io
 * @param userName User's name
 * @param callback Function callback
 */
function updateUserSocketId(socketId, userName, callback) {
  dbUser.updateUserSocketId(userName, socketId, (err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update Id'],
        err,
      });
    }

    callback(err, user);
  });
}

/**
 * Joins the user's socket to all sent rooms and added standard rooms
 * @param rooms Rooms for the user to join
 * @param socket socket.io socket
 * @param device DeviceID of the user
 */
function joinRooms(rooms, socket, device) {
  const allRooms = rooms;

  allRooms.push(databasePopulation.rooms.important.roomName);
  allRooms.push(databasePopulation.rooms.broadcast.roomName);
  allRooms.push(databasePopulation.rooms.morse.roomName);

  if (device) {
    allRooms.push(device + appConfig.deviceAppend);
  }

  for (const room of allRooms) {
    socket.join(room);
  }
}

exports.userAllowedCommand = userAllowedCommand;
exports.getHistory = getHistory;
exports.createRoom = createRoom;
exports.updateUserSocketId = updateUserSocketId;
exports.joinRooms = joinRooms;
