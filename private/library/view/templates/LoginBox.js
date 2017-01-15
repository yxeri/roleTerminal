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
const storage = require('../../storage');
const textTools = require('../../textTools');

/**
 * Marks fields that are empty. Returns true if any of the fields were empty
 * @private
 * @param {LoginBox} loginBox - This LoginBox object
 * @param {HTMLElement[]} requiredFields - Fields to be checked
 * @returns {boolean} Are any of the fields empty?
 */
function markEmptyFields(loginBox, requiredFields) {
  let emptyFields = false;

  for (const input of requiredFields) {
    if (input.value === '') {
      emptyFields = true;
      loginBox.markInput(input.getAttribute('name'));
    }
  }

  return emptyFields;
}

class LoginBox extends DialogBox {
  constructor({ socketManager, descriptionText, parentElement }) {
    const buttons = {
      left: {
        text: 'Registrera',
        eventFunc: () => {
          const reenterPasswordInput = this.inputs.get('reenterPassword');

          if (!reenterPasswordInput) {
            this.addInput({
              placeholder: 'Återupprepa lösenordet',
              inputName: 'reenterPassword',
              inputType: 'password',
              required: true,
              extraClass: 'markedInput',
            });

            return;
          }

          const emptyFields = markEmptyFields(this, [this.inputs.get('userName'), this.inputs.get('password'), this.inputs.get('reenterPassword')]);

          if (emptyFields) {
            this.changeDescription({ text: 'Alla obligatoriska fält måste vara ifyllda!', shouldAppend: true });

            return;
          }

          if (reenterPasswordInput.value === this.inputs.get('password').value) {
            socketManager.emitEvent('register', {
              user: {
                userName: this.inputs.get('userName').value,
                password: reenterPasswordInput.value,
                registerDevice: textTools.createAlphaNumbericalString(12, false),
              },
            }, ({ data, error }) => {
              if (error) {
                let errorText = 'Något gick fel. Kunde inte registrera användare';

                // TODO Specify language
                if (error.text_se) {
                  errorText = error.text_se.toString();
                }

                this.changeDescription({ text: errorText, shouldAppend: true });

                return;
              }

              console.log('Successfully registered', data);
            });
          } else {
            this.changeDescription({ text: 'Lösenorden stämmer inte överens. Försök igen', shouldAppend: true });
            this.clearInput('password');
            this.clearInput('reenterPassword');
            this.focusInput('password');
          }
        },
      },
      right: {
        text: 'Logga in',
        eventFunc: () => {
          const emptyFields = markEmptyFields(this, [this.inputs.get('userName'), this.inputs.get('password')]);

          if (emptyFields) {
            this.changeDescription({ text: 'Alla obligatoriska fält måste vara ifyllda!', shouldAppend: true });

            return;
          }

          socketManager.emitEvent('login', {
            user: {
              userName: this.inputs.get('userName').value,
              password: this.inputs.get('password').value,
            },
          }, ({ error, data }) => {
            if (error) {
              this.changeDescription({ text: 'Något gick fel. Misslyckades med att logga in', shouldAppend: true });

              return;
            }

            storage.setLocalVal('userName', data.user.userName);
            storage.setLocalVal('accessLevel', data.user.accessLevel);
            this.removeView();
          });
        },
      },
    };
    const inputs = [{
      placeholder: 'Användarnamn',
      inputName: 'userName',
      required: true,
    }, {
      placeholder: 'Lösenord',
      inputName: 'password',
      inputType: 'password',
      required: true,
    }];


    super({
      buttons,
      descriptionText,
      parentElement,
      inputs,
    });
  }
}

module.exports = LoginBox;
