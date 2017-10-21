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

const View = require('../base/View');
const DialogBox = require('../DialogBox');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
// const textTools = require('../../TextTools');

function createButton({ text, func }) {
  const buttonContainer = elementCreator.createContainer({ classes: ['button'], func });
  buttonContainer.appendChild(elementCreator.createContainer({ classes: ['buttonLeftCorner'] }));
  buttonContainer.appendChild(elementCreator.createContainer({ classes: ['buttonUpperRightCorner'] }));
  buttonContainer.appendChild(elementCreator.createSpan({ text }));

  return buttonContainer;
}

function createPost({ post, hasSubPosts }) {
  const postContainer = elementCreator.createContainer({ classes: ['forumPost'], elementId: post.postId });
  const postTextContainer = elementCreator.createContainer({ classes: ['forumText'] });
  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: post.ownerId }));

  // if (post.lastUpdated !== post.timeCreated) {
  //   const lastUpdated = textTools.generateTimeStamp({ date: post.lastUpdated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime} ${lastUpdated.fullDate}` }));
  // } else {
  //   const timeCreated = textTools.generateTimeStamp({ date: post.timeCreated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime} ${timeCreated.fullDate}` }));
  // }

  postTextContainer.appendChild(userContainer);

  post.text.forEach((textParagraph) => {
    postTextContainer.appendChild(elementCreator.createParagraph({ text: textParagraph }));
  });

  if (!hasSubPosts) {
    postTextContainer.appendChild(elementCreator.createContainer({ classes: ['rightCorner'] }));
  }

  postTextContainer.appendChild(elementCreator.createContainer({ classes: ['leftCorner'] }));
  postTextContainer.appendChild(elementCreator.createContainer({ classes: ['upperRightCorner'] }));

  postContainer.appendChild(postTextContainer);

  return postContainer;
}

function createPostButton({ parentElement, text, isSubReply }) {
  return createButton({
    text,
    func: () => {
      const threadBox = new DialogBox({
        buttons: {
          left: {
            text: 'cancel',
            eventFunc: () => { threadBox.removeView(); },
          },
          right: {
            text: 'create',
            eventFunc: () => {
              const emptyFields = threadBox.markEmptyFields();

              if (emptyFields) {
                threadBox.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                return;
              }

              const postToCreate = {
                title: threadBox.inputs.find(({ inputName }) => inputName === 'title').inputElement.value,
                text: threadBox.inputs.find(({ inputName }) => inputName === 'text').inputElement.value.split('\n'),
              };

              socketManager.emitEvent('createForumPost', { post: postToCreate }, (threadData) => {
                if (threadData.error) {
                  console.log(threadData.error);

                  return;
                }

                const createdPost = threadData.data.post;
                const postElement = createPost({
                  parentElement,
                  post: createdPost,
                  hasSubPosts: createdPost.subPosts.length > 0,
                });
                const threadElement = document.getElementById(createdPost.threadId);
                const parentPostElement = document.getElementById(createdPost.postId);

                if (parentPostElement) {
                  parentPostElement.appendChild(postElement);
                } else {
                  threadElement.appendChild(postElement);
                }

                threadBox.removeView();
              });
            },
          },
        },
        description: [
          isSubReply ? 'Reply to a comment in the topic' : 'Reply to the topic',
          'Derailing a topic will get you booted to Shadowcell',
          `Handle: ${storageManager.getSelectedAlias() || storageManager.getUserName()}`,
        ],
        extraDescription: [],
        inputs: [{
          placeholder: 'Title',
          inputName: 'title',
          isRequired: true,
          maxLength: 20,
        }, {
          placeholder: 'Text',
          inputName: 'text',
          type: 'textarea',
          isRequired: true,
          maxLength: 2500,
          multiLine: true,
        }],
      });

      threadBox.appendTo(parentElement);
    },
  });
}

function createSubPost({ post }) {
  const subContainer = elementCreator.createContainer({ classes: ['forumSubPost'], elementId: post.postId });
  const subPostTextContainer = elementCreator.createContainer({ classes: ['forumText'] });
  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: post.ownerId }));

  // if (post.lastUpdated !== post.timeCreated) {
  //   const lastUpdated = textTools.generateTimeStamp({ date: post.lastUpdated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime} ${lastUpdated.fullDate}` }));
  // } else {
  //   const timeCreated = textTools.generateTimeStamp({ date: post.timeCreated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime} ${timeCreated.fullDate}` }));
  // }

  subPostTextContainer.appendChild(userContainer);

  post.text.forEach((textParagraph) => {
    subPostTextContainer.appendChild(elementCreator.createParagraph({ text: textParagraph }));
  });

  subPostTextContainer.appendChild(elementCreator.createContainer({ classes: ['leftCorner'] }));
  subPostTextContainer.appendChild(elementCreator.createContainer({ classes: ['rightCorner'] }));

  subContainer.appendChild(subPostTextContainer);

  return subContainer;
}

