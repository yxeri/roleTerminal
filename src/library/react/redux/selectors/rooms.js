import { getCurrentUser } from './users';

export const RoomTypes = {
  FOLLOWED: 'followed',
  UNFOLLOWED: 'unfollowed',
  WHISPER: 'whisper',
};

export const SortBy = {
  NAME: 'name',
};

export const getAllRooms = (state) => {
  return [...state.rooms];
};

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
  let getFunc;

  switch (roomType) {
    case RoomTypes.UNFOLLOWED: {
      getFunc = getUnfollowedRooms;

      break;
    }
    case RoomTypes.FOLLOWED: {
      getFunc = getFollowedRooms;

      break;
    }
    case RoomTypes.WHISPER: {
      getFunc = getWhisperRooms;

      break;
    }
    default: {
      getFunc = getAllRooms;

      break;
    }
  }

  switch (sortBy) {
    case SortBy.NAME: {
      return getFunc(state).filter((room) => !room.isWhisper && !room.isUser).sort((a, b) => {
        const aParam = a.roomName.toLowerCase();
        const bParam = b.roomName.toLowerCase();

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    default: {
      return getFunc(state).filter((room) => !room.isWhisper && !room.isUser);
    }
  }
};
