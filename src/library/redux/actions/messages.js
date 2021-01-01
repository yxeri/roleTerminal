import { batch } from 'react-redux';

import { MESSAGE, MESSAGES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
import { createTransactions } from './transactions';
import { updateWallets } from './wallets';

export const createMessages = ({ messages }) => {
  if (messages.length === 1) {
    return {
      type: MESSAGE,
      payload: {
        changeType: ChangeTypes.CREATE,
        message: messages[0],
      },
    };
  }

  return {
    type: MESSAGES,
    payload: {
      messages,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const createNewsMessage = ({ message, transaction, wallet }) => async (dispatch) => {
  batch(() => {
    dispatch(createMessages({ messages: [message] }));
    dispatch(createTransactions({ transactions: [transaction] }));
    dispatch(updateWallets({ wallets: [wallet] }));
  });
};
