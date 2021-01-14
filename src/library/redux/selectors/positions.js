import { createSelector } from 'reselect';

export const getAllPositions = (state) => state.positions;

export const getPositionById = (state, { id }) => state.positions.get(id);

export const getPositionNamesByType = (type) => createSelector(
  [getAllPositions],
  (positions) => [...positions.values()]
    .filter(({ positionType }) => type === positionType)
    .map(({ positionName, objectId }) => ({ positionName, objectId })),
);
