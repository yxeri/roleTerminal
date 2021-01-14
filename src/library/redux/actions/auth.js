import { batch } from 'react-redux';

import { ALIASID, USERID } from '../actionTypes';
import { resetUser, setToken, setUserId } from '../../StorageManager';
import { postMessage, MessageTypes } from '../../Messenger';
import store from '../store';
import { resetWindows } from './windowOrder';

export const login = ({ userId, token, retrieveAll }) => {
  setToken(token);
  setUserId(userId);

  retrieveAll({ reset: true });

  postMessage({ type: MessageTypes.LOGIN, data: { userId } });

  return {
    type: USERID,
    payload: { userId },
  };
};

export const logout = (retrieveAll) => {
  store.dispatch(resetWindows());
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
