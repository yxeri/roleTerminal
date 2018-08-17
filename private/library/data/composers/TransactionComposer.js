const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');

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

module.exports = transactionComposer;
