import {
  CreateEvents,
  emitSocketEvent,
} from '../SocketManager';
import { getDeviceId } from '../../StorageManager';

export const createUser = async (params) => {
  const paramsToSend = params;
  paramsToSend.user.registerDevice = getDeviceId();

  return emitSocketEvent(CreateEvents.USER, paramsToSend);
};
