import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';

export const WindowTypes = {
  WALLET: 'wallet',
  CHAT: 'chat',
  WORLDMAP: 'worldMap',
};

const defaultState = new Map();

export default function WindowOrderReducer(state = defaultState, action) {
  if (action.type === WINDOWORDER) {
    const { payload } = action;
    const { id, type } = payload;
    const newState = new Map([...state]);

    if (newState.size > 0 && [...newState.keys()].indexOf(id) === newState.size - 1) {
      return state;
    }

    newState.delete(id);
    newState.set(id, type);

    return newState;
  }

  if (action.type === WINDOWORDERS) {
    const { payload } = action;
    const { windows } = payload;
    const newState = new Map([...state]);

    windows.forEach(({ id, type }) => newState.set(id, type));

    return newState;
  }

  return state;
}
