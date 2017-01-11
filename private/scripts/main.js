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

const mainView = document.getElementById('main');

const events = {
  message: ({ message }) => {
    const span = document.createElement('SPAN');

    span.appendChild(document.createTextNode(message.text.toString()));
    mainView.appendChild(span);
  },
};

const socketManager = new SocketManager({ socket: io(), events }); // eslint-disable-line no-undef

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
