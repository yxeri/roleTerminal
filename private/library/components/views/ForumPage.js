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

const BaseView = require('./BaseView');
const EditForumThreadDialog = require('./dialogs/EditForumThreadDialog');
const EditForumPostDialog = require('./dialogs/EditForumPostDialog');
const ForumThreadDialog = require('./dialogs/ForumThreadDialog');
const ForumPostDialog = require('./dialogs/ForumPostDialog');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const labelHandler = require('../../labels/LabelHandler');
const storageManager = require('../../StorageManager');
const textTools = require('../../TextTools');
const forumComposer = require('../../data/composers/ForumComposer');
const dataHandler = require('../../data/DataHandler');
const accessCentral = require('../../AccessCentral');
const userComposer = require('../../data/composers/UserComposer');
const viewSwitcher = require('../../ViewSwitcher');

const cssClasses = {
  subPost: 'subPost',
  post: 'post',
  thread: 'thread',
  threadContent: 'threadContent',
  postContainer: 'postContainer',
  subpostContainer: 'subContainer',
  postContent: 'postContent',
  forum: 'forum',
  forumContent: 'forumContent',
  forumInfo: 'forumInfo',
  username: 'username',
  timeCreated: 'timeCreated',
  lastUpdated: 'lastUpdated',
  likes: 'likes',
  timestamp: 'timestamp',
  pictureContainer: 'pictureContainer',
  contentEnd: 'contentEnd',
  threadContainer: 'threadContainer',
  removeListItem: 'removeListItem',
  newThreadButton: 'newThreadButton',
  newPostButton: 'newPostButton',
  newSubPostButton: 'newSubPostButton',
};
const ids = {
  postContent: 'poCon',
  threadContent: 'thCon',
  footer: 'footer',
  postContainer: 'poContainer',
  subpostContainer: 'suContainer',
  forumContent: 'foCon',
  contentEnd: 'coEnd',
  threadContainer: 'thContainer',
};
const elementChangeTimeout = 800;
let disableVoting = false;
let disablePictures = false;

/**
 * Create a picture container.
 * @param {Object} params - Parameters.
 * @param {Object} params.object - Post/thread/subpost that contains pictures.
 * @return {HTMLElement} Container with the pictures.
 */
function createPictureContainer({ object }) {
  return elementCreator.createContainer({
    classes: [cssClasses.pictureContainer],
    elements: object.pictures.map(picture => elementCreator.createPicture({ picture })),
  });
}

/**
 * Create a header paragraph.
 * @param {Object} params - Parameters.
 * @param {Object} params.object - Thread/post to create a header for.
 * @return {HTMLElement} Header element.
 */
function createHeader({ object }) {
  return elementCreator.createParagraph({
    classes: [cssClasses.forumInfo],
    elements: [
      elementCreator.createSpan({
        classes: [cssClasses.username],
        text: object.creatorName || userComposer.getIdentityName({ objectId: object.ownerAliasId || object.ownerId }),
      }),
    ],
  });
}

/**
 * Create human-readable dates for when the item was created and last updated.
 * @param {Object} params - Parameters.
 * @param {Object} params.object - Post/subpost/thread.
 * @return {HTMLElement} Paragraph with dates.
 */
function createTimestamp({ object }) {
  const timeCreated = object.customTimeCreated || object.timeCreated;
  const lastUpdated = object.customLastUpdated || object.lastUpdated;
  const timeCreatedStamp = textTools.generateTimestamp({ date: timeCreated });
  const lastUpdatedStamp = textTools.generateTimestamp({ date: lastUpdated });
  const elements = [
    elementCreator.createSpan({
      classes: [cssClasses.timeCreated],
      text: `${labelHandler.getLabel({ baseObject: 'ForumView', label: 'timeCreated', appendSpace: true })}${timeCreatedStamp.fullDate}`,
    }),
  ];

  if (timeCreated !== lastUpdated) {
    elements.push(elementCreator.createSpan({
      classes: [cssClasses.lastUpdated],
      text: `${labelHandler.getLabel({ baseObject: 'ForumView', label: 'lastUpdated', appendSpace: true })}${lastUpdatedStamp.fullDate}`,
    }));
  }

  return elementCreator.createParagraph({ elements });
}

/**
 * Create element that will be added to the end of the content.
 * @param {Object} params - Parameters.
 * @param {Object} params.object - Object to use to create the content end.
 * @return {HTMLElement} Paragraph.
 */
function createContentEnd({ object }) {
  const timeStamp = createTimestamp({ object });

  timeStamp.classList.add(cssClasses.contentEnd);
  timeStamp.setAttribute('id', ids.contentEnd);

  if (!disableVoting) {
    timeStamp.insertBefore(elementCreator.createSpan({
      classes: [cssClasses.likes],
      text: `${object.likes}${labelHandler.getLabel({ baseObject: 'ForumView', label: 'likes', prependSpace: true })}`,
    }), timeStamp.firstElementChild);
  }

  return timeStamp;
}

