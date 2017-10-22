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
const ButtonBox = require('./ButtonBox');
const storageManager = require('../../StorageManager');
const socketManager = require('../../SocketManager');
const eventCentral = require('../../EventCentral');
const soundLibrary = require('../../audio/SoundLibrary');
const textTool = require('../../TextTools');
const elementCreator = require('../../ElementCreator');

class LoginBox extends DialogBox {
  constructor({ description, extraDescription, parentElement, closeFunc }) {
    const buttons = {
      left: {
        text: 'Register',
        eventFunc: () => {
          const requiresVerification = storageManager.getRequiresVerification();
          const reenterPasswordInput = this.inputs.find(({ inputName }) => inputName === 'reenterPassword');

          if (!reenterPasswordInput) {
            this.addInput({
              placeholder: 'Re-enter your password',
              inputName: 'reenterPassword',
              type: 'password',
              required: true,
              extraClass: 'markedInput',
            });

            if (requiresVerification) {
              this.addInput({
                placeholder: 'Wasteland cybermail',
                inputName: 'email',
                type: 'email',
                isRequired: true,
                maxLength: 254,
              });
              this.addInput({
                placeholder: 'Re-enter your cybermail',
                inputName: 'reenterEmail',
                type: 'email',
                isRequired: true,
                maxLength: 254,
              });
            }

            this.focusInput('reenterPassword');
            this.markEmptyFields();

            return;
          }

          const emptyFields = this.markEmptyFields();

          if (emptyFields) {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

            return;
          }

          const userNameInput = this.inputs.find(({ inputName }) => inputName === 'userName').inputElement;

          if (!textTool.isInternationalAllowed(userNameInput.value)) {
            this.changeExtraDescription({
              text: [
                'User name contains invalid characters',
                'Allowed characters are: a-z 0-9',
                'Unable to register user',
              ],
            });

            return;
          } else if (reenterPasswordInput.inputElement.value !== this.inputs.find(({ inputName }) => inputName === 'password').inputElement.value) {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['Passwords do not match. Try again'] });
            this.clearInput('password');
            this.clearInput('reenterPassword');
            this.focusInput('password');

            return;
          } else if (requiresVerification && this.inputs.find(({ inputName }) => inputName === 'email').inputElement.value !== this.inputs.find(({ inputName }) => inputName === 'reenterEmail').inputElement.value) {
            soundLibrary.playSound('fail');
            this.changeExtraDescription({ text: ['Cybermail do not match. Try again'] });
            this.clearInput('email');
            this.clearInput('reenterEmail');
            this.focusInput('email');

            return;
          }

          socketManager.emitEvent('register', {
            user: {
              userName: userNameInput.value,
              password: reenterPasswordInput.inputElement.value,
              registerDevice: storageManager.getDeviceId(),
              mail: requiresVerification ? this.inputs.find(({ inputName }) => inputName === 'email').inputElement.value : '',
            },
          }, ({ error }) => {
            if (error) {
              soundLibrary.playSound('fail');

              switch (error.type) {
                case 'already exists': {
                  this.changeExtraDescription({ text: ['A user with that Wasteland cybermail or user name already exists', 'Unable to register user'] });

                  return;
                }
                case 'invalid characters': {
                  this.changeExtraDescription({ text: ['The user name contains invalid characters', 'Allowed: a-z 0-9'] });
                  this.clearInput('userName');

                  return;
                }
                case 'not allowed': {
                  this.changeExtraDescription({ text: ['User registration has been disabled', 'Unable to register user'] });

                  return;
                }
                case 'external': {
                  this.changeExtraDescription({
                    text: [
                      'Your user has been registered, but your account is not yet active.',
                      'ERROR! The user verification cybermail was not sent. Try clicking on "Resend verification?" to resend it',
                      'Contact your local IT support if this does not solve your problem',
                    ],
                  });

                  this.clearInput('userName');
                  this.clearInput('password');
                  this.clearInput('email');
                  this.removeInput('reenterPassword');
                  this.removeInput('email');
                  this.removeInput('reenterEmail');
                  this.focusInput('userName');

                  return;
                }
                case 'invalid mail': {
                  this.changeExtraDescription({ text: ['Cybermail is invalid.', 'Please try again'] });
                  this.clearInput('email');
                  this.clearInput('reenterEmail');

                  return;
                }
                default: {
                  this.changeExtraDescription({ text: ['Something went wrong. Failed to register user'] });

                  return;
                }
              }
            }

            if (requiresVerification) {
              this.changeExtraDescription({
                text: [
                  'Your user has been registered, but your account is not yet active.',
                  'You should receive a cybermail soon with further instructions. It may take a while for it to arrive. Be patient.',
                ],
              });
            } else {
              this.changeExtraDescription({
                text: [
                  'Your user has been registered. You may now login. Welcome to the Oracle, employee.',
                ],
              });
            }

            this.clearInput('userName');
            this.clearInput('password');
            this.clearInput('email');
            this.removeInput('reenterPassword');
            this.removeInput('email');
            this.removeInput('reenterEmail');
            this.focusInput('userName');
          });
        },
      },
      right: {
        text: 'Login',
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
            device: {
              deviceId: storageManager.getDeviceId(),
            },
          }, ({ error, data }) => {
            if (error) {
              soundLibrary.playSound('fail');

              switch (error.type) {
                case 'needs verification': {
                  this.changeExtraDescription({ text: ['Your account needs to be verified. You should have received a cybermail with further instructions.'] });

                  break;
                }
                case 'does not exist': {
                  this.changeExtraDescription({ text: ['Incorrect user name and/or password.'] });

                  break;
                }
                case 'banned': {
                  this.changeExtraDescription({ text: ['Your account has been banned.'] });

                  break;
                }
                default: {
                  this.changeExtraDescription({ text: ['Something went wrong. Failed to log in.'] });

                  break;
                }
              }

              return;
            }

            const { token, user: { accessLevel, team, shortTeam, aliases, userName, creatorAliases } } = data;

            storageManager.setToken(token);
            storageManager.setUserName(userName);
            storageManager.setAccessLevel(accessLevel);
            storageManager.setTeam(team, shortTeam);
            storageManager.setAliases(aliases);
            storageManager.setCreatorAliases(creatorAliases);
            eventCentral.triggerEvent({ event: eventCentral.Events.LOGIN });
            this.removeView();

            socketManager.emitEvent('getProfileGameCode', { owner: storageManager.getUserName() }, ({ error: codeError, data: codeData }) => {
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
        },
      },
    };
    const inputs = [{
      placeholder: 'User name',
      inputName: 'userName',
      isRequired: true,
      maxLength: 10,
    }, {
      placeholder: 'Password',
      inputName: 'password',
      type: 'password',
      isRequired: true,
      maxLength: 80,
    }];

    super({
      buttons,
      description,
      extraDescription,
      parentElement,
      inputs,
      closeFunc,
    });
  }

  appendTo(parentElement) {
    super.appendTo(parentElement);
  }
}

module.exports = LoginBox;
