import { getAliasId } from './aliasId';

export const getUserId = (state) => state.userId;

export const getCurrentIdentityId = (state) => getAliasId(state) || getUserId(state);
