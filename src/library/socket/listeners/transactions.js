import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { doTransaction, updateTransactions } from '../../redux/actions/transactions';

const events = {
  TRANSACTION: 'transaction',
};

export const transaction = () => ({
  event: events.TRANSACTION,
  callback: ({ error, data }) => {
    if (data && data.transaction && (data.changeType === ChangeTypes.UPDATE || data.wallet)) {
      const { transaction: sentTransaction, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(doTransaction(data));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateTransactions({ transactions: [sentTransaction] }));
      }

      return;
    }

    console.log(events.TRANSACTION, error, data);
  },
});
