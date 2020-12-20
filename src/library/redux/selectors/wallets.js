import { createSelector } from 'reselect';
import { getCurrentUser } from './users';

export const getAllWallets = (state) => state.wallets;

export const getWalletById = (state, walletId) => state.wallets.get(walletId);

export const getWalletIdsByCurrentUser = createSelector(
  [getAllWallets, getCurrentUser],
  (wallets, currentUser) => [...wallets.values()]
    .filter((wallet) => {
      const ownerId = wallet.ownerAliasId || wallet.ownerId;

      return ownerId === currentUser.objectId || currentUser.aliases.includes(ownerId);
    })
    .map(({ objectId }) => objectId),
);
