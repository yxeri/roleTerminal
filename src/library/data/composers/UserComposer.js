import DataComposer from './BaseComposer';

import {
  users,
  teams,
  aliases,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import storageManager from '../../react/StorageManager';
import aliasComposer from './AliasComposer';
import accessCentral from '../../AccessCentral';
import socketManager, { EmitTypes } from '../../react/SocketManager';

const anonymous = {
  partOfTeams: [],
  followingRooms: [storageManager.getPublicRoomId()],
  accessLevel: accessCentral.AccessLevels.ANONYMOUS,
  objectId: -1,
  aliases: [],
  username: '---',
};

class UserComposer extends DataComposer {
  constructor() {
    super({
      handler: users,
      completionEvent: eventCentral.Events.COMPLETE_USER,
      dependencies: [
        users,
        teams,
        aliases,
      ],
    });
  }

  getCurrentUser() {
    const userId = storageManager.getUserId();

    if (userId) {
      return this.handler.getObject({ objectId: userId });
    }

    return anonymous;
  }

  getCurrentIdentity() {
    const id = storageManager.getAliasId() || storageManager.getUserId();

    if (id) {
      return this.getIdentity({ objectId: id });
    }

    return anonymous;
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
      event: EmitTypes.BANUSER,
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
      event: EmitTypes.UNBANUSER,
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
      event: EmitTypes.VERIFYUSER,
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
    const {
      objectId,
      aliases: userAliases,
    } = this.getCurrentUser();

    if (objectId) {
      const identities = [
        this.getIdentity({ objectId: participantIds[0] }),
        this.getIdentity({ objectId: participantIds[1] }),
      ];
      const identityOrder = [];
      const { objectId: oneId } = identities[0];

      if (oneId === objectId || userAliases.includes(oneId)) {
        identityOrder.push(identities[0]);
        identityOrder.push(identities[1]);
      } else {
        identityOrder.push(identities[1]);
        identityOrder.push(identities[0]);
      }

      return identityOrder;
    }

    return [];
  }

  getIdentity({ objectId }) {
    return this.getUser({ userId: objectId }) || aliasComposer.getAlias({ aliasId: objectId });
  }

  getIdentityName({ objectId }) {
    const identity = this.getIdentity({ objectId });

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
      event: EmitTypes.CHANGEPASSWORD,
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
      event: EmitTypes.UPDATEUSER,
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
    const allUsers = this.getUsers();
    const allAliases = aliasComposer.getAllAliases();

    return allAliases.concat(allUsers).sort((a, b) => {
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

  getImage(identityId) {
    const identity = this.getIdentity({ objectId: identityId });

    if (identity) {
      return identity.image;
    }

    return undefined;
  }

  getUserByCode({
    code,
    callback,
  }) {
    socketManager.emitEvent(EmitTypes.GETUSERBYCODE, { code }, callback);
  }

  connectUser({
    username,
    callback,
  }) {
    socketManager.emitEvent(EmitTypes.CONNECTUSER, { username }, callback);
  }
}

const userComposer = new UserComposer();

export default userComposer;
