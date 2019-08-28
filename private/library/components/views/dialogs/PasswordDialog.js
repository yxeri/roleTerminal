/*
 Copyright 2019 Carmilla Mina Jankovic

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
const userComposer = require('../../../data/composers/UserComposer');

const ids = {
  PASSWORD: 'password',
  REPEATPASSWORD: 'repeatPassword',
};

class UserSelfDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `uPassDialog-${Date.now()}`,
  }) {
    const user = userComposer.getCurrentUser();
    const {
      username,
      objectId: userId,
    } = user;

    const inputs = [
      elementCreator.createInput({
        elementId: ids.PASSWORD,
        inputName: 'password',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'PasswordDialog', label: 'password' }),
      }),
      elementCreator.createInput({
        elementId: ids.REPEATPASSWORD,
        inputName: 'repeatPassword',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'PasswordDialog', label: 'repeatPassword' }),
      }),
    ];

    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
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

            userComposer.changePassword({
              userId,
              password: this.getInputValue(ids.PASSWORD),
              callback: ({ error }) => {
                if (error) {
                  console.log(error);

                  return;
                }

                this.removeFromView();
              },
            });
          },
        },
      }),
    ];

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
    ];
    const lowerText = [];

    lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${username}`);

    super({
      elementId,
      lowerButtons,
      upperText,
      lowerText,
      inputs,
      classes: classes.concat(['userSelfDialog']),
    });
  }
}

module.exports = UserSelfDialog;
