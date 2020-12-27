import createCachedSelector from 're-reselect';

export const SortBy = {
  DATE: 'date',
  AMOUNT: 'amount',
};

export const getAllTransactions = (state) => state.transactions;

export const getTransactionById = (state, { id }) => state.transactions.get(id);

export const getTransactionIdsByWallets = createCachedSelector(
  [
    getAllTransactions,
    (_, { ids }) => ids,
  ],
  (transactions, walletIds) => [...transactions.values()]
    .filter(({ fromWalletId, toWalletId }) => walletIds.includes(fromWalletId) || walletIds.includes(toWalletId))
    .map(({ objectId }) => objectId)
    .reverse(),
)((_, { ids }) => `transaction-ids-${ids.join(' ')}`);
