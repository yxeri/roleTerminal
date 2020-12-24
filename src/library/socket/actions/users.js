import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import { getDeviceId } from '../../StorageManager';
import store from '../../redux/store';
import { createNewUser } from '../../redux/actions/users';

export const createUser = async (params) => {
  const paramsToSend = params;
  paramsToSend.user.registerDevice = getDeviceId();

  const result = await emitSocketEvent(SendEvents.USER, paramsToSend);

  await store.dispatch(createNewUser(result));

  return result;
};
