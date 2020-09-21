import { POSITION, POSITIONS } from '../actionTypes';
import { rootReducerSingle, rootReducerMultiple } from './root';

export default function positionsReducer(state = new Map(), action) {
  if (action.type === POSITION) {
    return rootReducerSingle(state, action);
  }

  if (action.type === POSITIONS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
