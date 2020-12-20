export const getAllAliases = (state) => state.aliases;

export const getAlias = (state, { id }) => state.aliases.get(id);
