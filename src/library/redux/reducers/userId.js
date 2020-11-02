import { USERID } from '../actionTypes';

const initialState = '-1';

export default function userIdReducer(state = initialState, action) {
  if (action.type === USERID) {
    const { payload } = action;
    const { reset, userId } = payload;

    return reset
      ? initialState
      : userId;
  }

  return state;
}
