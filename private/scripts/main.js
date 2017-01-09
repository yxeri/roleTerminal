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
const DialogBox = require('../library/view/DialogBox');

const mainView = document.getElementById('main');

const events = {
  message: ({ message }) => {
    const span = document.createElement('SPAN');

    span.appendChild(document.createTextNode(message.text));
    mainView.appendChild(span);
  },
};

const socketManager = new SocketManager({ socket: io(), events }); // eslint-disable-line no-undef

const login = new DialogBox({
  buttons: {
    left: {
      text: 'Register',
      eventFunc: () => {
        if (login.inputs.find(input => input.getAttribute('name') === 'secondPassword')) {

        } else {

        }
      },
    },
    right: {
      text: 'Login',
      eventFunc: () => {
        const user = {
          userName: login.inputs.find(input => input.getAttribute('name') === 'userName').value,
          password: login.inputs.find(input => input.getAttribute('name') === 'password').value,
        };

        socketManager.emitEvent('login', { user }, ({ error, data }) => {
          if (error) {
            console.log('Failed to login');

            return;
          }

          console.log('Successfully logged in', data.user);
        });
      },
    },
  },
  inputs: [
    {
      placeholder: 'User name',
      inputName: 'userName',
    },
    {
      placeholder: 'Password',
      inputName: 'password',
      inputType: 'password',
    },
  ],
  descriptionText: 'Welcome to razorOS. Please enter your user name and password to proceed',
  parentElement: mainView,
});

socketManager.emitEvent('chatMsg', { message: { text: ['Sent message'], roomName: 'public' } }, ({ data, error }) => { if (error) { console.log('error', error); } else { console.log('data', data); } });

window.addEventListener('error', (event) => {
  /**
   * Reloads page
   * @private
   */
  function restart() {
    window.location.reload();
  }

  console.log(event.error);
  setTimeout(restart, 3000);

  return false;
});
