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

const BaseDialog = require('./BaseDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const socketManager = require('../../../SocketManager');
const storageManager = require('../../../StorageManager');

const ids = {
  FULLNAME: 'fullName',
  USERNAME: 'username',
  PASSWORD: 'password',
  REPEATPASSWORD: 'repeatPassword',
};

class RegisterDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `rDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: `${elementId}${ids.USERNAME}`,
        inputName: 'username',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'username' }),
      }),
      elementCreator.createInput({
        elementId: `${elementId}${ids.FULLNAME}`,
        inputName: 'fullName',
        type: 'text',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'fullName' }),
      }),
      elementCreator.createInput({
        elementId: `${elementId}${ids.PASSWORD}`,
        inputName: 'password',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'password' }),
      }),
      elementCreator.createInput({
        elementId: `${elementId}${ids.REPEATPASSWORD}`,
        inputName: 'repeatPassword',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'repeatPassword' }),
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'register' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            socketManager.emitEvent('createUser', {
              user: {
                username: this.getInputValue(ids.USERNAME),
                fullName: this.getInputValue(ids.FULLNAME),
                password: this.getInputValue(ids.PASSWORD),
                registerDevice: storageManager.getDeviceId(),
              },
            }, ({ error }) => {
              if (error) {
                let text = labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'error' });

                if (error.type === 'invalid length') {
                  switch (error.extraData.param) {
                    case 'username': {
                      text = labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'usernameLength' });

                      break;
                    }
                    case 'password': {
                      text = labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'passwordLength' });

                      break;
                    }
                    default: {
                      break;
                    }
                  }
                }

                this.updateLowerText({
                  text: [text],
                });

                return;
              }

              this.removeFromView();
            });
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      classes: classes.concat(['RegisterDialog']),
    });
  }
}

module.exports = RegisterDialog;
