export const getAllAliases = (state, { getMap = false } = {}) => {
  if (getMap) {
    return state.aliases;
  }

  return [...state.aliases.values()];
};

export const getAlias = (state, { aliasId }) => state.aliases.get(aliasId);