function createThread({ thread, parentElement }) {
  const threadContainer = elementCreator.createContainer({ classes: ['forumThread'], elementId: thread.threadId });
  const threadTextContainer = elementCreator.createContainer({ classes: ['threadStarter'] });

  const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });
  const postButton = createPostButton({ parentElement, text: 'reply' });

  const titleContainer = elementCreator.createContainer({ classes: ['forumTitle'] });
  titleContainer.appendChild(elementCreator.createSpan({ text: thread.title }));
  titleContainer.appendChild(elementCreator.createContainer({ classes: ['titleUpperRightCorner'] }));

  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: thread.ownerId }));

  // if (thread.lastUpdated !== thread.timeCreated) {
  //   const lastUpdated = textTools.generateTimeStamp({ date: thread.lastUpdated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime} ${lastUpdated.fullDate}` }));
  // } else {
  //   const timeCreated = textTools.generateTimeStamp({ date: thread.timeCreated });
  //
  //   userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime} ${timeCreated.fullDate}` }));
  // }

  threadTextContainer.appendChild(userContainer);

  thread.text.forEach((textParagraph) => {
    threadTextContainer.appendChild(elementCreator.createParagraph({ text: textParagraph }));
  });

  threadTextContainer.appendChild(elementCreator.createContainer({ classes: ['upperRightCorner'] }));
  createContainer.appendChild(postButton);
  threadContainer.appendChild(titleContainer);
  threadContainer.appendChild(threadTextContainer);
  threadContainer.appendChild(createContainer);

  return threadContainer;
}

function createForum({ forumKey, parentElement }) {
  const forumContainer = elementCreator.createContainer({ classes: ['forum'], elementId: forumKey });

  const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });
  const createThreadButton = createButton({
    text: 'new_topic',
    func: () => {
      const threadBox = new DialogBox({
        buttons: {
          left: {
            text: 'cancel',
            eventFunc: () => { threadBox.removeView(); },
          },
          right: {
            text: 'create',
            eventFunc: () => {
              const emptyFields = threadBox.markEmptyFields();

              if (emptyFields) {
                threadBox.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                return;
              }

              const threadToCreate = {
                title: threadBox.inputs.find(({ inputName }) => inputName === 'title').inputElement.value,
                text: threadBox.inputs.find(({ inputName }) => inputName === 'text').inputElement.value.split('\n'),
              };

              socketManager.emitEvent('createForumThread', { thread: threadToCreate }, (threadData) => {
                if (threadData.error) {
                  console.log(threadData.error);

                  return;
                }

                const thread = threadData.data.thread;
                const forumElement = document.getElementById(thread.forumId);

                const threadElement = createThread({ thread });

                forumElement.insertBefore(threadElement, forumElement.children[1]);

                threadBox.removeView();
              });
            },
          },
        },
        description: [
          'Create a new topic',
          `Handle: ${storageManager.getSelectedAlias() || storageManager.getUserName()}`,
        ],
        extraDescription: [],
        inputs: [{
          placeholder: 'Title',
          inputName: 'title',
          isRequired: true,
          maxLength: 20,
        }, {
          placeholder: 'Text',
          inputName: 'text',
          type: 'textarea',
          isRequired: true,
          maxLength: 2500,
          multiLine: true,
        }],
      });

      threadBox.appendTo(parentElement);
    },
  });

  createContainer.appendChild(createThreadButton);
  forumContainer.appendChild(createContainer);

  return forumContainer;
}

class Forum extends View {
  constructor() {
    super({ isFullscreen: true });

    this.forum = {};
    this.forumThreads = [];
    this.forumContainer = document.createElement('div');
    this.expandedThreads = [];

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.FORUMTHREADS,
      func: ({ forumThreads }) => {

      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.FORUMPOSTS,
      func: ({ forumPosts }) => {

      },
    });

    this.buildForums();
  }

  buildForums() {
    socketManager.emitEvent('getCompleteForums', {}, ({ data, error }) => {
      if (error) {
        console.log(error);

        return;
      }

      const forums = data.forums;
      const fragment = document.createDocumentFragment();

      Object.keys(forums).forEach((forumKey) => {
        const forum = forums[forumKey];
        const threads = Object.keys(forum.threads).map(threadKey => forum.threads[threadKey]);
        const forumContainer = createForum({
          forumKey,
          parentElement: this.element,
        });

        threads.forEach((thread) => {
          const threadContainer = createThread({
            thread,
            parentElement: this.element,
          });

          const threadPostsContainer = elementCreator.createContainer({ classes: ['forumPosts'] });
          const posts = Object.keys(thread.posts).map(postKey => thread.posts[postKey]);

          posts.forEach((post, index) => {
            const subPosts = Object.keys(post.subPosts).map(postKey => post.subPosts[postKey]);
            const postContainer = createPost({
              post,
              hasSubPosts: subPosts.length > 0,
              parentElement: this.element,
            });

            if (subPosts.length > 0) {
              subPosts.forEach((subPost, subIndex) => {
                const subContainer = createSubPost({
                  post: subPost,
                  parentElement: this.element,
                });

                if (subPosts.length === (subIndex + 1)) {
                  const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });

                  createContainer.appendChild(createPostButton({
                    isSubReply: true,
                    parentElement: this.element,
                    text: 'sub_reply',
                  }));
                  subContainer.appendChild(createContainer);
                }

                postContainer.appendChild(subContainer);
              });
            } else if (posts.length === (index + 1)) {
              const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });

              createContainer.appendChild(createPostButton({
                isSubReply: true,
                text: 'sub_reply',
                parentElement: this.element,
              }));
              postContainer.appendChild(createContainer);
            }

            threadPostsContainer.appendChild(postContainer);
          });

          threadContainer.appendChild(threadPostsContainer);
          forumContainer.appendChild(threadContainer);
        });

        fragment.appendChild(forumContainer);
      });

      this.element.appendChild(fragment);
    });
  }
}

module.exports = Forum;
