import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import { getDeviceId } from '../../StorageManager';
import store from '../../redux/store';
import { createNewUser, updateUsers } from '../../redux/actions/users';

export const createUser = async (params) => {
  const paramsToSend = params;
  paramsToSend.user.registerDevice = getDeviceId();

  const result = await emitSocketEvent(SendEvents.USER, paramsToSend);

  await store.dispatch(createNewUser(result));

  return result;
};

export const updateUser = async ({
  userId,
  user,
  image,
  resetImage,
}) => {
  const result = await emitSocketEvent(SendEvents.UPDATEUSER, {
    userId,
    user,
    image,
    options: { resetImage },
  });

  console.log(result);

  await store.dispatch(updateUsers({ users: [result.user] }));

  return result;
};