/**
 * Create a post header.
 * @param {Object} params - Parameters.
 * @param {Object} params.post - Post to create a header for.
 * @return {HTMLElement} Header container.
 */
function createPostHeader({ post }) {
  return elementCreator.createContainer({
    elements: [
      createHeader({ object: post }),
    ],
    clickFuncs: {
      leftFunc: () => {
        const {
          hasFullAccess,
        } = accessCentral.hasAccessTo({
          objectToAccess: post,
          toAuth: userComposer.getCurrentUser(),
        });

        if (hasFullAccess) {
          const postDialog = new EditForumPostDialog({
            postId: post.objectId,
          });

          postDialog.addToView({
            element: viewSwitcher.getParentElement(),
          });
        }
      },
    },
  });
}

/**
 * Create a sub post section.
 * @param {Object} params - Parameters.
 * @param {Object} params.subPost - Sub post to create an element from.
 * @return {HTMLElement} Sub post element.
 */
function createSubPost({ subPost, elementId }) {
  const elements = subPost.text.map(lines => elementCreator.createParagraph({
    elements: [elementCreator.createSpan({ text: lines })],
  }));

  if (!disablePictures && subPost.pictures) {
    elements.push(createPictureContainer({ object: subPost }));
  }

  elements.push(createContentEnd({ object: subPost }));

  return elementCreator.createSection({
    elements,
    classes: [cssClasses.subPost],
    elementId: `${elementId}${subPost.objectId}`,
    headerElement: createPostHeader({ post: subPost }),
  });
}

/**
 * Create a post content container.
 * @param {Object} params - Parameters.
 * @param {Object} params.post - Post to create a content container for.
 * @param {string} params.elementId - Base Id of the element.
 * @return {HTMLElement} Thread container.
 */
function createPostContent({ post, elementId }) {
  const elements = post.text.map((lines) => {
    return elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
  });

  if (!disablePictures && post.pictures) {
    elements.push(createPictureContainer({ object: post }));
  }

  elements.push(createContentEnd({ object: post }));

  return elementCreator.createContainer({
    elements,
    classes: [cssClasses.postContent],
    elementId: `${elementId}${ids.postContent}`,
  });
}

/**
 * Create a post section. It will include any sub posts to the post.
 * @param {Object} params - Parameters.
 * @param {Object} params.post - Post to create an element from.
 * @return {HTMLElement} Post element.
 */
function createPost({
  post,
  elementId,
  ignoreSubPosts = false,
}) {
  const elements = [createPostContent({ post, elementId: `${elementId}${post.objectId}` })];
  const fullElementId = `${elementId}${post.objectId}`;
  const { subPosts = [] } = post;

  if (!ignoreSubPosts) {
    elements.push(elementCreator.createContainer({
      classes: [cssClasses.subpostContainer],
      elementId: `${fullElementId}${ids.subpostContainer}`,
      elements: subPosts.map((subPost) => {
        return createSubPost({ subPost, elementId });
      }),
    }));
  }

  if (!post.parentPostId) {
    elements.push(elementCreator.createButton({
      classes: [cssClasses.newSubPostButton],
      text: 'Create sub post',
      clickFuncs: {
        leftFunc: () => {
          const postDialog = new ForumPostDialog({
            threadId: post.threadId,
            parentPostId: post.objectId,
          });

          postDialog.addToView({
            element: viewSwitcher.getParentElement(),
          });
        },
      },
    }));
  }

  return elementCreator.createSection({
    elements,
    classes: [cssClasses.post],
    elementId: fullElementId,
    headerElement: createPostHeader({ post }),
  });
}

/**
 * Create a thread header.
 * @param {Object} params - Parameters.
 * @param {Object} params.thread - Thread to create a header for.
 * @return {HTMLElement} Header container.
 */
function createThreadHeader({ thread }) {
  return elementCreator.createContainer({
    elements: [
      elementCreator.createParagraph({
        elements: [elementCreator.createSpan({ spanType: 'h2', text: thread.title })],
      }),
      createHeader({ object: thread }),
    ],
    clickFuncs: {
      leftFunc: () => {
        const {
          hasFullAccess,
        } = accessCentral.hasAccessTo({
          objectToAccess: thread,
          toAuth: userComposer.getCurrentUser(),
        });

        if (hasFullAccess) {
          const threadDialog = new EditForumThreadDialog({
            threadId: thread.objectId,
          });

          threadDialog.addToView({
            element: viewSwitcher.getParentElement(),
          });
        }
      },
    },
  });
}

/**
 * Create a thread content container.
 * @param {Object} params - Parameters.
 * @param {Object} params.thread - Thread to create a container for.
 * @param {string} params.elementId - Base Id of the element.
 * @return {HTMLElement} Thread container.
 */
