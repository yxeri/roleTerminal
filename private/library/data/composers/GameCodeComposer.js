const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');

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

module.exports = gameCodeComposer;
