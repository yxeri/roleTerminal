import { ALIASID, TOKEN, USERID } from '../actionTypes';
import { resetUser, setToken } from '../../StorageManager';

export const login = ({ userId, token }) => {
  setToken(token);

  return (dispatch) => {
    dispatch({
      type: USERID,
      payload: { userId },
    });

    dispatch({
      type: TOKEN,
      payload: { token },
    });
  };
};

export const logout = () => {
  resetUser();

  return (dispatch) => {
    dispatch({
      type: TOKEN,
      payload: { reset: true },
    });

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
