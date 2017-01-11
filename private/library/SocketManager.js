/*
 Copyright 2015 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

class SocketManager {
  constructor({ socket, events }) {
    const eventKeys = Object.keys(events);
    this.socket = socket;
    this.lastAlive = (new Date()).getTime();

    for (let i = 0; i < eventKeys.length; i += 1) {
      const event = eventKeys[i];

      this.socket.on(event, events[event]);
    }

    this.autoReconnect();
  }

  /**
   * Reconnect to socket.io
   */
  reconnect() {
    this.socket.disconnect();
    this.socket.connect({ forceNew: true });
    this.socket.emit('updateId', {}, () => {
      // TODO User and device should be sent to server
      console.log('reconnected');
    });
  }

  /**
   * Emit event through socket.io
   * @param {string} event - Event to emit
   * @param {Object} [params] - Parameters to send in the emit
   * @param {Function} [callback] - Callback
   */
  emitEvent(event, params, callback) {
    if (!callback) {
      this.socket.emit(event, params);
    } else {
      this.socket.emit(event, params, callback);
    }
  }

  /**
   * Checks if the screen has been unresponsive for some time.
   * Some devices disable Javascript when screen is off (iOS)
   * They also fail to notice that they have been disconnected
   * We check the time between heartbeats and if the time i
   * over 10 seconds (example: when screen is turned off and then on)
   * we force them to reconnect
   */
  autoReconnect() {
    const now = (new Date()).getTime();
    const diff = now - this.lastAlive;
    const offBy = diff - 1000;
    this.lastAlive = now;

    if (offBy > 10000) {
      this.reconnect();
    }

    setTimeout(this.autoReconnect, 1000);
  }
}

module.exports = SocketManager;
