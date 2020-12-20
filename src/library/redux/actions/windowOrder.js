import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';

export const changeWindowOrder = ({ windows }) => {
  if (windows.length === 1) {
    const [{ type, id }] = windows;

    return {
      type: WINDOWORDER,
      payload: { id, type },
    };
  }

  return {
    type: WINDOWORDERS,
    payload: { windows },
  };
};
