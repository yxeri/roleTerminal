'use strict';

const messenger = require('./messenger');

/*
 * Possible error codes with number and text representation, for usage towards users or internal
 */
const ErrorCodes = {
  db: {
    text: 'Database',
    num: 1,
  },
  unauth: {
    text: 'Unauthorized',
    num: 2,
  },
  notFound: {
    text: 'Not found',
    num: 3,
  },
  general: {
    text: 'General',
    num: 4,
  },
};

/**
 * Prints an error message to the log
 * @param {object} code Error code
 * @param {string} text Error message
 * @param {object} err Error object
 * @returns {undefined} Returns undefined
 */
function sendErrorMsg(code, text, err) {
  console.log('[ERROR]', code.text, text, '- Error:', err || '');
}

/**
 * Sends an error message to the sent socket and prints it to the log
 * @param {object} socket SocketIO socket
 * @param {object} code Error code
 * @param {object} text Error message
 * @param {object} err Error object
 * @returns {undefined} Returns undefined
 */
function sendSocketErrorMsg(socket, code, text, err) {
  messenger.sendSelfMsg({
    socket: socket,
    message: {
      text: ['[' + code.num + '] ' + text],
    },
  });
  sendErrorMsg(code, text, err);
}

function sendInfoMsg(text) {
  console.log('[INFO]', text);
}

exports.ErrorCodes = ErrorCodes;
exports.sendErrorMsg = sendErrorMsg;
exports.sendSocketErrorMsg = sendSocketErrorMsg;
exports.sendInfoMsg = sendInfoMsg;
