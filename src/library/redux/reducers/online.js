import { ONLINE } from '../actionTypes';

export const Status = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  RECONNECTING: 'reconnecting',
};

export default function onlineReducer(state = Status.OFFLINE, action) {
  if (action.type === ONLINE) {
    const { payload } = action;
    const { online } = payload;

    return online;
  }

  return state;
}
