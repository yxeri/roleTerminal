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
  TEXT: 'text',
};

class EditForumPostDialog extends BaseDialog {
  constructor({
    postId,
    classes = [],
    elementId = `postDialog-${Date.now()}`,
  }) {
    const post = forumComposer.getPost({ postId, full: false });

    const inputs = [
      elementCreator.createInput({
        text: post.text,
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

                forumComposer.removePost({
                  postId,
                  callback: ({ error: postError }) => {
                    if (postError) {
                      console.log('Forum post error', postError);
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

            forumComposer.updatePost({
              postId,
              post: {
                text: this.getInputValue(ids.TEXT).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  switch (error.type) {
                    case 'invalid length': {
                      switch (error.extraData.param) {
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
      classes: classes.concat(['ForumPostDialog']),
    });
  }
}

export default EditForumPostDialog;
