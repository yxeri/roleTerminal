import { getAlias, getAllAliases } from './aliases';
import { getUserId } from './userId';
import { getAnonymousUser } from './config';

export const SortBy = {
  NAME: 'name',
};

export const getAllUsers = (state) => [...state.users.values()];

export const getCurrentUser = (state) => state.users.get(getUserId(state)) || getAnonymousUser(state);

export const getCurrentAccessLevel = (state) => getCurrentUser(state).accessLevel;

export const getIdentity = (state, { identityId } = {}) => state.users.get(identityId) || getAlias(state, { aliasId: identityId });

export const getAllIdentities = (state, { getMap = false } = {}) => {
  if (getMap) {
    return new Map([...state.users, ...getAllAliases(state, { getMap: true })]);
  }

  return [...state.users.values(), ...getAllAliases(state)];
};

export const getOthersIdentities = (state) => {
  const userId = getUserId(state);

  return getAllUsers(state)
    .filter((user) => user.objectId !== userId)
    .concat(getAllAliases(state).filter((alias) => userId !== alias.ownerId && !alias.userIds.includes(userId)));
};

export const getCurrentUserIdentities = (state) => {
  const user = getCurrentUser(state);

  return [user.objectId]
    .concat(user.aliases)
    .map((id) => state.users.get(id) || getAlias(state, { aliasId: id }));
};

export const getIdentitiesByIds = (state, { identityIds }) => identityIds
  .map((identityId) => getIdentity(state, { identityId }));

export const getIdentities = (state, { sortBy = '', excludeSelf = true } = {}) => {
  const getFunc = excludeSelf
    ? getOthersIdentities
    : getAllIdentities;

  switch (sortBy) {
    case SortBy.NAME: {
      return getFunc(state).sort((a, b) => {
        const aParam = (a.username || a.aliasName).toLowerCase();
        const bParam = (b.username || b.aliasName).toLowerCase();

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    default: {
      return getFunc(state);
    }
  }
};
