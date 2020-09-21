import DataComposer from './BaseComposer';

import {
  users,
  teams,
  aliases,
  wallets,
  transactions,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import { EmitTypes } from '../../react/SocketManager';

class TransactionComposer extends DataComposer {
  constructor() {
    super({
      handler: transactions,
      completionEvent: eventCentral.Events.COMPLETE_TRANSACTION,
      dependencies: [
        users,
        teams,
        aliases,
        wallets,
        transactions,
      ],
    });
  }

  createTransaction({
    transaction,
    callback,
  }) {
    this.handler.createObject({
      callback,
      event: EmitTypes.CREATETRANSACTION,
      params: {
        transaction,
      },
    });
  }
}

const transactionComposer = new TransactionComposer();

export default transactionComposer;
