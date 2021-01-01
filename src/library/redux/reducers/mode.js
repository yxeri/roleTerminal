import { MODE } from '../actionTypes';

export const Modes = {
  DEFAULT: 'default',
  HELP: 'help',
  OFF: 'off',
};

const initialState = {
  mode: Modes.DEFAULT,
  target: '',
};

export default function modeReducer(state = initialState, action) {
  if (action.type === MODE) {
    const { payload } = action;
    const { mode, target } = payload;
    const newState = { ...state };

    if (!mode && target && state.target === target) {
      return state;
    }

    if (!target || mode === state.mode) {
      newState.target = initialState.target;
    } else {
      newState.target = target;
    }

    if (mode === state.mode) {
      newState.mode = initialState.mode;
    } else if (mode) {
      newState.mode = mode;
    }

    return newState;
  }

  return state;
}
