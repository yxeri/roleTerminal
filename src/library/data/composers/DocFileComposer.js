import DataComposer from './BaseComposer';

import {
  docFiles,
  aliases,
  users,
  teams,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import { EmitTypes } from '../../react/SocketManager';
import storageManager from '../../react/StorageManager';

class DocFileComposer extends DataComposer {
  constructor() {
    super({
      handler: docFiles,
      completionEvent: eventCentral.Events.COMPLETE_DOCFILE,
      dependencies: [
        docFiles,
        aliases,
        users,
        teams,
      ],
    });
  }

  unlockDocFile({ docFileId, code, callback }) {
    this.handler.updateObject({
      callback,
      event: EmitTypes.UNLOCKDOCFILE,
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
