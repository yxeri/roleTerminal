import { TOKEN } from '../actionTypes';

const initialState = null;

export default function tokenReducer(state = initialState, action) {
  if (action.type === TOKEN) {
    const { payload } = action;
    const { reset, token } = payload;

    return reset
      ? initialState
      : token;
  }

  return state;
}
