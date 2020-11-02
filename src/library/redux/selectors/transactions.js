export const SortBy = {
  DATE: 'date',
  AMOUNT: 'amount',
};

export const getAllTransactions = (state) => {
  return [...state.transactions.values()];
};

export const getTransactionsByWallets = (state, { walletIds }) => getAllTransactions(state)
  .filter((transaction) => walletIds
    .some((id) => id === transaction.toWalletId || id === transaction.fromWalletId));

export const getTransactions = (state, { walletIds, sortBy } = {}) => {
  const transactions = walletIds
    ? getTransactionsByWallets(state, { walletIds })
    : getAllTransactions(state);

  switch (sortBy) {
    case SortBy.DATE: {
      return transactions.sort((a, b) => {
        const aParam = a.customTimeCreated || a.timeCreated;
        const bParam = b.customTimeCreated || b.timeCreated;

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    case SortBy.AMOUNT: {
      return transactions.sort((a, b) => {
        return a.amount < b.amount
          ? -1
          : 1;
      });
    }
    default: {
      return transactions;
    }
  }
};
