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
import forumComposer from '../../../data/composers/ForumComposer';

const ids = {
  TEXT: 'text',
};

class ForumPostDialog extends BaseDialog {
  constructor({
    threadId,
    parentPostId,
    classes = [],
    elementId = `postDialog-${Date.now()}`,
  }) {
    const parentPost = forumComposer.getPost({ postId: parentPostId || -1, full: false });
    const threadIdToSend = threadId || parentPost.threadId;
    const thread = forumComposer.getThread({ threadId: threadIdToSend, full: false });

    let upperText = [
      `${thread.title}`,
    ].concat(thread.text);

    if (parentPost) {
      upperText = upperText.concat(['Post:'], parentPost.text);
    }

    const inputs = [
      elementCreator.createInput({
        text: [],
        elementId: ids.TEXT,
        inputName: 'text',
        type: 'text',
        maxLength: 600,
        multiLine: true,
        shouldResize: true,
        placeholder: labelHandler.getLabel({ baseObject: 'ForumPostDialog', label: 'text' }),
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
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            forumComposer.createPost({
              post: {
                parentPostId,
                threadId: threadIdToSend,
                text: this.getInputValue(ids.TEXT).split('\n'),
              },
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length' && error.extraData) {
                    switch (error.extraData.param) {
                      case 'title': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'ForumPostDialog', label: 'titleLength' })] });

                        break;
                      }
                      case 'text': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'ForumPostDialog', label: 'textLength' })] });

                        break;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                        break;
                      }
                    }
                  }

                  this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                  return;
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
      upperText,
      classes: classes.concat(['ForumPostDialog']),
    });
  }
}

export default ForumPostDialog;
