const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');

class AliasComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.aliases,
      completionEvent: eventCentral.Events.COMPLETE_ALIAS,
      dependencies: [
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
      ],
    });
  }

  getCurrentUserAliases() {
    const userId = storageManager.getUserId();

    if (!userId) { return []; }

    const aliases = this.handler.getObjects({
      filter: {
        rules: [
          { paramName: 'ownerId', paramValue: storageManager.getUserId() },
        ],
      },
    });

    return aliases;
  }

  createAlias({
    alias,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: { alias },
    });
  }

  getAliasName({ aliasId }) {
    const alias = this.handler.getObject({ objectId: aliasId });

    if (!alias) {
      return '';
    }

    return alias.aliasName;
  }
}

const aliasComposer = new AliasComposer();

module.exports = aliasComposer;
