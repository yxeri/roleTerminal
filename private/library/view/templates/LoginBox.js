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

class LoginBox extends DialogBox {
  constructor({ socketManager, description, extraDescription, parentElement, keyHandler }) {
    const buttons = {
      left: {
        text: 'Registrera',
        eventFunc: () => {
          const reenterPasswordInput = this.inputs.find(({ inputName }) => inputName === 'reenterPassword');

          if (!reenterPasswordInput) {
            this.addInput({
              placeholder: 'Återupprepa lösenordet',
              inputName: 'reenterPassword',
              inputType: 'password',
              required: true,
              extraClass: 'markedInput',
            });
            this.markEmptyFields();
            this.focusInput('reenterpassword');

            return;
          }

          const emptyFields = this.markEmptyFields();

          if (emptyFields) {
            this.changeExtraDescription({ text: ['Alla obligatoriska fält måste vara ifyllda!'] });

            return;
          }

          if (reenterPasswordInput.inputElement.value === this.inputs.find(({ inputName }) => inputName === 'password').inputElement.value) {
            socketManager.emitEvent('register', {
              user: {
                userName: this.inputs.find(({ inputName }) => inputName === 'userName').inputElement.value,
                password: reenterPasswordInput.inputElement.value,
                registerDevice: storage.getDeviceId(),
              },
            }, ({ error }) => {
              if (error) {
                let errorText = 'Något gick fel. Kunde inte registrera användare';

                // TODO Specify language
                if (error.text_se) {
                  errorText = error.text_se.toString();
                }

                this.changeExtraDescription({ text: [errorText] });

                return;
              }

              this.changeExtraDescription({ text: ['Användaren är nu registrerad!'] });
              this.clearInput('userName');
              this.clearInput('password');
              this.removeInput('reenterPassword');
              this.focusInput('userName');
            });
          } else {
            this.changeExtraDescription({ text: ['Lösenorden stämmer inte överens. Försök igen'] });
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
            this.changeExtraDescription({ text: ['Alla obligatoriska fält måste vara ifyllda!'] });

            return;
          }

          socketManager.emitEvent('login', {
            user: {
              userName: this.inputs.find(({ inputName }) => inputName === 'userName').inputElement.value,
              password: this.inputs.find(({ inputName }) => inputName === 'password').inputElement.value,
            },
          }, ({ error, data }) => {
            if (error) {
              this.changeExtraDescription({ text: ['Något gick fel. Misslyckades med att logga in'] });

              return;
            }

            storage.setUserName(data.user.userName);
            storage.setAccessLevel(data.user.accessLevel);
            storage.setAliases(data.user.aliases);
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
      description,
      extraDescription,
      parentElement,
      inputs,
      keyHandler,
    });
  }

  appendTo(parentElement) {
    super.appendTo(parentElement);
    this.inputs.find(({ inputName }) => inputName === 'userName').inputElement.focus();
  }
}

module.exports = LoginBox;
