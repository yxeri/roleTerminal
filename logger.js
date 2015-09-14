'use strict';

/*
 * Possible error codes with number and text representation, for usage towards users or internal
 */
var ErrorCodes = {
  db : {
    text : 'Database',
    num : 1
  },
  unauth : {
    text : 'Unauthorized',
    num : 2
  },
  notFound : {
    text : 'Not found',
    num : 3
  },
  general : {
    text : 'General',
    num : 4
  }
};

/**
 * Prints an error message to the log
 * @param code Object. Error code
 * @param text String. Error message
 * @param err Object. Error object
 */
function sendErrorMsg(code, text, err) {
  console.log('[ERROR]', code.text, text, '- Error:', err);
}

/**
 * Sends an error message to the sent socket and prints it to the log
 * @param socket Object. SocketIO socket
 * @param code Object. Error code
 * @param text String. Error message
 */
function sendSocketErrorMsg(socket, code, text) {
  socket.emit('message', { text : ['[' + code.num + '] ' + text] });
  sendErrorMsg(code, text);
}

function sendInfoMsg(text) {
  console.log('[INFO]', text);
}

exports.ErrorCodes = ErrorCodes;
exports.sendErrorMsg = sendErrorMsg;
exports.sendSocketErrorMsg = sendSocketErrorMsg;
exports.sendInfoMsg = sendInfoMsg;
