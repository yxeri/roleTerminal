import { getCurrentUser } from './users';
import { getPublicRoomId } from './config';

export const RoomTypes = {
  FOLLOWED: 'followed',
  UNFOLLOWED: 'unfollowed',
  WHISPER: 'whisper',
};

export const SortBy = {
  NAME: 'name',
};

export const getAllRooms = (state) => [...state.rooms.values()];

export const getRoom = (state, { roomId } = {}) => state.rooms.get(roomId || getPublicRoomId(state));

export const getUnfollowedRooms = (state) => {
  const user = getCurrentUser(state);

  return getAllRooms(state).filter((room) => !user.followingRooms.includes(room.objectId));
};

export const getFollowedRooms = (state) => {
  const user = getCurrentUser(state);

  return getAllRooms(state).filter((room) => user.followingRooms.includes(room.objectId));
};

export const getWhisperRooms = (state) => {
  const user = getCurrentUser(state);

  return user
    ? getAllRooms(state).filter((room) => room.isWhisper)
    : [];
};

export const getChatRooms = (state, { sortBy = '', roomType = RoomTypes.UNFOLLOWED } = {}) => {
  let rooms;

  switch (roomType) {
    case RoomTypes.UNFOLLOWED: {
      rooms = getUnfollowedRooms(state);

      break;
    }
    case RoomTypes.FOLLOWED: {
      rooms = getFollowedRooms(state);

      break;
    }
    case RoomTypes.WHISPER: {
      rooms = getWhisperRooms(state);

      break;
    }
    default: {
      rooms = getAllRooms(state);

      break;
    }
  }

  switch (sortBy) {
    case SortBy.NAME: {
      return rooms.filter((room) => !room.isWhisper && !room.isUser).sort((a, b) => {
        const aParam = a.roomName.toLowerCase();
        const bParam = b.roomName.toLowerCase();

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    default: {
      return rooms.filter((room) => !room.isWhisper && !room.isUser);
    }
  }
};
