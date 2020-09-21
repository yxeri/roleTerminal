import { ROOMID } from '../actionTypes';

export const setRoomId = (roomId) => {
  return {
    type: ROOMID,
    payload: {
      roomId,
    },
  };
};
