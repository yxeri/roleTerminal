'use strict';

const dbConnector = require('./databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;
const appConfig = require('rolehaven-config').app;
const logger = require('./logger');
const objectValidator = require('./objectValidator');

function addMsgToHistory(roomName, message, socket, callback) {
  dbConnector.addMsgToHistory(roomName, message, function(err, history) {
    if (err || history === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add message to history'],
        err: err,
      });
      logger.sendSocketErrorMsg({
        socket: socket,
        code: logger.ErrorCodes.db,
        text: ['Failed to send the message'],
        text_se: ['Misslyckades med att skicka meddelandet'],
        err: err,
      });
      callback(err || {});
    } else {
      callback(err, message);
    }
  });
}

function sendSelfMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true } })) {
    return;
  }

  const message = params.message;

  params.socket.emit('message', { message: message });
}

function sendSelfMsgs(params) {
  if (!objectValidator.isValidData(params, { socket: true, messages: true })) {
    return;
  }

  const data = {
    messages: params.messages,
  };

  params.socket.emit('messages', data);
}

function isSocketFollowingRoom(socket, roomName) {
  if (Object.keys(socket.rooms).indexOf(roomName) === -1) {
    sendSelfMsg({
      socket: socket,
      message: {
        text: ['You are not following room ' + roomName],
        text_se: ['Ni följer inte rummet ' + roomName],
      },
    });

    return false;
  }

  return true;
}

function sendMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true, userName: true }, sendTo: true })) {
    return;
  }

  const socket = params.socket;
  const data = {
    message: params.message,
    sendTo: params.sendTo,
  };

  socket.broadcast.to(data.sendTo).emit('message', data);
}

function sendImportantMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true, userName: true } })) {
    return;
  }

  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.roomName = data.message.roomName || databasePopulation.rooms.important.roomName;
  data.message.extraClass = 'importantMsg';
  data.message.time = new Date();

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    if (params.toOneDevice) {
      socket.to(data.message.roomName).emit('importantMsg', data);
      sendSelfMsg({
        message: {
          text: ['Sent important message to device'],
          text_se: ['Skickade viktigt meddelande till enheten'],
        },
      });
    } else {
      socket.broadcast.emit('importantMsg', data);
      socket.emit('importantMsg', data);
    }
  });
}

function sendChatMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true, roomName: true, userName: true } })) {
    return;
  } else if (params.message && !isSocketFollowingRoom(params.socket, params.message.roomName)) {
    return;
  }

  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.time = new Date();

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.to(data.message.roomName).emit('message', data);
    socket.emit('message', data);
  });
}

function sendWhisperMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true, roomName: true, userName: true } })) {
    return;
  }

  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.roomName += appConfig.whisperAppend;
  data.message.extraClass = 'whisperMsg';
  data.message.time = new Date();

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    const senderRoomName = data.message.userName + appConfig.whisperAppend;

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
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true, userName: true } })) {
    return;
  }

  const socket = params.socket;
  const data = {
    message: params.message,
  };
  data.message.extraClass = 'broadcastMsg';
  data.message.roomName = databasePopulation.rooms.broadcast.roomName;
  data.message.time = new Date();

  addMsgToHistory(data.message.roomName, data.message, socket, function(err) {
    if (err) {
      return;
    }

    socket.broadcast.emit('message', data);
    socket.emit('message', data);
  });
}

function sendList(params) {
  if (!objectValidator.isValidData(params, { socket: true, itemList: { itemList: true, listTitle: true } })) {
    return;
  }

  const socket = params.socket;
  const data = {
    itemList: params.itemList,
    columns: params.columns,
  };

  socket.emit('list', data);
}

function sendMorse(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { morseCode: true } })) {
    return;
  }

  const roomName = params.message.roomName || databasePopulation.rooms.morse.roomName;
  const morseCode = params.message.morseCode;
  const socket = params.socket;
  const silent = params.silent;

  if (!params.local) {
    socket.broadcast.emit('morse', {
      morseCode: morseCode,
      silent: silent,
    });
  }

  socket.emit('morse', {
    morseCode: morseCode,
    silent: silent,
  });

  if (!silent) {
    const morseMessage = {
      text: [morseCode],
      time: new Date(),
      roomName: roomName,
    };

    addMsgToHistory(roomName, morseMessage, socket, function(err) {
      if (err) {
        return;
      }
    });
  }
}

exports.sendImportantMsg = sendImportantMsg;
exports.sendChatMsg = sendChatMsg;
exports.sendWhisperMsg = sendWhisperMsg;
exports.sendBroadcastMsg = sendBroadcastMsg;
exports.sendMsg = sendMsg;
exports.sendSelfMsg = sendSelfMsg;
exports.sendSelfMsgs = sendSelfMsgs;
exports.sendList = sendList;
exports.sendMorse = sendMorse;
