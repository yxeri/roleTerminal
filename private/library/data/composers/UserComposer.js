const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const socketManager = require('../../SocketManager');

class UserComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.users,
      completionEvent: eventCentral.Events.COMPLETE_USER,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
    });
  }

  getCurrentUser() {
    const userId = storageManager.getUserId();

    return userId ? this.handler.getObject({ objectId: userId }) : undefined;
  }

  createUser({
    user,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: { user },
    });
  }

  banUser({
    userId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.BANUSER,
      params: {
        banUserId: userId,
      },
    });
  }

  unbanUser({
    userId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UNBANUSER,
      params: {
        bannedUserId: userId,
      },
    });
  }

  verifyUser({
    userId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.VERIFYUSER,
      params: {
        userIdToVerify: userId,
      },
    });
  }

  getUsername({ userId }) {
    const user = this.handler.getObject({ objectId: userId });

    return user ? user.username : '';
  }

  getUser({ userId }) {
    return this.handler.getObject({ objectId: userId });
  }

  getWhisperUsers({ participantIds = [0, 1] }) {
    const { objectId, aliases } = this.getCurrentUser();

    if (objectId) {
      const users = [
        this.getUser({ userId: participantIds[0] }),
        this.getUser({ userId: participantIds[1] }),
      ];
      const userOrder = [];
      const { objectId: oneId } = users[0];

      console.log('whisper', participantIds, users);

      if (oneId === objectId || aliases.includes(oneId)) {
        userOrder.push(users[0]);
        userOrder.push(users[1]);
      } else {
        userOrder.push(users[1]);
        userOrder.push(users[0]);
      }

      return userOrder;
    }

    return [];
  }

  changePassword({
    password,
    userId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.CHANGEPASSWORD,
      params: {
        password,
        userId,
      },
    });
  }

  changeAccessLevel({
    userId,
    accessLevel,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UPDATEUSER,
      params: {
        userId,
        user: { accessLevel },
      },
    });
  }
}

const userComposer = new UserComposer();

module.exports = userComposer;
