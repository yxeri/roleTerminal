'use strict';

const messenger = require('./messenger');
const languagePicker = require('./languagePicker');
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

function printErrorMsg(code, text, err) {
  console.log('[ERROR]', code.text, text, '- Error:', err || '');
}

/**
 * Prints an error message to the log
 */
function sendErrorMsg(data) {
  if (!objectValidator.isValidData(data, { code: true, text: true })) {
    return;
  }

  const code = data.code;
  const text = data[languagePicker.appendLanguageCode('text')];
  const err = data.err;

  printErrorMsg(code, text, err);
}

/**
 * Sends an error message to the sent socket and prints it to the log
 */
function sendSocketErrorMsg(data) {
  if (!objectValidator.isValidData(data, { socket: true, code: true, text: true })) {
    return;
  }

  const socket = data.socket;
  const code = data.code;
  const text = data[languagePicker.appendLanguageCode('text')];
  const err = data.err;
  text[0] = '[' + code.num + '] ' + text[0];

  messenger.sendSelfMsg({
    socket: socket,
    message: {
      text: text,
    },
  });
  printErrorMsg(code, text, err);
}

function sendInfoMsg(text) {
  console.log('[INFO]', text);
}

exports.ErrorCodes = ErrorCodes;
exports.sendErrorMsg = sendErrorMsg;
exports.sendSocketErrorMsg = sendSocketErrorMsg;
exports.sendInfoMsg = sendInfoMsg;
