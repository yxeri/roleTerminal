import { TOKEN } from '../actionTypes';

const initialState = undefined;

export default function userIdReducer(state = initialState, action) {
  if (action.type === TOKEN) {
    const { payload } = action;
    const { reset, token } = payload;

    return reset
      ? initialState
      : token;
  }

  return state;
}
