import { USERID } from '../actionTypes';

const initialState = '-1';

export default function userIdReducer(state = initialState, action) {
  if (action.type === USERID) {
    const { payload } = action;
    const { reset, currentUserId } = payload;

    return reset
      ? initialState
      : currentUserId;
  }

  return state;
}
