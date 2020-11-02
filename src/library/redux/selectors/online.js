import { Status } from '../reducers/online';

export const isOnline = (state) => state.online === Status.ONLINE;
export const isReconnecting = (state) => state.online === Status.RECONNECTING;
