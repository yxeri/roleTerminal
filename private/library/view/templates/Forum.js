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
const textTools = require('../../TextTools');

function createButton({ text, func }) {
  const buttonContainer = elementCreator.createContainer({ classes: ['button'], func });
  buttonContainer.appendChild(elementCreator.createContainer({ classes: ['buttonLeftCorner'] }));
  buttonContainer.appendChild(elementCreator.createContainer({ classes: ['buttonUpperRightCorner'] }));
  buttonContainer.appendChild(elementCreator.createSpan({ text }));

  return buttonContainer;
}

function createPostButton({ parentElement, text, isSubReply, threadId, parentPostId }) {
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
                parentPostId,
                threadId,
                ownerAliasId: storageManager.getSelectedAlias(),
                text: threadBox.inputs.find(({ inputName }) => inputName === 'text').inputElement.value.split('\n'),
              };

              socketManager.emitEvent('createForumPost', { post: postToCreate }, (threadData) => {
                if (threadData.error) {
                  console.log(threadData.error);

                  return;
                }

                threadBox.removeView();

                const createdPost = threadData.data.post;

                eventCentral.triggerEvent({
                  event: eventCentral.Events.FORUMPOSTS,
                  params: { posts: [createdPost], shouldScroll: true },
                });
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

function createPost({ post, parentElement, hasSubPosts }) {
  const postContainer = elementCreator.createContainer({ classes: ['forumPost'], elementId: post.postId || post._id });
  const postTextContainer = elementCreator.createContainer({ classes: ['forumText'] });
  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: post.ownerId }));

  if (post.lastUpdated !== post.timeCreated) {
    const lastUpdated = textTools.generateTimeStamp({ date: post.lastUpdated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime}` }));
  } else {
    const timeCreated = textTools.generateTimeStamp({ date: post.timeCreated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime}` }));
  }

  postTextContainer.appendChild(userContainer);

  post.text.forEach((textParagraph) => {
    postTextContainer.appendChild(elementCreator.createParagraph({ text: textParagraph }));
  });

  postTextContainer.appendChild(elementCreator.createContainer({ classes: ['leftCorner'] }));
  postTextContainer.appendChild(elementCreator.createContainer({ classes: ['upperRightCorner'] }));
  postContainer.appendChild(postTextContainer);

  if (!hasSubPosts) {
    postTextContainer.appendChild(elementCreator.createContainer({ classes: ['rightCorner'] }));

    const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });
    createContainer.appendChild(createPostButton({
      parentElement,
      parentPostId: post.postId || post._id,
      threadId: post.threadId,
      isSubReply: true,
      text: 'sub_reply',
    }));

    postContainer.appendChild(createContainer);
  }

  return postContainer;
}

