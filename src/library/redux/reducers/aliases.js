import { ALIAS, ALIASES } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function aliasesReducer(state = new Map(), action) {
  if (action.type === ALIAS) {
    return rootReducerSingle(state, action);
  }

  if (action.type === ALIASES) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
