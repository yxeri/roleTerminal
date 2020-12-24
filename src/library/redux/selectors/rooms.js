import createCachedSelector from 're-reselect';
import { getCurrentUser, getCurrentUserIdentities, getIdentitiesByIds } from './users';

export const getAllRooms = (state) => state.rooms;

export const getRoom = (state, { id }) => state.rooms.get(id);

const getRooms = createCachedSelector(
  [getAllRooms],
  (rooms) => [...rooms.values()].filter((room) => !room.isWhisper && !room.isUser),
)(() => 'normalRooms');

export const getWhisperRooms = createCachedSelector(
  [getAllRooms],
  (rooms) => [...rooms.values()]
    .filter((room) => room.isWhisper)
    .map(({ objectId, participantIds }) => ({ objectId, participantIds })),
)(() => 'whisperRooms');

export const getUnfollowedRoomIds = createCachedSelector(
  [getRooms, getCurrentUser],
  (rooms, user) => rooms
    .filter((room) => !user.followingRooms.includes(room.objectId)).map(({ roomName, objectId }) => ({ roomName, objectId }))
    .sort((roomA, roomB) => {
      const a = roomA.roomName.toLowerCase();
      const b = roomB.roomName.toLowerCase();

      if (a > b) {
        return 1;
      }

      if (b < a) {
        return 1;
      }

      return 0;
    })
    .map(({ objectId }) => objectId),
)(() => 'unfollowedRooms');

export const getFollowedRoomsIds = createCachedSelector(
  [getRooms, getCurrentUser],
  (rooms, user) => rooms
    .filter((room) => user.followingRooms.includes(room.objectId))
    .map(({ objectId }) => objectId),
)(() => 'followedRooms');

export const getWhisperRoom = createCachedSelector(
  [
    getWhisperRooms,
    (_, { identityId, currentIdentityId }) => ({ identityId, currentIdentityId }),
    (state, { identityId }) => getRoom(state, { id: identityId }),
  ],
  (rooms, { currentIdentityId, identityId }, identityRoom) => rooms
    .find((room) => room.participantIds.includes(currentIdentityId) && room.participantIds.includes(identityId)) || identityRoom,
)((_, { currentIdentityId, identityId }) => `whisper-${currentIdentityId}-${identityId}`);

export const getWhisperRoomName = createCachedSelector(
  [
    getIdentitiesByIds,
    getCurrentUserIdentities,
    (_, { ids: participantIds }) => participantIds,
  ],
  (identities, currentIdentities, participantIds) => {
    const participant = identities.get(participantIds[0]);
    const secondParticipant = identities.get(participantIds[1]);
    const name = currentIdentities
      .find(({ objectId }) => participant.objectId === objectId || participant.ownerId === objectId || participant.userIds.includes(objectId))
      ? `${participant.username || participant.aliasName} > ${secondParticipant.username || participant.aliasName}`
      : `${secondParticipant.username || participant.aliasName} > ${participant.username || participant.aliasName}`;

    return name;
  },
)((_, { ids }) => `w-name-${ids.join(' ')}`);
