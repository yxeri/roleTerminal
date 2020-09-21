import { ROOM, ROOMS } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function roomsReducer(state = new Map(), action) {
  if (action.type === ROOM) {
    return rootReducerSingle(state, action);
  }

  if (action.type === ROOMS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
