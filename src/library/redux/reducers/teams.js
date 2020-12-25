import { TEAM, TEAMS } from '../actionTypes';
import { rootReducerMultiple, rootReducerSingle } from './root';

export default function teamsReducer(state = new Map(), action) {
  if (action.type === TEAM) {
    return rootReducerSingle(state, action);
  }

  if (action.type === TEAMS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
