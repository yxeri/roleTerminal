import { DEVICE, DEVICES } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function aliasesReducer(state = new Map(), action) {
  if (action.type === DEVICE) {
    return rootReducerSingle(state, action);
  }

  if (action.type === DEVICES) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
