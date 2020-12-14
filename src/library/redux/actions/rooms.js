import { ROOM, ROOMS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const createRooms = ({ rooms }) => {
  if (rooms.length === 1) {
    return {
      type: ROOM,
      payload: {
        changeType: ChangeTypes.CREATE,
        room: rooms[0],
      },
    };
  }

  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateRooms = ({ rooms }) => {
  if (rooms.length === 1) {
    return {
      type: ROOM,
      payload: {
        changeType: ChangeTypes.UPDATE,
        room: rooms[0],
      },
    };
  }

  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.CREATE,
    },
  };
}
