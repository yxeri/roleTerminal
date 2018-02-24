/*
 Copyright 2018 Aleksandar Jankovic

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

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const labelHandler = require('../../labels/LabelHandler');
const storageManager = require('../../StorageManager');

const cssClasses = {
  subPost: 'subPost',
  post: 'post',
  thread: 'thread',
  threadContent: 'thContent',
  postContainer: 'poContainer',
  subpostContainer: 'subContainer',
  postContent: 'poContent',
  forum: 'forum',
};
const ids = {
  postContent: 'po',
  threadContent: 'th',
  footer: 'ft',
  postContainer: 'poCon',
  subpostContainer: 'subCon',
};
const elementChangeTimeout = 800;

/**
 * Create a header paragraph.
 * @param {Object} params - Parameters.
 * @param {Object} params.object - Thread/post to create a header for.
 * @return {HTMLParagraphElement} Header element.
 */
function createHeader({ object }) {
  const creator = dataHandler.users.getObject({ objectId: object.ownerAliasId || object.ownerId });

  return elementCreator.createParagraph({
    elements: [
      elementCreator.createSpan({ text: creator ? creator.username : object.ownerAliasId || object.ownerId }),
      elementCreator.createSpan({ text: object.customTimeCreated || object.timeCreated }),
      elementCreator.createSpan({ text: object.customLastUpdated || object.lastUpdated }),
    ],
  });
}

/**
 * Create a sub post section.
 * @param {Object} params - Parameters.
 * @param {Object} params.subPost - Sub post to create an element from.
 * @return {HTMLElement} Sub post element.
 */
