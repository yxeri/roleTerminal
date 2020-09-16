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
import VerifyDialog from './VerifyDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';
import forumComposer from '../../../data/composers/ForumComposer';

const ids = {
  TITLE: 'title',
  TEXT: 'text',
};

class EditForumThreadDialog extends BaseDialog {
  constructor({
    threadId,
    classes = [],
    elementId = `threadDialog-${Date.now()}`,
  }) {
    const thread = forumComposer.getThread({ threadId, full: false });

    const inputs = [
      elementCreator.createInput({
        text: [thread.title],
        elementId: ids.TITLE,
        inputName: 'title',
        type: 'text',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'ForumDialog', label: 'title' }),
      }),
      elementCreator.createInput({
        text: thread.text,
        elementId: ids.TEXT,
        inputName: 'text',
        type: 'text',
        maxLength: 600,
        multiLine: true,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'ForumDialog', label: 'text' }),
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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'remove' }),
        clickFuncs: {
          leftFunc: () => {
            const parentElement = this.getParentElement();

            const verifyDialog = new VerifyDialog({
              callback: ({ confirmed }) => {
                if (!confirmed) {
                  this.addToView({
                    element: parentElement,
                  });

                  return;
                }

                forumComposer.removeThread({
                  threadId,
                  callback: ({ error: threadError }) => {
                    if (threadError) {
                      console.log('Forum thread error', threadError);
                    }

                    verifyDialog.removeFromView();
                  },
                });
              },
            });

            verifyDialog.addToView({
              element: this.getParentElement(),
            });

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

            forumComposer.updateThread({
              threadId,
              thread: {
                title: this.getInputValue(ids.TITLE),
                text: this.getInputValue(ids.TEXT).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  switch (error.type) {
                    case 'invalid length': {
                      switch (error.extraData.param) {
                        case 'title': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'title' })] });

                          return;
                        }
                        case 'text': {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'text' })] });

                          return;
                        }
                        default: {
                          this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'InvalidLengthError', label: 'general' })] });

                          return;
                        }
                      }
                    }
                    default: {
                      this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'Error', label: 'general' })] });

                      return;
                    }
                  }
                }

                this.removeFromView();
              },
            });
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      classes: classes.concat(['ForumThreadDialog']),
    });
  }
}

export default EditForumThreadDialog;
