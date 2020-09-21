import DataComposer from './BaseComposer';

import {
  aliases,
  users,
  teams,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import storageManager from '../../react/StorageManager';

class AliasComposer extends DataComposer {
  constructor() {
    super({
      handler: aliases,
      completionEvent: eventCentral.Events.COMPLETE_ALIAS,
      dependencies: [
        aliases,
        users,
        teams,
      ],
    });
  }

  getCurrentUserAliases() {
    const userId = storageManager.getUserId();

    if (!userId) {
      return [];
    }

    return this.handler.getObjects({
      filter: {
        orCheck: true,
        rules: [
          { paramName: 'ownerId', paramValue: storageManager.getUserId() },
          {
            shouldInclude: true,
            paramName: 'userIds',
            paramValue: [userId],
          },
        ],
      },
    });
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

  getAlias({ aliasId }) {
    return this.handler.getObject({ objectId: aliasId });
  }

  getAllAliases() {
    return this.handler.getObjects({});
  }

  updateAlias({
    aliasId,
    alias,
    image,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        aliasId,
        alias,
        image,
      },
    });
  }
}

const aliasComposer = new AliasComposer();

export default aliasComposer;
