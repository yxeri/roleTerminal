const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');

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
  }

  getSubPosts({ parentPostId }) {
    return this.forumPostHandler.getObjects({
      filter: {
        rules: [
          { paramName: 'parentPostId', paramValue: parentPostId },
        ],
      },
    }).map((subPost) => {
      const modifiedSubPost = subPost;
      modifiedSubPost.creatorName = this.createCreatorName({ object: subPost });

      return modifiedSubPost;
    });
  }

  getPost({ postId, full = true }) {
    const post = this.forumPostHandler.getObject({ objectId: postId });

    if (post) {
      post.creatorName = this.createCreatorName({ object: post });

      if (post.parentPostId && full) {
        post.subPosts = this.getSubPosts({ parentPostId: postId });
      }
    }

    return post;
  }

  getPostsByThread({
    threadId,
    sorting,
    full = true,
  }) {
    const allPosts = this.forumPostHandler.getObjects({
      sorting,
      filter: {
        rules: [
          { paramName: 'threadId', paramValue: threadId },
        ],
      },
    }).map((post) => {
      const modifiedPost = post;
      modifiedPost.creatorName = this.createCreatorName({ object: modifiedPost });

      return modifiedPost;
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

    if (thread) {
      thread.creatorName = this.createCreatorName({ object: thread });

      if (full) {
        thread.posts = this.getPostsByThread({});
      }
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
    }).map((thread) => {
      const modifiedThread = thread;
      modifiedThread.creatorName = this.createCreatorName({ object: thread });

      return modifiedThread;
    });

    if (full) {
      return threads.map((thread) => {
        const fullThread = thread;

        fullThread.creatorName = this.createCreatorName({ object: thread });
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

    if (forum) {
      forum.creatorName = this.createCreatorName({ object: forum });

      if (full) {
        forum.threads = this.getThreadsByForum({ forumId });
      }
    }

    return forum;
  }

  createPost({ post, callback }) {
    this.forumPostHandler.createObject({
      callback,
      params: { post },
    });
  }

  createThread({ thread, callback }) {
    this.forumThreadHandler.createObject({
      callback,
      params: { thread },
    });
  }

  removeThread({
    threadId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { threadId },
    });
  }

  removePost({
    postId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { postId },
    });
  }

  updatePost({
    post,
    postId,
    callback,
  }) {
    this.handler.updateObject({
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
    this.handler.updateObject({
      callback,
      params: {
        threadId,
        thread,
      },
    });
  }
}

const forumComposer = new ForumComposer();

module.exports = forumComposer;
