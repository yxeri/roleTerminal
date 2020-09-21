import { MESSAGE, MESSAGES } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function messagesReducer(state = new Map(), action) {
  if (action.type === MESSAGE) {
    return rootReducerSingle(state, action);
  }

  if (action.type === MESSAGES) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
