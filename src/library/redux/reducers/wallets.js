import { WALLET, WALLETS } from '../actionTypes';
import { rootReducerSingle, rootReducerMultiple } from './root';

export default function transactionsReducer(state = new Map(), action) {
  if (action.type === WALLET) {
    return rootReducerSingle(state, action);
  }

  if (action.type === WALLETS) {
    return rootReducerMultiple(state, action);
  }

  return state;
}
