import DataComposer from './BaseComposer';

import dataHandler from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';

class TransactionComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.transactions,
      completionEvent: eventCentral.Events.COMPLETE_TRANSACTION,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
        dataHandler.wallets,
        dataHandler.transactions,
      ],
    });
  }

  createTransaction({
    transaction,
    callback,
  }) {
    this.handler.createObject({
      callback,
      event: socketManager.EmitTypes.CREATETRANSACTION,
      params: {
        transaction,
      },
    });
  }
}

const transactionComposer = new TransactionComposer();

export default transactionComposer;
