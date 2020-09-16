import DataComposer from './BaseComposer';

import {
  wallets,
  users,
  teams,
  aliases,
  transactions,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import { EmitTypes } from '../../SocketManager';
import userComposer from './UserComposer';
import teamComposer from './TeamComposer';

class WalletComposer extends DataComposer {
  constructor() {
    super({
      handler: wallets,
      completionEvent: eventCentral.Events.COMPLETE_WALLET,
      dependencies: [
        users,
        teams,
        aliases,
        wallets,
        transactions,
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
      event: EmitTypes.UPDATEWALLET,
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

    if (wallet) {
      const walletOwner = teamComposer.getTeam({ teamId: walletId }) || userComposer.getIdentity({ objectId: wallet.ownerAliasId || wallet.ownerId });

      return walletOwner.aliasName || walletOwner.username || walletOwner.teamName;
    }

    return undefined;
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
      event: EmitTypes.UPDATEWALLET,
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

    return 0;
  }
}

const walletComposer = new WalletComposer();

export default walletComposer;
