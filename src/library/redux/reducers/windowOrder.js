import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';
import { ChangeTypes } from './root';

export const WindowTypes = {
  WALLET: 'wallet',
  CHAT: 'chat',
  WORLDMAP: 'worldMap',
  DOCFILE: 'docFile',
  NEWS: 'news',
  DIALOGIDENTITY: 'dialogIdentity',
  DIALOGCREATEROOM: 'dialogCreateRoom',
  DIALOGREMOVEROOM: 'dialogRemoveRoom',
  DIALOGREGISTER: 'dialogRegister',
  DIALOGLOGIN: 'dialogLogin',
  DIALOGCREATEALIAS: 'dialogCreateAlias',
  DIALOGCREATETRANSACTION: 'dialogCreateTransaction',
  DIALOGCREATEDOCFILE: 'dialogCreateDocFile',
  DIALOGCREATENEWS: 'dialogCreateNews',
  DIALOGJOINROOM: 'dialogJoinRoom',
};

const defaultState = new Map();

export default function WindowOrderReducer(state = defaultState, action) {
  if (action.type === WINDOWORDER) {
    const { payload } = action;
    const { id, value, changeType } = payload;
    const newState = new Map([...state]);

    if (changeType === ChangeTypes.UPDATE) {
      if (newState.size > 0 && newState.get(id) && newState.get(id).index === newState.size) {
        const existing = newState.get(id);

        if (Object.keys(value).length === Object.keys(existing).length && Object.keys(value).every((key) => existing[key] === value[key])) {
          return state;
        }
      }

      const windowValue = { ...value };

      if (!newState.get(id)) {
        windowValue.index = newState.size + 1;

        newState.set(id, windowValue);
      } else {
        const sorted = [...newState.entries()]
          .sort((a, b) => {
            const valueA = a[1].index;
            const valueB = b[1].index;

            if (valueA > valueB) {
              return 1;
            }

            if (valueA < valueB) {
              return -1;
            }

            return 0;
          });

        const [window] = sorted.splice(sorted.findIndex(([key]) => key === id), 1);
        window[1] = { ...windowValue };

        sorted.push(window);

        console.log(sorted);

        sorted.forEach(([key, entryValue], index) => {
          const newValue = {
            ...entryValue,
            index: index + 1,
          };

          newState.set(key, newValue);
        });
      }

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