function createSubPost({ post }) {
  const subContainer = elementCreator.createContainer({ classes: ['forumSubPost'], elementId: post.postId || post._id });
  const subPostTextContainer = elementCreator.createContainer({ classes: ['forumText'] });
  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: post.ownerId }));

  if (post.lastUpdated !== post.timeCreated) {
    const lastUpdated = textTools.generateTimeStamp({ date: post.lastUpdated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime}` }));
  } else {
    const timeCreated = textTools.generateTimeStamp({ date: post.timeCreated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime}` }));
  }

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
  const threadContainer = elementCreator.createContainer({ classes: ['forumThread'], elementId: thread.threadId || thread._id });
  const threadTextContainer = elementCreator.createContainer({ classes: ['threadStarter', 'hide'] });

  const createContainer = elementCreator.createContainer({ classes: ['createButtons', 'hide'] });
  const postButton = createPostButton({ parentElement, text: 'reply', threadId: thread.threadId || thread._id });

  const userContainer = elementCreator.createContainer({ classes: ['forumUser'] });

  userContainer.appendChild(elementCreator.createSpan({ text: thread.ownerId }));

  if (thread.lastUpdated !== thread.timeCreated) {
    const lastUpdated = textTools.generateTimeStamp({ date: thread.lastUpdated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${lastUpdated.halfTime}` }));
  } else {
    const timeCreated = textTools.generateTimeStamp({ date: thread.timeCreated });

    userContainer.appendChild(elementCreator.createSpan({ text: ` - ${timeCreated.halfTime}` }));
  }

  threadTextContainer.appendChild(userContainer);

  thread.text.forEach((textParagraph) => {
    threadTextContainer.appendChild(elementCreator.createParagraph({ text: textParagraph }));
  });

  const titleContainer = elementCreator.createContainer({
    classes: ['forumTitle'],
    func: () => {
      Array.from(threadContainer.children).forEach((child, index) => {
        if (index > 0) {
          child.classList.toggle('hide');
        }
      });
    },
  });
  titleContainer.appendChild(elementCreator.createSpan({ text: thread.title }));
  titleContainer.appendChild(elementCreator.createContainer({ classes: ['titleUpperRightCorner'] }));

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
                forumId: forumKey,
                ownerAliasId: storageManager.getSelectedAlias(),
                title: threadBox.inputs.find(({ inputName }) => inputName === 'title').inputElement.value,
                text: threadBox.inputs.find(({ inputName }) => inputName === 'text').inputElement.value.split('\n'),
              };

              socketManager.emitEvent('createForumThread', { thread: threadToCreate }, (threadData) => {
                if (threadData.error) {
                  console.log(threadData.error);

                  return;
                }

                threadBox.removeView();

                const thread = threadData.data.thread;

                eventCentral.triggerEvent({
                  event: eventCentral.Events.FORUMTHREADS,
                  params: { threads: [thread] },
                });
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
          maxLength: 50,
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

    this.forumId = 0;
    this.devSpan = elementCreator.createSpan({ text: '' });
    this.element.appendChild(this.devSpan);

    eventCentral.addWatcher({
      event: eventCentral.Events.SERVERMODE,
      func: ({ showDevInfo, mode }) => {
        if (showDevInfo || mode === 'dev') {
          const devSpan = elementCreator.createSpan({
            text: 'TEST SERVER! THIS WILL NOT BE USED IN-GAME. You can experiment as much as you want. Data may be deleted. Save a copy of everything you want to keep.',
            classes: ['devInfo'],
          });

          this.devSpan.innerHTML = '';
          this.devSpan.appendChild(devSpan);
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.FORUMTHREADS,
      func: ({ threads }) => {
        threads.forEach((thread) => {
          const forumElement = document.getElementById(thread.forumId);

          const threadElement = createThread({
            thread,
            parentElement: this.element,
          });
          const threadPostsContainer = elementCreator.createContainer({ classes: ['forumPosts', 'hide'], elementId: `posts-${thread.threadId || thread._id}` });

          threadElement.appendChild(threadPostsContainer);
          forumElement.insertBefore(threadElement, forumElement.children[1]);
        });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.FORUMPOSTS,
      func: ({ posts, shouldScroll }) => {
        posts.forEach((post) => {
          const threadPostsContainer = document.getElementById(`posts-${post.threadId}`);
          const parentPostElement = document.getElementById(post.parentPostId);
          let postElement;

          if (post.parentPostId) {
            postElement = createSubPost({
              post,
              parentElement: this.element,
              hasSubPosts: post.subPosts && post.subPosts.length > 0,
            });

            const createContainer = elementCreator.createContainer({ classes: ['createButtons'] });
            createContainer.appendChild(createPostButton({
              parentPostId: post.parentPostId,
              threadId: post.threadId,
              isSubReply: true,
              parentElement: this.element,
              text: 'sub_reply',
            }));

            parentPostElement.firstElementChild.classList.add('notFirst');
            parentPostElement.lastElementChild.lastElementChild.remove();
            postElement.appendChild(createContainer);
            parentPostElement.appendChild(postElement);
          } else {
            postElement = createPost({
              post,
              parentElement: this.element,
              hasSubPosts: post.subPosts && post.subPosts.length > 0,
            });

            threadPostsContainer.appendChild(postElement);
          }

          const threadContainer = document.getElementById(post.threadId);
          const forumContainer = document.getElementById(this.forumId);

          document.getElementById(post.threadId).remove();
          forumContainer.insertBefore(threadContainer, forumContainer.children[1]);

          if (shouldScroll) {
            postElement.scrollIntoView(false);
          }

          postElement.firstElementChild.classList.add('flash');

          setTimeout(() => {
            postElement.firstElementChild.classList.remove('flash');
          }, 700);
        });
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
        this.forumId = forumKey;

        const forum = forums[forumKey];
        const threads = Object.keys(forum.threads)
          .map(threadKey => forum.threads[threadKey])
          .sort((a, b) => {
            const firstDate = new Date(a.lastUpdated);
            const secondDate = new Date(b.lastUpdated);

            if (firstDate > secondDate) {
              return -1;
            }

            return 1;
          });
        const forumContainer = createForum({
          forumKey,
          parentElement: this.element,
        });

        threads.forEach((thread) => {
          const threadContainer = createThread({
            thread,
            parentElement: this.element,
          });

          const threadPostsContainer = elementCreator.createContainer({ classes: ['forumPosts', 'hide'], elementId: `posts-${thread.threadId}` });
          const posts = Object.keys(thread.posts).map(postKey => thread.posts[postKey]);

          posts.forEach((post) => {
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
                    parentPostId: subPost.parentPostId,
                    threadId: subPost.threadId,
                    isSubReply: true,
                    parentElement: this.element,
                    text: 'sub_reply',
                  }));
                  subContainer.appendChild(createContainer);
                }

                postContainer.appendChild(subContainer);
              });
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
