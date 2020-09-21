export const SortBy = {
  NAME: 'name',
};

export const getPositions = (state, { positionType, sortBy = '' } = {}) => {
  const positions = positionType
    ? getPositionsByType(state, { positionType })
    : getAllPositions(state);

  switch (sortBy) {
    case SortBy.NAME: {
      return positions.sort((a, b) => {
        const aParam = a.positionName.toLowerCase();
        const bParam = b.positionName.toLowerCase();

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    default: {
      return positions;
    }
  }
};

export const getPositionsByType = (state, { positionType }) => {
  return state.positions.values().filter((position) => position.positionType === positionType);
};

export const getAllPositions = (state, { getMap = false } = {}) => {
  if (getMap) {
    return state.positions;
  }

  return [...state.positions.values()];
};
