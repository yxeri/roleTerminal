import { WALLET, WALLETS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const updateWallets = ({ wallets }) => {
  if (wallets.length === 1) {
    return {
      type: WALLET,
      payload: {
        wallet: wallets[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: WALLETS,
    payload: {
      wallets,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createWallets = ({ wallets }) => {
  if (wallets.length === 1) {
    return {
      type: WALLET,
      payload: {
        wallet: wallets[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: WALLETS,
    payload: {
      wallets,
      changeType: ChangeTypes.CREATE,
    },
  };
};
