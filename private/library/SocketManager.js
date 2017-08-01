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

const storageManager = require('./StorageManager');
const eventCentral = require('./EventCentral');

class SocketManager {
  constructor() {
    this.socket = io(); // eslint-disable-line no-undef
    this.lastAlive = (new Date()).getTime();
    this.reconnecting = false;
    this.hasConnected = false;

    /**
     * Checks if the screen has been unresponsive for some time.
     * Some devices disable Javascript when screen is off (iOS)
     * They also fail to notice that they have been disconnected
     * We check the time between heartbeats and if the time i
     * over 10 seconds (example: when screen is turned off and then on)
     * we force them to reconnect
     */
    const timeoutFunc = () => {
      const now = (new Date()).getTime();
      const diff = now - this.lastAlive;
      const offBy = diff - 1000;
      this.lastAlive = now;

      if (offBy > 10000) {
        this.reconnect();
      }

      setTimeout(timeoutFunc, 1000);
    };

    timeoutFunc();
  }

  addEvent(event, callback) {
    this.socket.on(event, callback);
  }

  addEvents(events) {
    events.forEach(event => this.addEvent(event.event, event.func));
  }

  updateId() {
    this.emitEvent('updateDevice', {
      device: { deviceId: storageManager.getDeviceId() },
      callback: () => {},
    });
    this.emitEvent('updateId', {
      device: {
        deviceId: storageManager.getDeviceId(),
      },
    }, ({ error, data }) => {
      if (error) {
        eventCentral.triggerEvent({
          event: eventCentral.Events.LOGOUT,
          params: {},
        });

        return;
      }

      const { blockedBy, user: { userName, accessLevel, aliases, team, shortTeam } } = data;

      storageManager.setUserName(userName);
      storageManager.setAccessLevel(accessLevel);
      storageManager.setAliases(aliases);
      storageManager.setTeam(team, shortTeam);
      this.setConnected();

      eventCentral.triggerEvent({
        event: eventCentral.Events.SWITCHROOM,
        params: { roomName: storageManager.getRoom() } });
      eventCentral.triggerEvent({
        event: eventCentral.Events.SIGNALBLOCK,
        params: { blockedBy },
      });
      eventCentral.triggerEvent({
        event: eventCentral.Events.USER,
        params: {
          changedUser: userName,
          firstConnection: !this.hasConnected,
        },
      });

      this.emitEvent('getProfileGameCode', { owner: storageManager.getUserName() }, ({ error: codeError, data: codeData }) => {
        if (codeError) {
          console.log(codeError);

          return;
        }

        const { gameCode } = codeData;

        storageManager.setGameCode(gameCode);
        eventCentral.triggerEvent({
          event: eventCentral.Events.GAMECODE,
          params: { gameCode },
        });
      });
    });
  }

  /**
   * Reconnect to socket.io
   */
  reconnect() {
    if (!this.reconnecting) {
      this.reconnecting = true;
      this.socket.disconnect();
      this.socket.connect({ forceNew: true });
      this.updateId();
    }
  }

  /**
   * Emit event through socket.io
   * @param {string} event - Event to emit
   * @param {Object} [params] - Parameters to send in the emit
   * @param {Function} [callback] - Callback
   */
  emitEvent(event, params, callback) {
    params.token = storageManager.getToken() || '';

    if (!callback) {
      this.socket.emit(event, params);
    } else {
      this.socket.emit(event, params, callback);
    }
  }

  reconnectDone() { this.reconnecting = false; }

  setConnected() { this.hasConnected = true; }
}

const socketManager = new SocketManager();

module.exports = socketManager;
