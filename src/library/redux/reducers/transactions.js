import { TRANSACTION, TRANSACTIONS } from '../actionTypes';
import { rootReducerSingle, rootReducerMultiple } from './root';

export default function transactionsReducer(state = new Map(), action) {
  if (action.type === TRANSACTION) {
    rootReducerSingle(state, action);
  }

  if (action.type === TRANSACTIONS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
