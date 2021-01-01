import { batch } from 'react-redux';

import { ALIASID, USERID } from '../actionTypes';
import { resetUser, setToken, setUserId } from '../../StorageManager';

export const login = ({ userId, token, retrieveAll }) => {
  setToken(token);
  setUserId(userId);

  retrieveAll({ reset: true });

  return {
    type: USERID,
    payload: { userId },
  };
};

export const logout = (retrieveAll) => {
  resetUser();

  retrieveAll({ reset: true });

  return (dispatch) => {
    batch(() => {
      dispatch({
        type: USERID,
        payload: { reset: true },
      });

      dispatch({
        type: ALIASID,
        payload: { reset: true },
      });
    });
  };
};
