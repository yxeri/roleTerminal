'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');
const logger = require('./logger');

function addMsgToHistory(roomName, message, socket, callback) {
  dbConnector.addMsgToHistory(roomName, message, function(err, history) {
    if (err || history === null) {
      logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to add message to history', err);
      logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to send the message', err);
      callback(err || {});
    } else {
      callback(err, message);
    }
  });
}

function sendSelfMsg(params) {
  const message = params.message;

  params.socket.emit('messages', [message]);
}

function sendSelfMsgs(params) {
  const messages = params.messages;

  params.socket.emit('messages', messages);
}

function sendMsg(params) {
  const message = params.message;

  params.socket.broadcast.to(params.sendTo).emit('messages', [message]);
}

function sendImportantMsg(params) {
  const message = params.message;
  const socket = params.socket;
  message.roomName = message.roomName || dbDefaults.rooms.important.roomName;
  message.extraClass = 'importantMsg';
  message.time = new Date();

  addMsgToHistory(message.roomName, message, socket, function(err) {
    if (err) {
      return;
    }

    if (params.toOneDevice) {
      socket.to(message.roomName).emit('importantMsg', message);
      sendSelfMsg({
        message: { text: ['Sent important message to device', message] },
      });
    } else {
      socket.broadcast.emit('importantMsg', message);
      socket.emit('importantMsg', message);
    }
  });
}

function sendChatMsg(params) {
  const message = params.message;
  const socket = params.socket;
  message.time = new Date();

  addMsgToHistory(message.roomName, message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.to(message.roomName).emit('messages', [message]);
    socket.emit('messages', [message]);
  });
}

function sendWhisperMsg(params) {
  const message = params.message;
  const socket = params.socket;
  message.roomName += dbDefaults.whisper;
  message.extraClass = 'whisperMsg';
  message.time = new Date();

  addMsgToHistory(message.roomName, message, socket, function(err) {
    if (err) {
      return;
    }

    const senderRoomName = message.user + dbDefaults.whisper;

    addMsgToHistory(senderRoomName, message, socket, function(senderErr) {
      if (senderErr) {
        return;
      }

      socket.broadcast.to(message.roomName).emit('messages', [message]);
      socket.emit('messages', [message]);
    });
  });
}

function sendBroadcastMsg(params) {
  const message = params.message;
  const socket = params.socket;
  message.extraClass = 'broadcastMsg';
  message.roomName = dbDefaults.rooms.broadcast.roomName;
  message.time = new Date();

  addMsgToHistory(message.roomName, message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.emit('messages', [message]);
    socket.emit('messages', [message]);
  });
}

exports.sendImportantMsg = sendImportantMsg;
exports.sendChatMsg = sendChatMsg;
exports.sendWhisperMsg = sendWhisperMsg;
exports.sendBroadcastMsg = sendBroadcastMsg;
exports.sendMsg = sendMsg;
exports.sendSelfMsg = sendSelfMsg;
exports.sendSelfMsgs = sendSelfMsgs;
