/*
 Copyright 2018 Carmilla Mina Jankovic

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
const TemporaryDialog = require('./TemporaryDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const storageManager = require('../../../StorageManager');
const userComposer = require('../../../data/composers/UserComposer');
const socketManager = require('../../../SocketManager');
const viewSwitcher = require('../../../ViewSwitcher');

const ids = {
  FULLNAME: 'fullName',
  USERNAME: 'username',
  PASSWORD: 'password',
  REPEATPASSWORD: 'repeatPassword',
  DESCRIPTION: 'description',
  PICTURE: 'picture',
};

class RegisterDialog extends BaseDialog {
  constructor({
    requireFullName = false,
    classes = [],
    elementId = `rDialog-${Date.now()}`,
  }) {
    const upperText = [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'registerUser' })];
    const lowerText = [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'info' })];
    const inputs = [
      elementCreator.createInput({
        elementId: ids.USERNAME,
        inputName: 'username',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'username' }),
      }),
      elementCreator.createInput({
        elementId: ids.FULLNAME,
        inputName: 'fullName',
        type: 'text',
        maxLength: 40,
        isRequired: requireFullName,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'fullName' }),
      }),
      elementCreator.createInput({
        elementId: ids.PASSWORD,
        inputName: 'password',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'password' }),
      }),
      elementCreator.createInput({
        elementId: ids.REPEATPASSWORD,
        inputName: 'repeatPassword',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'repeatPassword' }),
      }),
      elementCreator.createInput({
        elementId: ids.DESCRIPTION,
        inputName: 'description',
        type: 'text',
        multiLine: true,
        maxLength: 500,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'description' }),
      }),
      elementCreator.createImageInput({
        buttonText: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'image' }),
        elementId: ids.PICTURE,
        inputName: 'picture',
        appendPreview: true,
        previewId: 'imagePreview-register',
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
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

            if (this.getInputValue(ids.PASSWORD) !== this.getInputValue(ids.REPEATPASSWORD)) {
              BaseDialog.markInput({ input: this.getElement(ids.PASSWORD) });
              BaseDialog.markInput({ input: this.getElement(ids.REPEATPASSWORD) });

              this.setInputValue({ elementId: ids.PASSWORD, value: '' });
              this.setInputValue({ elementId: ids.REPEATPASSWORD, value: '' });

              this.updateLowerText({ text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'notMatchingPassword' }) });

              return;
            }

            const params = {
              user: {
                username: this.getInputValue(ids.USERNAME),
                fullName: this.getInputValue(ids.FULLNAME),
                password: this.getInputValue(ids.PASSWORD),
                registerDevice: storageManager.getDeviceId(),
              },
              callback: ({ error, data }) => {
                if (error) {
                  if (error.type === 'invalid length') {
                    switch (error.extraData.param) {
                      case 'username': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'usernameLength' })] });

                        break;
                      }
                      case 'password': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'passwordLength' })] });

                        break;
                      }
                      case 'description': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'descriptionLength' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                        break;
                      }
                    }
                  } else if (error.type === 'invalid characters') {
                    switch (error.extraData.param) {
                      case 'fullName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'invalidFullName' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'invalidCharacters' })] });

                        break;
                      }
                    }
                  } else if (error.type === 'already exists') {
                    this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'alreadyExists' })] });
                  } else {
                    this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });
                  }

                  return;
                }

                if (!data.user.isVerified) {
                  const dialog = new TemporaryDialog({
                    text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'notVerified' })],
                  });

                  dialog.addToView({
                    element: viewSwitcher.getParentElement(),
                  });
                  this.removeFromView();

                  return;
                }

                socketManager.login({
                  username: this.getInputValue(ids.USERNAME),
                  password: this.getInputValue(ids.PASSWORD),
                  callback: ({ error: loginError }) => {
                    if (loginError) {
                      console.log(loginError);

                      return;
                    }

                    this.removeFromView();
                  },
                });
              },
            };
            const imagePreview = document.getElementById('imagePreview-register');

            if (imagePreview.getAttribute('src')) {
              params.image = {
                source: imagePreview.getAttribute('src'),
                imageName: imagePreview.getAttribute('name'),
                width: imagePreview.naturalWidth,
                height: imagePreview.naturalHeight,
              };
            }

            userComposer.createUser(params);
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      lowerText,
      upperText,
      classes: classes.concat(['registerDialog']),
    });
  }
}

module.exports = RegisterDialog;
