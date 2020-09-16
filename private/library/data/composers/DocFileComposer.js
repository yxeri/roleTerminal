import DataComposer from './BaseComposer';

import dataHandler from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';
import storageManager from '../../StorageManager';

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
    const fileToSend = docFile;
    fileToSend.ownerAliasId = storageManager.getAliasId();
    fileToSend.teamId = storageManager.getTeamId();

    this.handler.createObject({
      callback,
      params: {
        images,
        docFile: fileToSend,
      },
    });
  }

  getDocFileByCode({ code, callback }) {
    this.handler.fetchObject({
      callback,
      params: { code },
      noEmit: true,
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

export default docFileComposer;
