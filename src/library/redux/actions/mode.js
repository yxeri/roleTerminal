import { MODE } from '../actionTypes';

export const changeMode = ({ mode, target }) => ({
  type: MODE,
  payload: {
    mode,
    target,
  },
});

export const changeTarget = ({ target }) => ({
  type: MODE,
  payload: {
    target,
  },
});
