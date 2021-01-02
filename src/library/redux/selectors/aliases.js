export const getAllAliases = (state) => state.aliases;

export const getAliasById = (state, { id }) => state.aliases.get(id);
