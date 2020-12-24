import { batch } from 'react-redux';

import { USER, USERS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
// eslint-disable-next-line import/no-cycle
import { createRooms } from './rooms';
import { createWallets } from './wallets';
import { createForums } from './forums';
import { createGameCodes } from './gameCodes';
import store from '../store';

export const updateUsers = ({ users }) => {
  if (users.length === 1) {
    return {
      type: USER,
      payload: {
        user: users[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: USERS,
    payload: {
      users,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createUsers = ({ users }) => {
  if (users.length === 1) {
    return {
      type: USER,
      payload: {
        user: users[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: USERS,
    payload: {
      users,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const createNewUser = ({
  user,
  wallet,
  room,
  forum,
  gameCode,
}) => async (dispatch) => {
  batch(() => {
    dispatch(createUsers({ users: [user] }));
    dispatch(createRooms({ rooms: [room] }));
    dispatch(createWallets({ wallets: [wallet] }));
    dispatch(createForums({ forums: [forum] }));
    dispatch(createGameCodes({ gameCodes: [gameCode] }));
  });
};
