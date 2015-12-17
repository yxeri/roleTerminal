'use strict';

const dbConnector = require('./databaseConnector');
const dbDefaults = require('./config/dbPopDefaults');
const logger = require('./logger');
const objectValidator = require('./objectValidator');

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
  if (!objectValidator.isValidData(params, { message: { text: true } })) {
    return;
  }

  const message = params.message;

  params.socket.emit('message', { message: message });
}

function sendSelfMsgs(params) {
  const data = {
    messages: params.messages,
  };

  if (!objectValidator.isValidData(data, { messages: true })) {
    return;
  }
  params.socket.emit('messages', data);
}

function isSocketFollowingRoom(socket, roomName) {
  if (socket.rooms.indexOf(roomName) === -1) {
    sendSelfMsg({
      message: {
        text: ['You are not following room ' + roomName],
      },
    });

    return false;
  }

  return true;
}

function sendMsg(params) {
  const socket = params.socket;
  const data = {
    message: params.message,
    sendTo: params.sendTo,
  };

  if (!objectValidator.isValidData(data, { message: { text: true, userName: true }, sendTo: true })) {
    return;
  }

  socket.broadcast.to(data.sendTo).emit('message', data);
}

function sendImportantMsg(params) {
  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.roomName = data.message.roomName || dbDefaults.rooms.important.roomName;
  data.message.extraClass = 'importantMsg';
  data.message.time = new Date();

  if (!objectValidator.isValidData(data, { message: { text: true, userName: true, roomName: true, time: true, extraClass: true } })) {
    return;
  }

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    if (params.toOneDevice) {
      socket.to(data.message.roomName).emit('importantMsg', data);
      sendSelfMsg({
        message: { text: ['Sent important message to device'] },
      });
    } else {
      socket.broadcast.emit('importantMsg', data);
      socket.emit('importantMsg', data);
    }
  });
}

function sendChatMsg(params) {
  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.time = new Date();

  if (!objectValidator.isValidData(data, { message: { text: true, roomName: true, userName: true, time: true } })) {
    return;
  } else if (!isSocketFollowingRoom(socket, data.message.roomName)) {
    return;
  }

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.to(data.message.roomName).emit('message', data);
    socket.emit('message', data);
  });
}

function sendWhisperMsg(params) {
  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.roomName += dbDefaults.whisper;
  data.message.extraClass = 'whisperMsg';
  data.message.time = new Date();

  if (!objectValidator.isValidData(data, { message: { text: true, roomName: true, userName: true, time: true, extraClass: true } })) {
    return;
  }

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    const senderRoomName = data.message.userName + dbDefaults.whisper;

    addMsgToHistory(senderRoomName, data.message, socket, function(senderErr) {
      if (senderErr) {
        return;
      }

      socket.broadcast.to(data.message.roomName).emit('message', data);
      socket.emit('message', data);
    });
  });
}

function sendBroadcastMsg(params) {
  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.extraClass = 'broadcastMsg';
  data.message.roomName = dbDefaults.rooms.broadcast.roomName;
  data.message.time = new Date();

  if (!objectValidator.isValidData(data, { message: { text: true, roomName: true, userName: true, time: true, extraClass: true } })) {
    return;
  }

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.emit('message', data);
    socket.emit('message', data);
  });
}

function sendList(params) {
  const socket = params.socket;
  const data = {
    itemList: params.itemList,
  };

  if (!objectValidator.isValidData(data, { itemList: { itemList: true, listTitle: true } })) {
    return;
  }

  socket.emit('list', data);
}

exports.sendImportantMsg = sendImportantMsg;
exports.sendChatMsg = sendChatMsg;
exports.sendWhisperMsg = sendWhisperMsg;
exports.sendBroadcastMsg = sendBroadcastMsg;
exports.sendMsg = sendMsg;
exports.sendSelfMsg = sendSelfMsg;
exports.sendSelfMsgs = sendSelfMsgs;
exports.sendList = sendList;
