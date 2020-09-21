import DataComposer from './BaseComposer';

import {
  gameCodes,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import { EmitTypes, ChangeTypes } from '../../react/SocketManager';

class GameCodeComposer extends DataComposer {
  constructor() {
    super({
      handler: gameCodes,
      completionEvent: eventCentral.Events.COMPLETE_GAMECODE,
      dependencies: [
        gameCodes,
      ],
    });
  }

  useGameCode({
    code,
    callback,
  }) {
    socketManager.emitEvent(EmitTypes.USEGAMECODE, { code }, callback);
  }
}

const gameCodeComposer = new GameCodeComposer();

export default gameCodeComposer;
