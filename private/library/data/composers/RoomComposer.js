import DataComposer from './BaseComposer';

import dataHandler from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';
import storageManager from '../../StorageManager';
import userComposer from '../../data/composers/UserComposer';
import messageComposer from './MessageComposer';

class RoomComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.rooms,
      completionEvent: eventCentral.Events.COMPLETE_ROOM,
      dependencies: [
        dataHandler.users,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.rooms,
      ],
    });
  }

  getWhisperRoom({ participantIds }) {
    return this.handler.getObject({
      filter: {
        rules: [
          {
            shouldInclude: true,
            paramName: 'participantIds',
            paramValue: participantIds,
          },
        ],
      },
    });
  }

  getRoom({ roomId }) {
    return this.handler.getObject({ objectId: roomId });
  }

  getRooms() {
    return this.handler.getObjects({});
  }

  follow({ // eslint-disable-line class-methods-use-this
    roomId,
    password,
    callback,
  }) {
    const user = userComposer.getCurrentUser();

    if (!user) {
      return;
    }

    const { followingRooms = [] } = user;

    if (followingRooms.includes(roomId)) {
      callback({});

      return;
    }

    const params = {
      roomId,
      password,
      aliasId: storageManager.getAliasId(),
    };

    socketManager.emitEvent(socketManager.EmitTypes.FOLLOW, params, ({ error }) => {
      if (error) {
        console.log('follow error', error);

        callback({ error });

        return;
      }

      messageComposer.fetchMessagesByRoom({
        roomId,
        callback: ({ error: fetchError }) => {
          if (fetchError) {
            console.log('follow get messages', fetchError);
          }

          callback({ error: fetchError });
        },
      });
    });
  }

  unfollow({ // eslint-disable-line class-methods-use-this
    roomId,
  }) {
    const user = userComposer.getCurrentUser();

    if (!user) {
      return;
    }

    const params = {
      roomId,
      aliasId: storageManager.getAliasId(),
    };

    socketManager.emitEvent(socketManager.EmitTypes.UNFOLLOW, params, ({ error }) => {
      if (error) {
        console.log('unfollow error', error);
      }
    });
  }

  createRoom({
    room,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: { room },
    });
  }

  updateRoom({
    room,
    options,
    roomId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        roomId,
        room,
        options,
      },
    });
  }

  resetPassword({
    roomId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        roomId,
        options: {
          resetPassword: true,
        },
      },
    });
  }

  invite({
    roomId,
    followerIds,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.INVITEROOM,
      params: {
        roomId,
        followerIds,
      },
    });
  }
}

const roomComposer = new RoomComposer();

export default roomComposer;
