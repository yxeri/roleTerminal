const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');

class DocFileComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.docFiles,
      completionEvent: eventCentral.Events.COMPLETE_ALIAS,
      dependencies: [
        dataHandler.docFiles,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
      ],
    });
  }

  unlockDocFile({ docFileId, code, callback }) { // eslint-disable-line class-methods-use-this
    socketManager.emitEvent(socketManager.EmitTypes.UNLOCKDOCFILE, { docFileId, code }, callback);
  }

  getDocFiles() {
    return this.handler.getObjects({});
  }

  createDocFile({
    docFile,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: { docFile },
    });
  }

  getDocFile({ docFileId }) {
    return this.handler.getObject({ objectId: docFileId });
  }
}

const docFileComposer = new DocFileComposer();

module.exports = docFileComposer;
