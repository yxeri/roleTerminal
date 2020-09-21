import { USERID } from '../actionTypes';

export const setUserId = (userId) => {
  return {
    type: USERID,
    payload: {
      userId,
    },
  };
};
