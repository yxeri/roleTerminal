import { SendEvents, emitSocketEvent } from '../SocketManager';
import store from '../../redux/store';
import { createRooms, updateRooms } from '../../redux/actions/rooms';

export const createRoom = async ({ room }) => {
  const result = await emitSocketEvent(SendEvents.ROOM, { room });

  store.dispatch(createRooms({ rooms: [result.room] }));
};

export const followRoom = async ({ roomId, password }) => {
  const result = await emitSocketEvent(SendEvents.FOLLOW, { roomId, password });

  console.log(result);

  store.dispatch(updateRooms({ rooms: [result.room] }));
};
