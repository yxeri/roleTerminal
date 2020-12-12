import { ALIASID, USERID } from '../actionTypes';
import { resetUser, setToken, setUserId } from '../../StorageManager';

export const login = ({ userId, token }) => {
  setToken(token);
  setUserId(userId);

  return {
    type: USERID,
    payload: { userId },
  };
};

export const logout = () => {
  resetUser();

  return (dispatch) => {
    dispatch({
      type: USERID,
      payload: { reset: true },
    });

    dispatch({
      type: ALIASID,
      payload: { reset: true },
    });
  };
};
