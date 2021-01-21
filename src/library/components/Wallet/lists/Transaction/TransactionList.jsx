import React from 'react';
import { arrayOf, string } from 'prop-types';
import { useSelector } from 'react-redux';
import List from '../../../common/lists/List/List';
import TransactionItem from './Item/TransactionItem';
import { getTransactionIdsByWallets } from '../../../../redux/selectors/transactions';

import './TransactionList.scss';

const TransactionList = ({ walletIds }) => {
  const transactions = useSelector((state) => getTransactionIdsByWallets(state, { ids: walletIds }));

  const items = transactions.map(({ objectId, isSender }) => <TransactionItem key={objectId} transactionId={objectId} isSender={isSender} singleWallet={walletIds.length === 1} />);

  return (
    <List
      observe="upper"
      className="TransactionList"
    >
      {items}
    </List>
  );
};

export default React.memo(TransactionList);

TransactionList.propTypes = {
  walletIds: arrayOf(string).isRequired,
};
