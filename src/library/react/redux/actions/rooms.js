import { ROOMS, ROOM } from '../actionTypes';
import { ChangeTypes } from '../../SocketManager';

export const createRoom = (room) => {
  return {
    type: ROOM,
    payload: {
      room,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateRoom = ((room) => {
  return {
    type: ROOM,
    payload: {
      room,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeRoom = (room) => {
  return {
    type: ROOM,
    payload: {
      room,
      changeType: ChangeTypes.REMOVE,
    },
  };
};

export const createRooms = (rooms) => {
  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateRooms = ((rooms) => {
  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeRooms = (rooms) => {
  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.REMOVE,
    },
  };
};
