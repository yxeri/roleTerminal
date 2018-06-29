const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');

class WalletComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.wallets,
      completionEvent: eventCentral.Events.COMPLETE_WALLET,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
        dataHandler.wallets,
      ],
    });
  }

  updateWallet({
    walletId,
    wallet,
    options,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UPDATEWALLET,
      params: {
        wallet,
        walletId,
        options,
      },
    });
  }

  changeWalletAmount({
    walletId,
    amount,
    callback,
    shouldDecreaseAmount = false,
    resetAmount = false,
  }) {
    console.log(walletId, amount);

    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UPDATEWALLET,
      params: {
        walletId,
        wallet: {
          amount,
        },
        options: {
          shouldDecreaseAmount,
          resetAmount,
        },
      },
    });
  }
}

const walletComposer = new WalletComposer();

module.exports = walletComposer;
