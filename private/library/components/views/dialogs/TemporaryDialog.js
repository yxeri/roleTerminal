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

import BaseDialog from './BaseDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';

class TemporaryDialog extends BaseDialog {
  constructor({
    text,
    timeout,
    callback = () => {},
    classes = [],
    elementId = `tempDialog-${Date.now()}`,
  }) {
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'ok' }),
        clickFuncs: {
          leftFunc: () => {
            callback();
            this.removeFromView();
          },
        },
      }),
    ];

    super({
      elementId,
      lowerButtons,
      lowerText: text,
      timeout: timeout || 10000,
      classes: classes.concat(['tempDialog']),
    });
  }
}

export default TemporaryDialog;
