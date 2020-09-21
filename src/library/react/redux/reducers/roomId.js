import { ROOMID } from '../actionTypes';

const initialState = '111111111111111111111110';

export default function roomIdReducer(state = initialState, action) {
  if (action.type === ROOMID) {
    const { payload } = action;
    const { reset, roomId } = payload;

    return reset
      ? initialState
      : roomId;
  }

  return state;
}
