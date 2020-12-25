import { emitSocketEvent, SendEvents } from '../SocketManager';
import store from '../../redux/store';
import { doTransaction } from '../../redux/actions/transactions';
import { getAliasId } from '../../redux/selectors/aliasId';

export const createTransaction = async ({ transaction }) => {
  const transactionToCreate = {
    ...transaction,
    ownerAliasId: getAliasId(store.getState()) || undefined,
  };
  const result = await emitSocketEvent(SendEvents.TRANSACTION, { transaction: transactionToCreate });

  await store.dispatch(doTransaction(result));

  return result;
};
