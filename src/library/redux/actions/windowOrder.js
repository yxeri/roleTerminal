import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const changeWindowOrder = ({ windows }) => {
  if (windows.length === 1) {
    const [{ value, id }] = windows;

    return {
      type: WINDOWORDER,
      payload: {
        id,
        value,
        changeType: ChangeTypes.UPDATE,
      },
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
