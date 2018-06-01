const DataComposer = require('./BaseComposer');

const dataHandler = require('./DataHandler');
const eventCentral = require('../EventCentral');
const storageManager = require('../StorageManager');

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

    return user ? user.username: '';
  }
}

const userComposer = new UserComposer();

module.exports = userComposer;
