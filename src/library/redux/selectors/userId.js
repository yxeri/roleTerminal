import { getAliasId } from './aliasId';

export const getUserId = (state) => state.userId;

export const getIdentityId = (state) => getAliasId(state) || getUserId(state);
