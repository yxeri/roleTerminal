import { SendEvents, emitSocketEvent } from '../SocketManager';
import store from '../../redux/store';
import { followRoom as followRoomAction, removeRooms } from '../../redux/actions/rooms';
import { getMessagesByRoom } from './messages';
import { getAliasId } from '../../redux/selectors/aliasId';

export const createRoom = async ({ room }) => {
  const roomToCreate = {
    ...room,
    ownerAliasId: getAliasId(store.getState()) || undefined,
  };
  const result = await emitSocketEvent(SendEvents.ROOM, { room: roomToCreate });

  await store.dispatch(followRoomAction({ room: result.room, user: result.user }));

  return { room: result.room };
};

export const followRoom = async ({ roomId, password }) => {
  const params = {
    roomId,
    password,
    aliasId: getAliasId(store.getState()) || undefined,
  };

  const result = await emitSocketEvent(SendEvents.FOLLOW, params);

  await getMessagesByRoom({ roomId });

  await store.dispatch(followRoomAction({ room: result.room, user: result.user }));

  return { room: result.room, user: result.user };
};

export const removeRoom = async ({ roomId }) => {
  const result = await emitSocketEvent(SendEvents.REMOVEROOM, { roomId });

  await store.dispatch(removeRooms({ rooms: [{ objectId: roomId }] }));

  return { room: result.room };
};
