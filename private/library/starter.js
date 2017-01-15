/*
 Copyright 2017 Aleksandar Jankovic

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

const storage = require('./storage');
const textTools = require('./textTools');

/**
 * Runs everything needed on start
 * @param {SocketManager} socketManager - Socket.io
 */
function start(socketManager) {
  if (!storage.getDeviceId()) {
    storage.setDeviceId(textTools.createAlphaNumbericalString(12, false));
  }

  if (!storage.getUserName()) {
    storage.setAccessLevel(0);
  }

  socketManager.emitEvent('updateId', {
    user: { userName: storage.getUserName() },
    device: { deviceId: storage.getDeviceId() },
  }, ({ error, data = {} }) => {
    console.log(error, data);
    if (error) {
      return;
    }

    const userName = storage.getUserName();

    if (userName && data.anonUser) {
      console.log('User does not exist. Logging you out');
    } else if (data.anonUser) {
      console.log('Anonymous!');
    } else {
      console.log('I remember you');
    }
  });


  window.addEventListener('error', (event) => {
    /**
     * Reloads page
     * @private
     */
    function restart() {
      window.location.reload();
    }

    console.log(event.error);
    // setTimeout(restart, 3000);

    return false;
  });
}

module.exports = start;
