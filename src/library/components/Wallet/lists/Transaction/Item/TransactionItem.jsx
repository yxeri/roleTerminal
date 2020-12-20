import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getIdentityIdsByTransaction, getTransactionById } from '../../../../../redux/selectors/transactions';

const TransactionItem = ({ transactionId }) => {
  const transaction = useSelector((state) => getTransactionById(state, transactionId));
  const [from, to] = useSelector((state) => getIdentityIdsByTransaction(state, getIdentityIdsByTransaction(state, transactionId)));

  return (
    <ListItem
      classNames={['TransactionItem']}
      key={transactionId}
    >
      <span>{transaction.amount}</span>
      <span>{from.aliasName || from.username}</span>
      <span>{to.aliasName || to.username}</span>
    </ListItem>
  );
};

export default React.memo(TransactionItem);

TransactionItem.propTypes = {
  transactionId: string.isRequired,
};
