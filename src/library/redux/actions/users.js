import { USER, USERS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

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
