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

const DialogBox = require('../DialogBox');
const storageManager = require('../../StorageManager');
const socketManager = require('../../SocketManager');
const eventCentral = require('../../EventCentral');
const soundLibrary = require('../../audio/SoundLibrary');

class LoginBox extends DialogBox {
  constructor({ description, extraDescription, parentElement }) {
    const buttons = {
      left: {
        text: 'Registrera',
        eventFunc: () => {
          const reenterPasswordInput = this.inputs.find(({ inputName }) => inputName === 'reenterPassword');

          if (!reenterPasswordInput) {
            this.addInput({
              placeholder: 'Re-enter your password',
              inputName: 'reenterPassword',
              type: 'password',
              required: true,
              extraClass: 'markedInput',
            });
            this.markEmptyFields();
            this.focusInput('reenterPassword');

            return;
          }

          const emptyFields = this.markEmptyFields();

          if (emptyFields) {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

            return;
          }

          if (reenterPasswordInput.inputElement.value === this.inputs.find(({ inputName }) => inputName === 'password').inputElement.value) {
            socketManager.emitEvent('register', {
              user: {
                userName: this.inputs.find(({ inputName }) => inputName === 'userName').inputElement.value,
                password: reenterPasswordInput.inputElement.value,
                registerDevice: storageManager.getDeviceId(),
              },
            }, ({ error, data }) => {
              if (error) {
                soundLibrary.playSound('fail');
                this.changeExtraDescription({ text: ['Something went wrong. Failed to register user'] });

                return;
              }

              const text = [];

              if (data.requiresVerification) {
                text.push('Your user has been registered, but you need to contact an administrator to get it verified');
              } else {
                text.push('Your user has been registered! You may now access O3C');
              }

              this.changeExtraDescription({ text });
              this.clearInput('userName');
              this.clearInput('password');
              this.removeInput('reenterPassword');
              this.focusInput('userName');
            });
          } else {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['Passwords do not match. Try again'] });
            this.clearInput('password');
            this.clearInput('reenterPassword');
            this.focusInput('password');
          }
        },
      },
      right: {
        text: 'Logga in',
        eventFunc: () => {
          const emptyFields = this.markEmptyFields();

          if (emptyFields) {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

            return;
          }

          socketManager.emitEvent('login', {
            user: {
              userName: this.inputs.find(({ inputName }) => inputName === 'userName').inputElement.value,
              password: this.inputs.find(({ inputName }) => inputName === 'password').inputElement.value,
            },
          }, ({ error, data }) => {
            if (error) {
              soundLibrary.playSound('fail');
              this.changeExtraDescription({ text: ['Something went wrong. Failed to register user'] });

              return;
            }

            storageManager.setUserName(data.user.userName);
            storageManager.setAccessLevel(data.user.accessLevel);
            storageManager.setTeam(data.user.team);
            eventCentral.triggerEvent({ event: eventCentral.Events.ALIAS, params: { aliases: data.user.aliases } });
            eventCentral.triggerEvent({ event: eventCentral.Events.LOGIN });
            this.removeView();
          });
        },
      },
    };
    const inputs = [{
      placeholder: 'User name',
      inputName: 'userName',
      isRequired: true,
    }, {
      placeholder: 'Password',
      inputName: 'password',
      type: 'password',
      isRequired: true,
    }];

    super({
      buttons,
      description,
      extraDescription,
      parentElement,
      inputs,
    });
  }

  appendTo(parentElement) {
    super.appendTo(parentElement);
  }
}

module.exports = LoginBox;
