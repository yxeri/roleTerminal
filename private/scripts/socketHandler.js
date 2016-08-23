/** @module */

const storage = require('./storage');

/**
 * Socket.IO
 * @private
 */
const socket = io(); // eslint-disable-line no-undef
/**
 * Focus can sometimes trigger twice, which is used to check if a reconnection
 * is needed. This flag will be set to true while it is reconnecting to
 * block the second attempt
 * @private
 * @type {boolean}
 */
let reconnecting = false;

/**
 * Add all listenable events to socket.io
 * @static
 * @param {string[]} events - All listenable events
 */
function startSocket(events) {
  if (socket) {
    const eventKeys = Object.keys(events);

    for (let i = 0; i < eventKeys.length; i++) {
      const event = eventKeys[i];

      socket.on(event, events[event]);
    }
  }
}

/**
 * Reconnect to socket.io
 * @static
 */
function reconnect() {
  const user = storage.getUser();

  if (!reconnecting) {
    reconnecting = true;

    socket.disconnect();
    socket.connect({ forceNew: true });
    socket.emit('updateId', {
      user: { userName: user },
      device: { deviceId: storage.getDeviceId },
    });
  }
}

/**
 * Emit event through socket.io
 * @param {Object} event - Event to emit
 * @param {Object} params - Parameters to send in the emit
 * @static
 */
function emit(event, params) {
  socket.emit(event, params);
}

/**
 * Get socket from socket.io
 * @static
 * @returns {Object} socket - Socket from socket.io
 */
function getSocket() {
  return socket;
}

/**
 * Set is reconnecting
 * @static
 * @param {boolean} isReconecting - Is it reconnecting?
 */
function setReconnecting(isReconecting) {
  reconnecting = isReconecting;
}

exports.reconnect = reconnect;
exports.emit = emit;
exports.getSocket = getSocket;
exports.setReconnecting = setReconnecting;
exports.startSocket = startSocket;
