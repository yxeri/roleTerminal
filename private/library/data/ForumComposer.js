const DataComposer = require('./BaseComposer');

const dataHandler = require('./DataHandler');
const eventCentral = require('../EventCentral');

class ForumComposer extends DataComposer {
  constructor() {
    super({
      completionEvent: eventCentral.Events.COMPLETE_FORUM,
      dependencies: [
        dataHandler.forums,
        dataHandler.forumPosts,
        dataHandler.forumThreads,
        dataHandler.users,
        dataHandler.teams,
      ],
    });
  }

  getSubPosts({ parentPostId }) {
    return dataHandler.forumPosts.getObjects({
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
    const post = dataHandler.forumPosts.getObject({ objectId: postId });

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
    const allPosts = dataHandler.forumPosts.getObjects({
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
    const thread = dataHandler.forumThreads.getObject({ objectId: threadId });

    if (thread) {
      thread.creatorName = this.createCreatorName({ object: thread });

      if (full) {
        thread.posts = this.getPostsByThread({});
      }
    }

    return dataHandler.forumThreads.getObject({ objectId: threadId });
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
    const threads = dataHandler.forumThreads.getObjects({
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
    const forum = dataHandler.forums.getObject({ objectId: forumId });
    console.log('getForum', forumId, forum);

    if (forum) {
      forum.creatorName = this.createCreatorName({ object: forum });

      if (full) {
        forum.threads = this.getThreadsByForum({ forumId });
      }
    }

    return forum;
  }

  static createPost({ post, callback }) {
    dataHandler.forumPosts.createObject({
      callback,
      params: { post },
    });
  }

  static createThread({ thread, callback }) {
    dataHandler.forumThreads.createObject({
      callback,
      params: { thread },
    });
  }
}

const forumComposer = new ForumComposer();

module.exports = forumComposer;
