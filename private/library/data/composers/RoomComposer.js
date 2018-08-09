const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const userComposer = require('../../data/composers/UserComposer');

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
  }) {
    console.log('follow', roomId);

    const user = userComposer.getCurrentUser();

    if (!user) {
      return;
    }

    const { followingRooms = [] } = user;

    if (followingRooms.includes(roomId)) {
      const room = this.getRoom({ roomId });

      eventCentral.emitEvent({
        event: eventCentral.Events.FOLLOWED_ROOM,
        params: { room },
      });

      return;
    }

    const params = {
      roomId,
      aliasId: storageManager.getAliasId(),
    };

    socketManager.emitEvent(socketManager.EmitTypes.FOLLOW, params, ({ error }) => {
      if (error) {
        console.log('follow error', error);
      }
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
}

const roomComposer = new RoomComposer();

module.exports = roomComposer;
