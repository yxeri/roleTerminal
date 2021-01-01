import React from 'react';
import { arrayOf, string } from 'prop-types';
import { useSelector } from 'react-redux';
import List from '../../../common/lists/List/List';
import TransactionItem from './Item/TransactionItem';
import { getTransactionIdsByWallets } from '../../../../redux/selectors/transactions';

const TransactionList = ({ walletIds }) => {
  const transactionIds = useSelector((state) => getTransactionIdsByWallets(state, { ids: walletIds }));

  const transactionMapper = () => transactionIds.map((transactionId) => <TransactionItem key={transactionId} transactionId={transactionId} />);

  return (
    <List>
      {transactionMapper()}
    </List>
  );
};

export default React.memo(TransactionList);

TransactionList.propTypes = {
  walletIds: arrayOf(string).isRequired,
};
