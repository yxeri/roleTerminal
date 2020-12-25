import { batch } from 'react-redux';

import { TRANSACTION, TRANSACTIONS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
import { updateWallets } from './wallets';

export const updateTransactions = ({ transactions }) => {
  if (transactions.length === 1) {
    return {
      type: TRANSACTION,
      payload: {
        transaction: transactions[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: TRANSACTIONS,
    payload: {
      transactions,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createTransactions = ({ transactions }) => {
  if (transactions.length === 1) {
    return {
      type: TRANSACTION,
      payload: {
        transaction: transactions[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: TRANSACTIONS,
    payload: {
      transactions,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const doTransaction = ({ transaction, wallet }) => (dispatch) => {
  batch(() => {
    dispatch(createTransactions({ transactions: [transaction] }));
    dispatch(updateWallets({ wallets: [wallet] }));
  });
};
