import DataComposer from './BaseComposer';

import dataHandler from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';

class GameCodeComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.gameCodes,
      completionEvent: eventCentral.Events.COMPLETE_GAMECODE,
      dependencies: [
        dataHandler.gameCodes,
      ],
    });
  }

  useGameCode({
    code,
    callback,
  }) {
    socketManager.emitEvent(socketManager.EmitTypes.USEGAMECODE, { code }, callback);
  }
}

const gameCodeComposer = new GameCodeComposer();

export default gameCodeComposer;
