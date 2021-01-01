import createCachedSelector from 're-reselect';

import { getCurrentUser } from './users';

export const getAllWallets = (state) => state.wallets;

export const getWalletById = (state, { id }) => state.wallets.get(id);

export const getWalletIds = createCachedSelector(
  [getAllWallets],
  (wallets) => [...wallets.values()].map((wallet) => wallet.objectId),
)(() => 'wallet-ids');

export const getWalletIdsByCurrentUser = createCachedSelector(
  [getAllWallets, getCurrentUser],
  (wallets, currentUser) => [...wallets.values()]
    .filter((wallet) => wallet.ownerId === currentUser.objectId || currentUser.aliases.includes(wallet.ownerAliasId))
    .map((wallet) => wallet.objectId),
)(() => 'wallet-ids-current-user');