function createSubPost({ subPost, elementId }) {
  return elementCreator.createSection({
    classes: [cssClasses.subPost],
    elementId: `${elementId}${subPost.objectId}`,
    headerElement: createHeader({ object: subPost }),
    elements: subPost.text.map(lines => elementCreator.createParagraph({
      elements: [elementCreator.createSpan({ text: lines })],
    })),
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
  return elementCreator.createContainer({
    classes: [cssClasses.postContent],
    elementId: `${elementId}${ids.postContent}`,
    elements: post.text.map((lines) => {
      return elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
    }),
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

  if (!ignoreSubPosts) {
    const subPosts = dataHandler.forumPosts.getObjects({
      filter: {
        rules: [
          { paramName: 'parentPostId', paramValue: post.objectId },
        ],
      },
    });

    elements.push(elementCreator.createContainer({
      classes: [cssClasses.subpostContainer],
      elementId: `${fullElementId}${ids.subpostContainer}`,
      elements: subPosts.map((subPost) => {
        return createSubPost({ subPost, elementId });
      }),
    }));
  }

  return elementCreator.createSection({
    elements,
    classes: [cssClasses.post],
    elementId: fullElementId,
    headerElement: createHeader({ object: post }),
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
        elements: [elementCreator.createSpan({ text: thread.title })],
      }),
      createHeader({ object: thread }),
    ],
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
  return elementCreator.createContainer({
    classes: [cssClasses.threadContent],
    elementId: `${elementId}${ids.threadContent}`,
    elements: thread.text.map((lines) => {
      return elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
    }),
  });
}

/**
 * Create a thread article. It will include any posts connected to the thread.
 * @param {Object} params - Parameters.
 * @param {Object} params.thread - Thread to create an element from.
 * @return {HTMLElement} Thread element.
 */
function createThread({
  thread,
  elementId,
}) {
  const { objectId: threadId } = thread;
  const posts = dataHandler.forumPosts.getObjects({
    filter: {
      rules: [
        { paramName: 'threadId', paramValue: threadId },
      ],
    },
  }).filter(post => !post.parentPostId);
  const elements = [];
  const fullElementId = `${elementId}${threadId}`;

  elements.push(createThreadContent({
    thread,
    elementId: fullElementId,
  }));

  if (posts && posts.length > 0) {
    elements.push(elementCreator.createContainer({
      classes: [cssClasses.postContainer],
      elementId: `${fullElementId}${ids.postContainer}`,
      elements: posts.map((post) => {
        return createPost({ post, elementId });
      }),
    }));
  }

  return elementCreator.createArticle({
    elements,
    headerElement: createThreadHeader({ thread }),
    elementId: fullElementId,
    classes: [cssClasses.thread],
  });
}

class ForumView extends BaseView {
  constructor({
    lockedToForum = false,
    classes = [],
    elementId = `fView-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['forumView']),
    });

    if (!lockedToForum) {
      eventCentral.addWatcher({
        event: eventCentral.Events.SWITCH_FORUM,
        func: ({ forum }) => {
          this.showForum({ forumId: forum.objectId });
        },
      });
    }

    eventCentral.addWatcher({
      event: eventCentral.Events.FORUMTHREAD,
      func: ({ thread, changeType}) => {
        const { objectId } = thread;

        switch (changeType) {
          case socketManager.ChangeTypes.UPDATE: {
            this.updateThread({ thread });

            break;
          }
          case socketManager.ChangeTypes.CREATE: {
            const newThread = createThread({ thread, elementId: this.elementId });

            this.element.insertBefore(newThread, this.element.firstElementChild);

            break;
          }
          case socketManager.ChangeTypes.REMOVE: {
            const toRemove = this.getElement(thread.objectId);

            toRemove.classList.add(cssClasses.removeListItem);

            setTimeout(() => {
              this.element.removeChild(this.getElement(objectId));
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
        const { parentPostId, objectId } = post;

        switch (changeType) {
          case socketManager.ChangeTypes.UPDATE: {
            this.updatePost({ post });

            break;
          }
          case socketManager.ChangeTypes.CREATE: {
            if (parentPostId) {
              const newPost = createSubPost({ subPost: post, elementId: this.elementId });
              const parentPost = this.getElement({ objectId: parentPostId });

              parentPost.appendChild(newPost);
            } else {
              const newPost = createPost({ post, elementId: this.elementId });
              const postContainer = this.getElement({ objectId: `${post.threadId}${ids.postContainer}` });

              postContainer.insertBefore(newPost, postContainer.lastElementChild);
            }

            break;
          }
          case socketManager.ChangeTypes.REMOVE: {
            const toRemove = this.getElement(objectId);
            const thread = this.getElement({ objectId: post.threadId });

            toRemove.classList.add(cssClasses.removeListItem);

            setTimeout(() => {
              thread.removeChild(this.getElement(objectId));
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

    this.showForum({ forumId: storageManager.getCurrentForum() });
  }

  updateForum({ forum }) {

  }

  updateThread({ thread }) {
    const existingThread = this.getElement({ objectId: thread.objectId });
    const threadContent = this.getElement({ objectId: `${thread.objectId}${ids.threadContent}` });

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
    const existingPost = this.getElement({ objectId: post.objectId });
    const postContent = this.getElement({ objectId: `${post.objectId}${ids.postContent}` });

    if (post.parentPostId) {

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

  getElement({ objectId }) {
    return document.getElementById(`${this.elementId}${objectId}`);
  }

  showForum({ forumId }) {
    const dependencies = [
      dataHandler.forums,
      dataHandler.forumPosts,
      dataHandler.forumThreads,
      dataHandler.users,
      dataHandler.teams,
    ];

    if (!dependencies.every(dependency => dependency.hasFetched)) {
      setTimeout(() => {
        this.showForum({ forumId });
      }, 200);

      return;
    }

    const forum = dataHandler.forums.getObject({ objectId: forumId });

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

    const threads = dataHandler.forumThreads.getObjects({
      filter: {
        rules: [
          { paramName: 'forumId', paramValue: forumId },
        ],
      },
    });
    const forumElements = [];

    forum.text.forEach((lines) => {
      elementCreator.createParagraph({ elements: [elementCreator.createSpan({ text: lines })] });
    });

    threads.forEach((thread) => {
      forumElements.push(createThread({ thread, elementId: this.elementId }));
    });

    this.replaceOnParent({
      element: elementCreator.createArticle({
        classes: [cssClasses.forum],
        elementId: this.elementId,
        elements: forumElements,
        headerElement: elementCreator.createParagraph({
          elements: [elementCreator.createSpan({ text: forum.title })],
        }),
      }),
    });
  }
}

/**
 * article forum
 *   article thread
 *     section post
 *       section sub-post
 */

/**
 * ul forum
 *   li
 *   ul thread
 *     li
 *     ul post
 *       li
 *       ul subpost
 *         li
 */

/**
 * Forum
 *   Thread
 *     Post
 *       Sub-post
 *   Thread
 *     Post
 */

module.exports = ForumView;
