const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

class DocFileComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.docFiles,
      completionEvent: eventCentral.Events.COMPLETE_DOCFILE,
      dependencies: [
        dataHandler.docFiles,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
      ],
    });
  }

  unlockDocFile({ docFileId, code, callback }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UNLOCKDOCFILE,
      params: {
        docFileId,
        code,
        aliasId: storageManager.getAliasId(),
      },
    });
  }

  getDocFiles() {
    return this.handler.getObjects({});
  }

  createDocFile({
    docFile,
    images,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: {
        docFile,
        images,
      },
    });
  }

  getDocFile({ docFileId }) {
    return this.handler.getObject({ objectId: docFileId });
  }

  updateDocFile({
    docFile,
    docFileId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        docFileId,
        docFile,
      },
    });
  }

  removeDocFile({
    docFileId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { docFileId },
    });
  }
}

const docFileComposer = new DocFileComposer();

module.exports = docFileComposer;
