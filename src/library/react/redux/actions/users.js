import { USER, USERS } from '../actionTypes';
import { ChangeTypes } from '../../SocketManager';

export const createUser = (user) => {
  return {
    type: USER,
    payload: {
      user,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateUser = ((user) => {
  return {
    type: USER,
    payload: {
      user,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeUser = (user) => {
  return {
    type: USER,
    payload: {
      user,
      changeType: ChangeTypes.REMOVE,
    },
  };
};

export const createUsers = (users) => {
  return {
    type: USERS,
    payload: {
      users,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateUsers = ((users) => {
  return {
    type: USERS,
    payload: {
      users,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeUsers = (users) => {
  return {
    type: USERS,
    payload: {
      users,
      changeType: ChangeTypes.REMOVE,
    },
  };
};
