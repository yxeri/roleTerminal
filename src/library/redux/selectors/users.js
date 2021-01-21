import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import createCachedSelector from 're-reselect';

import { getAliasById, getAllAliases } from './aliases';
import { getUserId } from './userId';
import { getAnonymousUser, getSystemUser } from './config';
import { getAllTeams, getTeamById } from './teams';
import { getDeviceId } from '../../StorageManager';

export const getAllUsers = (state) => state.users;

export const getUserById = (state, { id }) => state.users.get(id);

export const getCurrentUser = createCachedSelector(
  [
    (state) => getUserById(state, { id: getUserId(state) }),
    getAnonymousUser,
  ],
  (user, anonymous) => user || anonymous,
)(() => 'current-user');

export const getIsAnonymous = createCachedSelector(
  [getCurrentUser],
  (user) => user.isAnonymous,
)(() => 'is-anonymous');

export const getCurrentUserRooms = createCachedSelector(
  [getCurrentUser],
  (user) => user.followingRooms,
)({
  keySelector: () => 'current-user-rooms',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => a.followingRooms.length === b.followingRooms.length && a.followingRooms.every((roomId) => b.followingRooms.includes(roomId)),
  ),
});

export const getCurrentAccessLevel = createSelector(
  [getCurrentUser],
  (user) => user.accessLevel,
);

export const getCurrentHasSeen = createCachedSelector(
  [getCurrentUser],
  (user) => user.hasSeen || [],
)({
  keySelector: () => 'current-user-hasSeen',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => a.hasSeen && b.hasSeen && a.hasSeen.length === b.hasSeen.length && a.hasSeen.every((seen) => b.hasSeen.includes(seen)),
  ),
});

export const getCurrentPartOfTeams = createCachedSelector(
  [getCurrentUser],
  (user) => user.partOfTeams,
)({
  keySelector: () => 'current-user-partOfTeams',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => {
      if (a.partOfTeams.length !== b.partOfTeams.length) {
        return false;
      }

      return b.partOfTeams.every((teamId) => a.partOfTeams.includes(teamId));
    },
  ),
});

export const getSystemConfig = createCachedSelector(
  [
    getCurrentUser,
    () => getDeviceId(),
  ],
  (user, deviceId) => (user.systemConfig
    ? (user.systemConfig[deviceId] || user.systemConfig)
    : {}),
)(() => 'current-system-config');

export const getHideTopBar = createCachedSelector(
  [getSystemConfig],
  (systemConfig) => systemConfig.hideTopBar,
)(() => 'current-hideTopBar');

export const getAlwaysMaximized = createCachedSelector(
  [getSystemConfig],
  (systemConfig) => systemConfig.alwaysMaximized,
)(() => 'current-alwaysMaximized');

export const getIdentities = createCachedSelector(
  [getAllUsers, getAllAliases],
  (users, aliases) => new Map([...users.entries(), ...aliases.entries()]),
)(() => 'identities');

export const getIdentitiesByIds = createCachedSelector(
  [
    getAllUsers,
    getAllAliases,
    (_, { ids }) => ids,
  ],
  (users, aliases, ids) => {
    const map = new Map();

    ids.forEach((id) => map.set(id, users.get(id) || aliases.get(id)));

    return map;
  },
)((_, { ids }) => `identities-${ids.join(' ')}`);

export const getIdentitiesOrTeamsByIds = createCachedSelector(
  [
    getAllUsers,
    getAllAliases,
    getAllTeams,
    (_, { ids }) => ids,
  ],
  (users, aliases, teams, ids) => {
    const map = new Map();

    ids.forEach((id) => map.set(id, teams.get(id) || users.get(id) || aliases.get(id)));

    return map;
  },
)((_, { ids }) => `identities-teams-${ids.join(' ')}`);

export const getIdentityById = createCachedSelector(
  [getUserById, getAliasById],
  (user, alias) => alias || user,
)((_, { id }) => `identity-${id}`);

export const getIdentityImage = createCachedSelector(
  [getIdentityById],
  (identity) => identity.image,
)((_, { id }) => `identity-${id}-image`);

export const getIdentityOrTeamName = createCachedSelector(
  [
    getIdentityById,
    getTeamById,
    (state, { id }) => {
      const systemUser = getSystemUser(state);

      return systemUser.objectId === id ? systemUser.username : undefined;
    },
  ],
  ({ aliasName, username } = {}, { teamName } = {}, systemName) => {
    let type;

    if (aliasName || username) {
      type = 'identity';
    } else if (teamName) {
      type = 'team';
    } else if (systemName) {
      type = 'system';
    } else {
      type = 'fallback';
    }

    return {
      type,
      name: aliasName || username || teamName || systemName || '',
    };
  },
)((_, { id }) => `identity-${id}-name`);

export const getIdentityOrTeamById = createCachedSelector(
  [getUserById, getAliasById, getTeamById],
  (user, alias, team) => team || alias || user,
)((_, { id }) => `identity-team-${id}`);

export const getOtherIdentities = createCachedSelector(
  [getIdentities, getUserId],
  (identities, userId) => [...identities.values()]
    .filter((identity) => identity.objectId !== userId && identity.ownerId !== userId && !identity.userIds.includes(userId))
    .map((identity) => ({ objectId: identity.objectId, partOfTeams: identity.partOfTeams, name: identity.aliasName || identity.username })),
)({
  keySelector: () => 'other-identity-ids',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a === b;
      }

      if (a.size !== b.size) {
        return false;
      }

      return [...b.values()].every((identity) => {
        const otherIdentity = a.get(identity.objectId);

        if (!otherIdentity) {
          return false;
        }

        if ((identity.aliasName || identity.username) !== (otherIdentity.aliasName || otherIdentity.username)) {
          return false;
        }

        return identity.partOfTeams.length === otherIdentity.partOfTeams.length && identity.partOfTeams.every((teamId) => otherIdentity.partOfTeams.includes(teamId));
      });
    },
  ),
});

export const getCurrentUserIdentities = createCachedSelector(
  [getIdentities, getUserId],
  (identities, userId) => [...identities.values()]
    .filter((identity) => identity.objectId === userId || identity.ownerId === userId || identity.userIds.includes(userId)),
)(() => 'current-identities');

export const getCurrentUserIdentitiesNames = createCachedSelector(
  [getCurrentUserIdentities],
  (identities) => identities
    .map((identity) => ({ objectId: identity.objectId, name: identity.aliasName || identity.username })),
)({
  keySelector: () => 'current-identities-names',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => a.length === b.length && b.every((identity) => {
      const otherIdentity = a.find((aIdentity) => identity.objectId === aIdentity.objectId);

      return otherIdentity && (otherIdentity.aliasName || otherIdentity.username) === (identity.aliasName || identity.username);
    }),
  ),
});
