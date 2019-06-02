const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const socketManager = require('../../SocketManager');
const aliasComposer = require('./AliasComposer');
const accessCentral = require('../../AccessCentral');

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

    if (userId) {
      return this.handler.getObject({ objectId: userId });
    }

    return {
      followingRooms: [storageManager.getPublicRoomId()],
      accessLevel: accessCentral.AccessLevels.ANONYMOUS,
      objectId: -1,
      aliases: [],
    };
  }

  getCurrentIdentity() {
    const userId = storageManager.getUserId();
    const aliasId = storageManager.getAliasId();

    if (aliasId) {
      return aliasComposer.getAlias({ aliasId });
    }

    if (userId) {
      return this.handler.getObject({ objectId: userId });
    }

    return {};
  }

  getCurrentTeams() {
    const user = this.getCurrentUser();

    return user.partOfTeams;
  }

  createUser({
    user,
    image,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: {
        user,
        image,
      },
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

    if (user) {
      return user.username;
    }

    return '';
  }

  getUser({ userId }) {
    return this.handler.getObject({ objectId: userId });
  }

  getWhisperIdentities({ participantIds = [0, 1] }) {
    const { objectId, aliases } = this.getCurrentUser();

    if (objectId) {
      const users = [
        this.getUser({ userId: participantIds[0] }) || aliasComposer.getAlias({ aliasId: participantIds[0] }),
        this.getUser({ userId: participantIds[1] }) || aliasComposer.getAlias({ aliasId: participantIds[1] }),
      ];
      const userOrder = [];
      const { objectId: oneId } = users[0];

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

  getIdentity({ objectId }) {
    return this.getUser({ userId: objectId }) || aliasComposer.getAlias({ aliasId: objectId });
  }

  getIdentityName({ objectId }) {
    const identity = this.getUser({ userId: objectId }) || aliasComposer.getAlias({ aliasId: objectId });

    if (identity) {
      return identity.aliasName || identity.username;
    }

    return '';
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

  updateUsername({
    userId,
    username,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        userId,
        user: { username },
      },
    });
  }

  updateUser({
    userId,
    user,
    image,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        userId,
        user,
        image,
      },
    });
  }

  getUsers() {
    return this.handler.getObjects({});
  }

  getAllIdentities({ byFullName = false }) {
    const users = this.getUsers();
    const aliases = aliasComposer.getAllAliases();

    return aliases.concat(users).sort((a, b) => {
      const aParam = byFullName
        ? a.fullName.toLowerCase()
        : (a.username || a.aliasName).toLowerCase();
      const bParam = byFullName
        ? b.fullName.toLowerCase()
        : (b.username || b.aliasName).toLowerCase();

      if (aParam < bParam) {
        return -1;
      }

      if (aParam > bParam) {
        return 1;
      }

      return 0;
    });
  }

  getImage(userId) {
    const user = this.getUser({ userId });

    if (user) {
      return user.image;
    }

    const alias = aliasComposer.getAlias({ aliasId: userId });

    if (alias) {
      return alias.image;
    }

    return undefined;
  }
}

const userComposer = new UserComposer();

module.exports = userComposer;
