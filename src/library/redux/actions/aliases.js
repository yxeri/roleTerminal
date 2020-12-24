import { batch } from 'react-redux';

import { ALIAS, ALIASES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
import { createRooms } from './rooms';
import { createWallets } from './wallets';
import { createForums } from './forums';
import { createGameCodes } from './gameCodes';

export const updateAliases = ({ aliases }) => {
  if (aliases.length === 1) {
    return {
      type: ALIAS,
      payload: {
        alias: aliases[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: ALIASES,
    payload: {
      aliases,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createAliases = ({ aliases }) => {
  if (aliases.length === 1) {
    return {
      type: ALIAS,
      payload: {
        alias: aliases[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: ALIASES,
    payload: {
      aliases,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const createNewAlias = ({
  alias,
  wallet,
  room,
  // forum,
  // gameCode,
}) => async (dispatch) => {
  batch(() => {
    dispatch(createAliases({ aliases: [alias] }));
    dispatch(createRooms({ rooms: [room] }));
    dispatch(createWallets({ wallets: [wallet] }));
    // dispatch(createForums({ forums: [forum] }));
    // dispatch(createGameCodes({ gameCodes: [gameCode] }));
  });
};
