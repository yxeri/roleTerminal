import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';

import { getAlias, getAllAliases } from './aliases';
import { getUserId } from './userId';
import { getAnonymousUser } from './config';
import { getAllTeams, getTeamById } from './teams';

export const getAllUsers = (state) => state.users;

export const getUser = (state, { id }) => state.users.get(id);

export const getCurrentUser = (state) => state.users.get(getUserId(state)) || getAnonymousUser(state);

export const getCurrentAccessLevel = createSelector(
  [getCurrentUser],
  (user) => user.accessLevel,
);

export const getSystemConfig = createCachedSelector(
  [getCurrentUser],
  (user) => user.systemConfig || {},
)(() => 'current-system-config');

export const getIdentities = createCachedSelector(
  [getAllUsers, getAllAliases],
  (users, aliases) => [...users.values(), ...aliases.values()],
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

export const getIdentityById = createSelector(
  [getUser, getAlias],
  (user, alias) => user || alias,
);

export const getIdentityOrTeamById = createSelector(
  [getUser, getAlias, getTeamById],
  (user, alias, team) => team || alias || user,
);

export const getOthersIdentities = createCachedSelector(
  [getIdentities, getUserId],
  (identities, userId) => identities
    .filter((identity) => identity.objectId !== userId && identity.ownerId !== userId && !identity.userIds.includes(userId))
    .map((identity) => ({ objectId: identity.objectId, name: identity.aliasName || identity.username, partOfTeams: identity.partOfTeams })),
)(() => 'other-identity-ids');

export const getCurrentUserIdentities = createCachedSelector(
  [getIdentities, getUserId],
  (identities, userId) => identities
    .filter((identity) => identity.objectId === userId || identity.ownerId === userId || identity.userIds.includes(userId)),
)(() => 'current-identities');
