import { createSelector } from 'reselect';
import { getWalletById, getWalletIdsByCurrentUser } from './wallets';

export const SortBy = {
  DATE: 'date',
  AMOUNT: 'amount',
};

export const getAllTransactions = (state) => state.transactions;

export const getTransactionById = (state, transactionId) => state.transaction.get(transactionId);

export const getIdentityIdsByTransaction = (state, transactionId) => {
  const transaction = getTransactionById(state, transactionId);
  const toWallet = getWalletById(state, transaction.toWalletId);
  const fromWallet = getWalletById(state, transaction.fromWalletId);

  return ([fromWallet.ownerAliasId || fromWallet.ownerId, toWallet.ownerAliasId || toWallet.ownerId]);
};

export const getTransactionIdsByWallets = (walletIds) => createSelector(
  [getAllTransactions],
  (transactions) => [...transactions.values()]
    .filter(({ fromWalletId, toWalletId }) => walletIds.includes(fromWalletId) || walletIds.includes(toWalletId))
    .map(({ objectId }) => objectId),
);

export const getTransactionIdsByCurrentUser = createSelector(
  [getAllTransactions, getWalletIdsByCurrentUser],
  (transactions, walletIds) => [...transactions.values()]
    .filter(({ fromWalletId, toWalletId }) => walletIds.includes(fromWalletId) || walletIds.includes(toWalletId))
    .map(({ objectId }) => objectId),
);