function createThreadContent({ thread, elementId }) {
  const elements = thread.text.map((lines) => {
    return elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
  });

  if (!disablePictures && thread.pictures) {
    elements.push(createPictureContainer({ object: thread }));
  }

  elements.push(createContentEnd({ object: thread }));

  return elementCreator.createContainer({
    elements,
    classes: [cssClasses.threadContent],
    elementId: `${elementId}${ids.threadContent}`,
  });
}

/**
 * Create a forum content container.
 * @param {Object} params - Parameters.
 * @param {Object} params.forum - Forum to create a container for.
 * @param {string} params.elementId - Base Id of the element.
 * @return {HTMLElement} Thread container.
 */
function createForumContent({ forum, elementId }) {
  return elementCreator.createContainer({
    classes: [cssClasses.forumContent],
    elementId: `${elementId}${ids.forumContent}`,
    elements: forum.text.map((lines) => {
      return elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
    }),
  });
}

/**
 * Create a thread article. It will include any posts connected to the thread.
 * @param {Object} params - Parameters.
 * @param {string} params.thread - The thread to create an element from.
 * @return {HTMLElement} Thread element.
 */
function createThread({
  thread,
  elementId,
}) {
  const {
    objectId: threadId,
    posts = [],
  } = thread;
  const elements = [];
  const fullElementId = `${elementId}${threadId}`;

  elements.push(createThreadContent({
    thread,
    elementId: fullElementId,
  }));

  elements.push(elementCreator.createButton({
    classes: [cssClasses.newPostButton],
    text: 'Create post',
    clickFuncs: {
      leftFunc: () => {
        const postDialog = new ForumPostDialog({
          threadId,
        });

        postDialog.addToView({
          element: viewSwitcher.getParentElement(),
        });
      },
    },
  }));

  elements.push(elementCreator.createContainer({
    classes: [cssClasses.postContainer],
    elementId: `${fullElementId}${ids.postContainer}`,
    elements: posts.map((post) => {
      return createPost({ post, elementId });
    }),
  }));

  return elementCreator.createArticle({
    elements,
    headerElement: createThreadHeader({ thread }),
    elementId: fullElementId,
    classes: [cssClasses.thread],
  });
}

