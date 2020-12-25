import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getTransactionById } from '../../../../../redux/selectors/transactions';
import { getIdentityOrTeamById } from '../../../../../redux/selectors/users';

import './TransactionItem.scss';
import { getTimestamp } from '../../../../../redux/selectors/config';
import store from '../../../../../redux/store';

const TransactionItem = ({ transactionId }) => {
  const transaction = useSelector((state) => getTransactionById(state, { id: transactionId }));
  const from = useSelector((state) => getIdentityOrTeamById(state, { id: transaction.fromWalletId }));
  const to = useSelector((state) => getIdentityOrTeamById(state, { id: transaction.toWalletId }));

  return (
    <ListItem
      classNames={['TransactionItem']}
    >
      <p>{getTimestamp(store.getState(), { date: new Date(transaction.customTimeCreated || transaction.timeCreated) }).fullStamp}</p>
      <p>
        {`${from.teamName || from.aliasName || from.username} -> ${to.teamName || to.aliasName || to.username}`}
      </p>
      <p>{`Amount: ${transaction.amount}`}</p>
      {transaction.note && (
        <p>{transaction.note}</p>
      )}
    </ListItem>
  );
};

export default React.memo(TransactionItem);

TransactionItem.propTypes = {
  transactionId: string.isRequired,
};
