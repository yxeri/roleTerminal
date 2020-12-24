import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import store from '../../redux/store';
import { createNewAlias } from '../../redux/actions/aliases';

export const createAlias = async (params) => {
  const result = await emitSocketEvent(SendEvents.ALIAS, params);

  await store.dispatch(createNewAlias(result));

  return result;
};
