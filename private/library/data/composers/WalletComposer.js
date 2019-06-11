const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const userComposer = require('./UserComposer');
const teamComposer = require('./TeamComposer');

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
        dataHandler.transactions,
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

  getWallet({ walletId }) {
    return this.handler.getObject({ objectId: walletId });
  }

  getWalletOwnerName({
    walletId,
  }) {
    const wallet = this.getWallet({ walletId });
    const walletOwner = teamComposer.getTeam({ teamId: walletId }) || userComposer.getIdentity({ objectId: wallet.ownerAliasId || wallet.ownerId });

    return walletOwner.aliasName || walletOwner.username || walletOwner.teamName;
  }

  changeWalletAmount({
    walletId,
    amount,
    callback,
    shouldDecreaseAmount = false,
    resetAmount = false,
  }) {
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

  getWalletAmount({ walletId }) {
    const wallet = this.handler.getObject({ objectId: walletId });

    if (wallet) {
      return wallet.amount;
    }

    return -1;
  }
}

const walletComposer = new WalletComposer();

module.exports = walletComposer;
