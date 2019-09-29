const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');

class ForumComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.forums,
      completionEvent: eventCentral.Events.COMPLETE_FORUM,
      dependencies: [
        dataHandler.forums,
        dataHandler.forumPosts,
        dataHandler.forumThreads,
        dataHandler.users,
        dataHandler.teams,
      ],
    });

    this.forumPostHandler = dataHandler.forumPosts;
    this.forumThreadHandler = dataHandler.forumThreads;
    this.forumHandler = dataHandler.forums;
  }

  getSubPosts({ parentPostId }) {
    return this.forumPostHandler.getObjects({
      filter: {
        rules: [
          { paramName: 'parentPostId', paramValue: parentPostId },
        ],
      },
    });
  }

  getPost({ postId, full = true }) {
    const post = this.forumPostHandler.getObject({ objectId: postId });

    if (post) {
      if (post.parentPostId && full) {
        post.subPosts = this.getSubPosts({ parentPostId: postId });
      }
    }

    return post;
  }

  getPostsByThread({
    threadId,
    sorting = {
      paramName: 'customTimeCreated',
      fallbackParamName: 'timeCreated',
    },
    full = true,
  }) {
    const allPosts = this.forumPostHandler.getObjects({
      sorting,
      filter: {
        rules: [
          { paramName: 'threadId', paramValue: threadId },
        ],
      },
    });

    if (full) {
      const subPosts = [];
      const basePosts = allPosts.filter((post) => {
        if (post.parentPostId) {
          subPosts.push(post);

          return false;
        }

        return true;
      });

      return basePosts.map((post) => {
        const modifiedPost = post;
        modifiedPost.subPosts = subPosts.filter(subPost => subPost.parentPostId === modifiedPost.objectId);

        return modifiedPost;
      });
    }

    return allPosts;
  }

  getThread({ threadId, full = true }) {
    const thread = this.forumThreadHandler.getObject({ objectId: threadId });

    if (thread && full) {
      thread.posts = this.getPostsByThread({});
    }

    return thread;
  }

  getThreadsByForum({
    forumId,
    full = true,
    sorting = {
      reverse: true,
      paramName: 'customLastUpdated',
      fallbackParamName: 'lastUpdated',
    },
  }) {
    const threads = this.forumThreadHandler.getObjects({
      sorting,
      filter: {
        rules: [
          { paramName: 'forumId', paramValue: forumId },
        ],
      },
    });

    if (full) {
      return threads.map((thread) => {
        const fullThread = thread;

        fullThread.posts = this.getPostsByThread({ threadId: thread.objectId });

        return fullThread;
      });
    }

    return threads;
  }

  getForum({
    forumId,
    full = true,
  }) {
    const forum = this.handler.getObject({ objectId: forumId });

    if (forum && full) {
      forum.threads = this.getThreadsByForum({ forumId });
    }

    return forum;
  }

  createPost({ post, callback }) {
    const aliasId = storageManager.getAliasId();
    const postToSend = post;

    postToSend.ownerAliasId = aliasId;

    this.forumPostHandler.createObject({
      callback,
      params: { post: postToSend },
    });
  }

  createThread({ thread, callback }) {
    const aliasId = storageManager.getAliasId();
    const threadToSend = thread;

    threadToSend.ownerAliasId = aliasId;

    this.forumThreadHandler.createObject({
      callback,
      params: { thread: threadToSend },
    });
  }

  removeThread({
    threadId,
    callback,
  }) {
    this.forumThreadHandler.removeObject({
      callback,
      params: { threadId },
    });
  }

  removePost({
    postId,
    callback,
  }) {
    this.forumPostHandler.removeObject({
      callback,
      params: { postId },
    });
  }

  updatePost({
    post,
    postId,
    callback,
  }) {
    this.forumPostHandler.updateObject({
      callback,
      params: {
        postId,
        post,
      },
    });
  }

  updateThread({
    thread,
    threadId,
    callback,
  }) {
    this.forumThreadHandler.updateObject({
      callback,
      params: {
        threadId,
        thread,
      },
    });
  }

  updateForum({
    forum,
    forumId,
    callback,
  }) {
    this.forumHandler.updateObject({
      callback,
      params: {
        forumId,
        forum,
      },
    });
  }
}

const forumComposer = new ForumComposer();

module.exports = forumComposer;
