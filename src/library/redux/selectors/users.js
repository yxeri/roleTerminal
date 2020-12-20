import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';

import { getAlias, getAllAliases } from './aliases';
import { getUserId } from './userId';
import { getAnonymousUser } from './config';

export const getAllUsers = (state) => state.users;

export const getUser = (state, { id }) => state.users.get(id);

export const getCurrentUser = (state) => state.users.get(getUserId(state)) || getAnonymousUser(state);

export const getCurrentAccessLevel = createSelector(
  [getCurrentUser],
  (user) => user.accessLevel,
);

export const getIdentities = createSelector(
  [getAllUsers, getAllAliases],
  (users, aliases) => [...users.values(), ...aliases.values()],
);

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
)((_, { ids }) => `identities-${ids.join('')}`);

export const getIdentityById = createSelector(
  [getUser, getAlias],
  (user, alias) => user || alias,
);

export const getOthersIdentities = createSelector(
  [getIdentities, getUserId],
  (identities, userId) => identities
    .filter((identity) => identity.objectId !== userId && identity.ownerId !== userId && !identity.userIds.includes(userId)),
);

export const getCurrentUserIdentities = createSelector(
  [getIdentities, getUserId],
  (identities, userId) => identities
    .filter((identity) => identity.objectId === userId || identity.ownerId === userId || identity.userIds.includes(userId)),
);
