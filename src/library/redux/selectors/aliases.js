export const getAllAliases = (state) => state.aliases;

export const getAlias = (state, aliasId) => state.aliases.get(aliasId);
