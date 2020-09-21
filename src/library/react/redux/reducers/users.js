import { USER, USERS } from '../actionTypes';
import { rootReducerSingle, rootReducerMultiple } from './root';

export default function usersReducer(state = new Map(), action) {
  if (action.type === USER) {
    return rootReducerSingle(state, action);
  }

  if (action.type === USERS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
