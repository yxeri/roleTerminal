export const getAllWallets = (state) => [...state.wallets.values()];

export const getWalletById = (state, { walletId }) => state.wallets.get(walletId);

export const getWalletByIds = (state, { walletIds }) => walletIds
  .map((walletId) => getWalletById(state, { walletId }));

export const getWalletByOwners = (state, { ownerIds }) => {
  return getAllWallets(state)
    .filter((wallet) => ownerIds.some((id) => id === wallet.ownerAliasId || id === wallet.ownerId));
};
