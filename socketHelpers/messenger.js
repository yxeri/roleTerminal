'use strict';

const dbChatHistory = require('./../db/connectors/chatHistory');
const databasePopulation = require('./../config/defaults/config').databasePopulation;
const appConfig = require('./../config/defaults/config').app;
const logger = require('./../utils/logger');
const objectValidator = require('./../utils/objectValidator');

/**
 * Symbolizes space between words in morse string
 * @private
 * @type {string}
 */
const morseSeparator = '#';
const morseCodes = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',
  '#': morseSeparator,
};

/**
 * Parses the text that will be sent as morse and returns the parsed morse text
 * @private
 * @param {string} text - Text to be sent as morse
 * @returns {string} - Parsed morse text
 */
function parseMorse(text) {
  let morseCode;
  let morseCodeText = '';
  let filteredText = text.toLowerCase();

  filteredText = filteredText.replace(/[åä]/g, 'a');
  filteredText = filteredText.replace(/[ö]/g, 'o');
  filteredText = filteredText.replace(/\s/g, '#');
  filteredText = filteredText.replace(/[^a-z0-9#]/g, '');

  for (let i = 0; i < filteredText.length; i++) {
    morseCode = morseCodes[filteredText.charAt(i)];

    for (let j = 0; j < morseCode.length; j++) {
      morseCodeText += `${morseCode[j]}${j === morseCode.length - 1 ? '' : ' '}`;
    }

    morseCodeText += '  ';
  }

  return morseCodeText;
}

/**
 * Add a sent message to a room's history in the database
 * @param roomName Name of the room
 * @param message Message to be added
 * @param socket Socket.io socket
 * @param callback Function callback
 */
function addMsgToHistory(roomName, message, socket, callback) {
  dbChatHistory.addMsgToHistory(roomName, message, (err, history) => {
    if (err || history === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add message to history'],
        err,
      });
      logger.sendSocketErrorMsg({
        socket,
        code: logger.ErrorCodes.db,
        text: ['Failed to send the message'],
        text_se: ['Misslyckades med att skicka meddelandet'],
        err,
      });
      callback(err || {});
    } else {
      callback(err, message);
    }
  });
}

/**
 * Send a message to the user's socket
 * @param {{socket: Object, message: {text: string[]}}} params
 */
function sendSelfMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { text: true } })) {
    return;
  }

  const message = params.message;

  params.socket.emit('message', { message });
}

/**
 * Sends multiple message to the user's socket
 * @param {{socket: Object, messages: Object[]}} params
 */
function sendSelfMsgs(params) {
  if (!objectValidator.isValidData(params, { socket: true, messages: true })) {
    return;
  }

  const messages = params.messages;

  params.socket.emit('messages', { messages });
}

/**
 * Checks if the socket is following a room
 * @param socket Socket.io socket
 * @param roomName Name of the room
 * @returns {boolean} Returns true if the socket is following the room
 */
function isSocketFollowingRoom(socket, roomName) {
  if (Object.keys(socket.rooms).indexOf(roomName) === -1) {
    sendSelfMsg({
      socket,
      message: {
        text: [`You are not following room ${roomName}`],
        text_se: [`Ni följer inte rummet ${roomName}`],
      },
    });

    return false;
  }

  return true;
}

/**
 * Sends a message to a room. The message will not be stored in history
 * Emits message
 * @param params Contains socket (socket.io socket), message (required: text, userName) and sendTo (room name)
 */
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

/**
 * Sends a message with the importantMsg class. It can be sent to all connected sockets or one specific device (if toOneDevice is set)
 * It is stored in a separate histories collection for important messages
 * Emits importantMsg
 * @param params Contains socket (socket.io socket), message (required: text, userName) and optional toOneDevice (boolean. True will send it to specific device)
 */
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

  addMsgToHistory(data.message.roomName, data.message, socket, (err) => {
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

/**
 * Sends a message to a room and stores it in history
 * Emits message
 * @param params Contains socket (socket.io), message (required: text, roomName, userName)
 */
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

  addMsgToHistory(data.message.roomName, data.message, socket, (err) => {
    if (err) {
      return;
    }

    socket.broadcast.to(data.message.roomName).emit('message', data);
    socket.emit('message', data);
  });
}

/**
 * Sends a message to a whisper room (*user name*-whisper), which is followed by a single user, and stores it in history
 * Emits message
 * @param params Contains socket (socket.io), message (required: text, roomName, userName)
 */
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

  addMsgToHistory(data.message.roomName, data.message, socket, (err) => {
    if (err) {
      return;
    }

    const senderRoomName = data.message.userName + appConfig.whisperAppend;

    addMsgToHistory(senderRoomName, data.message, socket, (senderErr) => {
      if (senderErr) {
        return;
      }

      socket.broadcast.to(data.message.roomName).emit('message', data);
      socket.emit('message', data);
    });
  });
}

/**
 * Sends a message with broadcastMsg class to all connected sockets
 * It is stored in a separate broadcast history
 * Emits message
 * @param params Contains socket (socket.io), message (required: text, user name)
 */
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

  addMsgToHistory(data.message.roomName, data.message, socket, (err) => {
    if (err) {
      return;
    }

    socket.broadcast.emit('message', data);
    socket.emit('message', data);
  });
}

/**
 * Send an array of strings with an optional title
 * Emits list
 * @param params Contains socket (socket.io), itemList (required: itemList, listTitle) and optional columns
 */
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

/**
 * Send morse code to all sockets and store in history
 * @param params Contains socket (socket.io), message (required: morseCode)
 */
function sendMorse(params) {
  if (!objectValidator.isValidData(params, { socket: true, message: { morseCode: true } })) {
    return;
  }

  const roomName = params.message.roomName || databasePopulation.rooms.morse.roomName;
  const morseCode = parseMorse(params.message.morseCode);
  const socket = params.socket;
  const silent = params.silent;
  const morseObj = {
    morseCode,
    silent,
  };

  if (!params.local) {
    socket.broadcast.emit('morse', morseObj);
  }

  socket.emit('morse', morseObj);

  if (!silent) {
    const morseMessage = {
      text: [morseCode.replace(/#/g, '')],
      time: new Date(),
      roomName,
    };

    addMsgToHistory(roomName, morseMessage, socket, (err) => {
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
