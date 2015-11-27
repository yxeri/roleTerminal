'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');
const logger = require('./logger.js');

function addMsgToHistory(roomName, message, callback) {
  dbConnector.addMsgToHistory(roomName, message, function(err, history) {
    if (err || history === null) {
      logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to add message to history', err);
      // logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to send the message', err);

      return;
    }

    callback();
  });
}

function sendImportantMsg() {

}

function sendChatMsg(socket, message, skipSelfMsg) {
  const roomName = message.roomName;

  addMsgToHistory(roomName, message, function() {
    socket.broadcast.to(roomName).emit('messages', [message]);

    if (!skipSelfMsg) {
      socket.emit('messages', [message]);
    }
  });
}

function sendWhisperMsg(socket, message) {
  const roomName = message.roomName;
  const senderRoomName = message.user + dbDefaults.whisper;

  addMsgToHistory(roomName, message, function() {
    socket.broadcast.to(roomName).emit('messages', [message]);

    /*
     * Save the sent message in the sender's room history too, if it is a whisper
     */
    addMsgToHistory(senderRoomName, message, function() {
      socket.emit('messages', [message]);
    });
  });
}

function sendBroadcastMsg() {

}

exports.sendImportantMsg = sendImportantMsg;
exports.sendChatMsg = sendChatMsg;
exports.sendWhisperMsg = sendWhisperMsg;
exports.sendBroadcastMsg = sendBroadcastMsg;
