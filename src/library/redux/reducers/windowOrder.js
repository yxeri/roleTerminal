import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';
import { ChangeTypes } from './root';

export const WindowTypes = {
  WALLET: 'wallet',
  CHAT: 'chat',
  WORLDMAP: 'worldMap',
  DOCFILE: 'docFile',
  DIALOGIDENTITY: 'dialogIdentity',
  DIALOGCREATEROOM: 'dialogCreateRoom',
  DIALOGREMOVEROOM: 'dialogRemoveRoom',
  DIALOGREGISTER: 'dialogRegister',
  DIALOGLOGIN: 'dialogLogin',
  DIALOGCREATEALIAS: 'dialogCreateAlias',
  DIALOGCREATETRANSACTION: 'dialogCreateTransaction',
  DIALOGCREATEDOCFILE: 'dialogCreateDocFile',
};

const defaultState = new Map();

export default function WindowOrderReducer(state = defaultState, action) {
  if (action.type === WINDOWORDER) {
    const { payload } = action;
    const { id, value, changeType } = payload;
    const newState = new Map([...state]);

    if (changeType === ChangeTypes.UPDATE) {
      if (newState.size > 0 && [...newState.keys()].indexOf(id) === newState.size - 1) {
        const existing = newState.get(id);

        if (Object.keys(value).length === Object.keys(existing).length && Object.keys(value).every((key) => existing[key] === value[key])) {
          return state;
        }
      }

      newState.delete(id);
      newState.set(id, value);

      return newState;
    }

    if (changeType === ChangeTypes.REMOVE) {
      newState.delete(id);

      return newState;
    }

    return state;
  }

  if (action.type === WINDOWORDERS) {
    const { payload } = action;
    const { windows } = payload;
    const newState = new Map([...state]);

    windows.forEach(({ id, value }) => newState.set(id, value));

    return newState;
  }

  return state;
}