class ForumView extends BaseView {
  constructor({
    forumId,
    dependencies = [
      dataHandler.users,
      dataHandler.teams,
      dataHandler.aliases,
      dataHandler.forumPosts,
      dataHandler.forums,
      dataHandler.forumThreads,
    ],
    shouldDisableVoting = false,
    lockedToForum = false,
    shouldDisablePictures = false,
    classes = [],
    elementId = `fView-${Date.now()}`,
  }) {
    disableVoting = shouldDisableVoting;
    disablePictures = shouldDisablePictures;

    super({
      elementId,
      classes: classes.concat(['forumView']),
    });

    this.currentForum = forumId;
    this.dependencies = dependencies;

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_FORUM,
      func: () => {
        this.showForum({ forumId: this.getCurrentForumId() });

        if (!lockedToForum) {
          eventCentral.addWatcher({
            event: eventCentral.Events.SWITCH_FORUM,
            func: ({ forum }) => {
              this.currentForum = forum.objectId;

              this.showForum({ forumId: this.getCurrentForumId() });
            },
          });
        }

        eventCentral.addWatcher({
          event: eventCentral.Events.FORUMTHREAD,
          func: ({ thread, changeType }) => {
            if (changeType !== socketManager.ChangeTypes.REMOVE && this.getCurrentForumId() !== thread.forumId) {
              return;
            }

            const { objectId } = thread;

            switch (changeType) {
              case socketManager.ChangeTypes.UPDATE: {
                this.updateThread({ thread });

                break;
              }
              case socketManager.ChangeTypes.CREATE: {
                const threadContainer = this.getElement(ids.threadContainer);
                const newThread = createThread({ thread, elementId: this.elementId });

                threadContainer.insertBefore(newThread, threadContainer.firstElementChild);

                break;
              }
              case socketManager.ChangeTypes.REMOVE: {
                const toRemove = this.getElement(thread.objectId);

                if (!toRemove) {
                  return;
                }

                toRemove.classList.add(cssClasses.removeListItem);

                setTimeout(() => {
                  toRemove.parentElement.removeChild(this.getElement(objectId));
                }, elementChangeTimeout);

                break;
              }
              default: {
                break;
              }
            }
          },
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.FORUMPOST,
          func: ({ post, changeType }) => {
            const parentThread = forumComposer.getThread({ threadId: post.threadId, full: false });

            if (changeType !== socketManager.ChangeTypes.REMOVE && (!parentThread || this.getCurrentForumId() !== parentThread.forumId)) {
              return;
            }

            const { parentPostId, objectId } = post;

            switch (changeType) {
              case socketManager.ChangeTypes.UPDATE: {
                this.updatePost({ post });
                this.updateThread({ thread: forumComposer.getThread({ threadId: post.threadId, full: false }) });

                break;
              }
              case socketManager.ChangeTypes.CREATE: {
                if (parentPostId) {
                  const newPost = createSubPost({ subPost: post, elementId: this.elementId });
                  const parentPostContainer = this.getElement(`${parentPostId}${ids.subpostContainer}`);

                  parentPostContainer.appendChild(newPost);
                } else {
                  const newPost = createPost({ post, elementId: this.elementId });
                  const postContainer = this.getElement(`${post.threadId}${ids.postContainer}`);

                  postContainer.appendChild(newPost);
                }

                this.updateThread({ thread: forumComposer.getThread({ threadId: post.threadId, full: false }) });

                break;
              }
              case socketManager.ChangeTypes.REMOVE: {
                const toRemove = this.getElement(objectId);

                if (!toRemove) {
                  return;
                }

                toRemove.classList.add(cssClasses.removeListItem);

                setTimeout(() => {
                  toRemove.parentElement.removeChild(this.getElement(objectId));
                }, elementChangeTimeout);

                break;
              }
              default: {
                break;
              }
            }
          },
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.FORUM,
          func: ({ forum, changeType }) => {
            if (this.getCurrentForumId() !== forum.objectId) {
              return;
            }

            switch (changeType) {
              case socketManager.ChangeTypes.UPDATE: {
                this.updateForum({ forum });

                break;
              }
              case socketManager.ChangeTypes.REMOVE: {
                this.showForum({ forumId: '' });

                break;
              }
              default: {
                break;
              }
            }
          },
        });
      },
    });
  }

  getCurrentForumId() {
    return this.currentForum || storageManager.getCurrentForum();
  }

  // updateForum({ forum }) {
  //
  // }

  updateThread({ thread }) {
    const existingThread = this.getElement(thread.objectId);
    const threadContent = this.getElement(`${thread.objectId}${ids.threadContent}`);

    existingThread.replaceChild(
      elementCreator.createHeader({ elements: [createThreadHeader({ thread })] }),
      existingThread.getElementsByTagName('header')[0],
    );
    existingThread.replaceChild(
      createThreadContent({ thread, elementId: `${this.elementId}${thread.objectId}` }),
      threadContent,
    );
  }

  updatePost({ post }) {
    const existingPost = this.getElement(post.objectId);
    const postContent = this.getElement(`${post.objectId}${ids.postContent}`);

    if (post.parentPostId) {
      const subContainer = this.getElement(`${post.parentPostId}${ids.subpostContainer}`);

      subContainer.replaceChild(createSubPost({ subPost: post, elementId: this.elementId }), existingPost);
    } else {
      existingPost.replaceChild(
        elementCreator.createHeader({ elements: [createHeader({ object: post })] }),
        existingPost.getElementsByTagName('header')[0],
      );
      existingPost.replaceChild(
        createPostContent({ post, elementId: `${this.elementId}${post.objectId}` }),
        postContent,
      );
    }
  }

  showForum({ forumId }) {
    if (!forumId) {
      return;
    }

    const forum = forumComposer.getForum({ forumId });
    const { threads = [] } = forum;

    if (!forum) {
      this.replaceOnParent({
        element: elementCreator.createArticle({
          elementId: this.elementId,
          headerElement: elementCreator.createParagraph({
            elements: [
              elementCreator.createSpan({ text: labelHandler.getLabel({ baseObject: 'ForumView', label: 'removedForum' }) }),
            ],
          }),
        }),
      });

      return;
    }

    const forumElements = [
      createForumContent({
        forum,
        elementId: this.elementId,
      }),
    ];

    forumElements.push(elementCreator.createButton({
      classes: [cssClasses.newThreadButton],
      text: 'Create thread',
      clickFuncs: {
        leftFunc: () => {
          const threadDialog = new ForumThreadDialog({
            forumId: this.getCurrentForumId(),
          });

          threadDialog.addToView({
            element: viewSwitcher.getParentElement(),
          });
        },
      },
    }));

    forumElements.push(elementCreator.createContainer({
      classes: [cssClasses.threadContainer],
      elementId: `${this.elementId}${ids.threadContainer}`,
      elements: threads.map((thread) => {
        return createThread({ thread, elementId: this.elementId });
      }),
    }));

    this.replaceOnParent({
      element: elementCreator.createArticle({
        classes: [cssClasses.forum],
        elementId: this.elementId,
        elements: forumElements,
        headerElement: elementCreator.createParagraph({
          elements: [elementCreator.createSpan({ spanType: 'h1', text: forum.title })],
        }),
      }),
    });
  }
}

module.exports = ForumView;
