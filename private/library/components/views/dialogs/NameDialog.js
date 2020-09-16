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

import BaseDialog from './BaseDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';
import userComposer from '../../../data/composers/UserComposer';

const ids = {
  USERNAME: 'username',
};

class NameDialog extends BaseDialog {
  constructor({
    user,
    classes = [],
    elementId = `nDialog-${Date.now()}`,
  }) {
    const currentUser = user || userComposer.getCurrentUser();
    const {
      username,
      hasSetName,
      objectId: userId,
    } = currentUser;

    const inputs = [
      elementCreator.createInput({
        elementId: ids.USERNAME,
        inputName: 'username',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'NameDialog', label: 'name' }),
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

            userComposer.updateUsername({
              userId,
              username: this.getInputValue(ids.USERNAME),
              callback: ({ error }) => {
                if (error) {
                  switch (error.type) {
                    case 'already exists': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'exists' })],
                      });

                      break;
                    }
                    default: {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'Error', label: 'general' })],
                      });

                      break;
                    }
                  }

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

    if (hasSetName) {
      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${username}`);
    } else {
      lowerText.push(`${labelHandler.getLabel({ baseObject: 'NameDialog', label: 'setName' })}`);
    }

    super({
      elementId,
      lowerButtons,
      upperText,
      lowerText,
      inputs,
      classes: classes.concat(['nameDialog']),
    });
  }
}

export default NameDialog;
