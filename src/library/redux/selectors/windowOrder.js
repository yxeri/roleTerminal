import createCachedSelector from 're-reselect';

export const getOrder = (state) => state.windowOrder;

export const getIndexById = createCachedSelector(
  [
    getOrder,
    (_, { id }) => id,
  ],
  (order, id) => [...order.keys()].indexOf(id),
)((_, { id }) => `index-${id}`);
