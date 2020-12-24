import { batch } from 'react-redux';

import { ROOM, ROOMS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';
// eslint-disable-next-line import/no-cycle
import { updateUsers } from './users';

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
};

export const removeRooms = ({ rooms }) => {
  if (rooms.length === 1) {
    return {
      type: ROOM,
      payload: {
        changeType: ChangeTypes.REMOVE,
        room: rooms[0],
      },
    };
  }

  return {
    type: ROOMS,
    payload: {
      rooms,
      changeType: ChangeTypes.REMOVE,
    },
  };
};

export const followRoom = ({ room, user }) => (dispatch) => {
  batch(() => {
    dispatch(updateRooms({ rooms: [room] }));
    dispatch(updateUsers({ users: [user] }));
  });
};
