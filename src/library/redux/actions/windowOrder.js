import { batch } from 'react-redux';

import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
import { getMode } from '../selectors/mode';
import store from '../store';
import { Modes } from '../reducers/mode';
import { changeTarget } from './mode';

export const changeWindowOrder = ({ windows }) => {
  if (windows.length === 1) {
    const [{ value, id }] = windows;

    return (dispatch) => {
      batch(() => {
        if (getMode(store.getState()).mode === Modes.HELP) {
          dispatch(changeTarget({ target: id }));
        }

        dispatch({
          type: WINDOWORDER,
          payload: {
            id,
            value,
            changeType: ChangeTypes.UPDATE,
          },
        });
      });
    };
  }

  return {
    type: WINDOWORDERS,
    payload: {
      windows,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const removeWindow = ({ id }) => ({
  type: WINDOWORDER,
  payload: {
    id,
    changeType: ChangeTypes.REMOVE,
  },
});
