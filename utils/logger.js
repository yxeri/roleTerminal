'use strict';

const messenger = require('./../socketHelpers/messenger');
const objectValidator = require('./objectValidator');

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
 * Prints error message to server log
 * @param {Object} code - Error code
 * @param {string} text - Text to be printed
 * @param {Object} err - Thrown error
 */
function printErrorMsg(code, text, err) {
  console.log('[ERROR]', code.text, text, '- Error:', err || '');
}

/**
 * Prepares the error message and prints it
 * @param {Object} params - Parameters
 * @param {Object} params.code - Error code
 * @param {string} params.text - Error text
 * @param {Object} [params.err] - Thrown error
 */
function sendErrorMsg(params) {
  if (!objectValidator.isValidData(params, { code: true, text: true })) {
    return;
  }

  const code = params.code;
  const text = params.text;
  const err = params.err;

  printErrorMsg(code, text, err);
}

/**
 * Prepares the errmor message and prints it both server log and to client
 * @param {Object} params - Parameters
 * @param {Object} params.code - Error code
 * @param {string} params.text - Error text
 * @param {Object} params.socket - Socket.IO socket
 * @param {Object} [params.err] - Thrown error
 */
function sendSocketErrorMsg(params) {
  if (!objectValidator.isValidData(params, { socket: true, code: true, text: true })) {
    return;
  }

  const socket = params.socket;
  const code = params.code;
  const text = params.text;
  const err = params.err;
  text[0] = `[${code.num}] ${text[0]}`;

  messenger.sendSelfMsg({
    socket,
    message: {
      text,
    },
  });
  printErrorMsg(code, text, err);
}

/**
 * Prints info message to server log
 * @param {string} text - Text to be printed
 */
function sendInfoMsg(text) {
  console.log('[INFO]', text);
}

exports.ErrorCodes = ErrorCodes;
exports.sendErrorMsg = sendErrorMsg;
exports.sendSocketErrorMsg = sendSocketErrorMsg;
exports.sendInfoMsg = sendInfoMsg;
