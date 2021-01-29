import { WINDOWORDER, WINDOWORDERS } from '../actionTypes';
import { ChangeTypes } from './root';

export const WindowTypes = {
  WALLET: 'Wallet',
  CHAT: 'Chat',
  WORLDMAP: 'Map',
  DOCFILEDIR: 'Files directory',
  DOCFILEVIEW: 'File',
  NEWS: 'News',
  TEAMS: 'Teams',
  DIALOGIDENTITY: 'User',
  DIALOGCREATEROOM: 'New room',
  DIALOGREMOVEROOM: 'Remove room',
  DIALOGREGISTER: 'Register',
  DIALOGLOGIN: 'Login',
  DIALOGCREATEALIAS: 'New alias',
  DIALOGCREATETRANSACTION: 'Transfer',
  DIALOGCREATEDOCFILE: 'New file',
  DIALOGCREATENEWS: 'New article',
  DIALOGJOINROOM: 'Join room',
  DIALOGCONFIGSYSTEM: 'Config system',
  DIALOGPROFILE: 'Profile',
  DIALOGUNLOCKFILE: 'Unlock file',
  DIALOGAPPSETTINGS: 'App settings',
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

        if (Object.keys(value).length === Object.keys(existing).length - 1 && Object.keys(value).every((key) => existing[key] === value[key])) {
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
    const { windows, reset } = payload;
    const newState = new Map([...state]);

    if (reset) {
      return defaultState;
    }

    windows.forEach(({ id, value }) => {
      const newValue = {
        ...value,
        index: newState.size + 1,
      };

      newState.set(id, newValue);
    });

    return newState;
  }

  return state;
}
