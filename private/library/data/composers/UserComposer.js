const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');

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

  getUsername({ userId }) {
    const user = this.handler.getObject({ objectId: userId });

    return user ? user.username : '';
  }

  getUser({ userId }) {
    return this.handler.getObject({ objectId: userId });
  }

  getWhisperUsers({ participantIds = [0, 1] }) {
    const { objectId, aliases } = this.getCurrentUser();
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
}

const userComposer = new UserComposer();

module.exports = userComposer;
