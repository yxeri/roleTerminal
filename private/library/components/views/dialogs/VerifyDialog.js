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

import elementCreator from '../../../ElementCreator';

const BaseDialog = require('./BaseDialog');

const labelHandler = require('../../../labels/LabelHandler');

class VerifyDialog extends BaseDialog {
  constructor({
    callback,
    text = [],
    classes = [],
    elementId = `vDialog-${Date.now()}`,
  }) {
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => {
            callback({ confirmed: false });

            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'confirm' }),
        clickFuncs: {
          leftFunc: () => {
            callback({ confirmed: true });
          },
        },
      }),
    ];

    super({
      elementId,
      lowerButtons,
      upperText: text,
      lowerText: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'areYouSure' })],
      classes: classes.concat(['VerifyDialog']),
    });
  }
}

module.exports = VerifyDialog;
