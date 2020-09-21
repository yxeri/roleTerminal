import { getAllAliases } from './aliases';
import { getUserId } from './userId';

const anonymousUser = {
  followingRooms: [],
};

export const SortBy = {
  NAME: 'name',
};

export const getIdentity = (state, { identityId } = {}) => {
  return state.users.get(identityId) || state.aliases.get(identityId);
};

export const getAllIdentities = (state, { getMap = false } = {}) => {
  if (getMap) {
    return new Map([...state.users, ...state.aliases])
  }

  return [...state.users.values(), ...state.aliases.values()];
};

export const getOthersIdentities = (state) => {
  const userId = getUserId(state);

  return getAllUsers(state).filter((user) => user.objectId !== userId)
    .concat(getAllAliases(state).filter((alias) => userId !== alias.ownerId && !alias.userIds.includes(userId)));
};

export const getCurrentUserIdentities = (state) => {
  const user = getCurrentUser(state);

  return [user.objectId]
    .concat(user.aliases)
    .map((id) => state.users.get(id) || state.aliases.get(id));
};

export const getCurrentUser = (state) => {
  return state.users.get(getUserId(state)) || anonymousUser;
};

export const getAllUsers = (state) => {
  return [...state.users.values()];
};

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
