import { DOCFILE, DOCFILES } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function docFileReducer(state = new Map(), action) {
  if (action.type === DOCFILE) {
    return rootReducerSingle(state, action);
  }

  if (action.type === DOCFILES) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
