/*
 Copyright 2016 Aleksandar Jankovic

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

const SocketManager = require('../library/SocketManager');
const LoginBox = require('../library/view/templates/LoginBox');
const Messenger = require('../library/view/templates/Messenger');

const mainView = document.getElementById('main');

const socketManager = new SocketManager({ socket: io() }); // eslint-disable-line no-undef

const messenger = new Messenger({ isFullscreen: true, socketManager, sendButtonText: 'Skicka', isTopDown: false });
messenger.appendTo(mainView);

socketManager.addEvent('message', ({ message }) => {
  messenger.addMessage(message, { printable: true });
});

new LoginBox({
  descriptionText: 'Endast för Krismyndigheten och Försvarsmakten',
  parentElement: mainView,
  socketManager,
}).appendTo(mainView);

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
