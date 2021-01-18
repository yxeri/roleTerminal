import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getTransactionById } from '../../../../../redux/selectors/transactions';
import { getIdentityOrTeamById } from '../../../../../redux/selectors/users';
import { getDayModification, getYearModification } from '../../../../../redux/selectors/config';
import { getTimestamp } from '../../../../../TextTools';

import './TransactionItem.scss';

const TransactionItem = ({ transactionId }) => {
  const transaction = useSelector((state) => getTransactionById(state, { id: transactionId }));
  const from = useSelector((state) => getIdentityOrTeamById(state, { id: transaction.fromWalletId }));
  const to = useSelector((state) => getIdentityOrTeamById(state, { id: transaction.toWalletId }));
  const dayModification = useSelector(getDayModification);
  const yearModification = useSelector(getYearModification);
  const timestamp = getTimestamp({ date: transaction.customTimeCreated || transaction.timeCreated, dayModification, yearModification });

  return (
    <ListItem
      className="TransactionItem"
    >
      <p>{timestamp.fullStamp}</p>
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
