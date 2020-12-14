import { createSelector } from 'reselect';
import { getCurrentUser } from './users';

export const getAllRooms = (state) => state.rooms;

export const getRoom = (state, id) => state.rooms.get(id);

const getRooms = createSelector(
  [getAllRooms],
  (rooms) => [...rooms.values()].filter((room) => !room.isWhisper && !room.isUser),
);

export const getUnfollowedRooms = createSelector(
  [getRooms, getCurrentUser],
  (rooms, user) => [...rooms.values()].filter((room) => !user.followingRooms.includes(room.objectId)),
);

export const getFollowedRooms = createSelector(
  [getRooms, getCurrentUser],
  (rooms, user) => [...rooms.values()].filter((room) => user.followingRooms.includes(room.objectId)),
);

export const getWhisperRooms = createSelector(
  [getAllRooms],
  (rooms) => [...rooms.values()].filter((room) => room.isWhisper),
);
