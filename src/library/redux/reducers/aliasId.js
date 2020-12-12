import { ALIASID } from '../actionTypes';

const initialState = null;

export default function userIdReducer(state = initialState, action) {
  if (action.type === ALIASID) {
    const { payload } = action;
    const { reset, userId } = payload;

    return reset
      ? initialState
      : userId;
  }

  return state;
}
