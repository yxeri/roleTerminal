/*
 Copyright 2018 Aleksandar Jankovic

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

const socketManager = require('./SocketManager');
const storageManager = require('./StorageManager');
const eventCentral = require('./EventCentral');

class Authenticator {
  constructor() {
    if (!storageManager.getToken()) {
      eventCentral.emitEvent({
        event: eventCentral.Events.LOGOUT,
        params: {},
      });
    } else {
      socketManager.updateId();
    }
  }

  static login({ callback }) {
    socketManager.emitEvent(socketManager.EmitTypes.LOGIN, {}, ({ error, data }) => {
      if (error) {
        callback({ error });

        return;
      }

      const { token, user } = data;

      storageManager.setToken(token);

      eventCentral.emitEvent({
        event: eventCentral.Events.LOGIN,
        params: { user },
      });

      callback({ data: { success: true } });
    });
  }

  static logout({ callback }) {
    socketManager.emitEvent(socketManager.EmitTypes.LOGOUT, {}, ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      eventCentral.emitEvent({
        event: eventCentral.Events.LOGOUT,
        params: {},
      });

      callback({ data: { success: true } });
    });
  }
}

const authenticator = new Authenticator();

module.exports = authenticator;
