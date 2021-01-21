import React from 'react';
import { useSelector } from 'react-redux';
import { bool, string } from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getTransactionById } from '../../../../../redux/selectors/transactions';
import { getIdentityOrTeamName } from '../../../../../redux/selectors/users';
import { getDayModification, getYearModification } from '../../../../../redux/selectors/config';
import { getTimestamp } from '../../../../../TextTools';
import { ReactComponent as User } from '../../../../../icons/user.svg';
import { ReactComponent as Team } from '../../../../../icons/team.svg';
import { ReactComponent as System } from '../../../../../icons/cpu.svg';

import './TransactionItem.scss';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';

const Icons = {
  identity: <User />,
  team: <Team />,
  system: <System />,
};

const TransactionItem = ({ transactionId, isSender }) => {
  const transaction = useSelector((state) => getTransactionById(state, { id: transactionId }));
  const { name: fromName, type: fromType } = useSelector((state) => getIdentityOrTeamName(state, { id: transaction.fromWalletId }));
  const { name: toName, type: toType } = useSelector((state) => getIdentityOrTeamName(state, { id: transaction.toWalletId }));
  const dayModification = useSelector(getDayModification);
  const yearModification = useSelector(getYearModification);
  const timestamp = getTimestamp({ date: transaction.customTimeCreated || transaction.timeCreated, dayModification, yearModification });

  const otherType = isSender ? toType : fromType;
  const currentType = isSender ? fromType : toType;

  return (
    <ListItem
      className={`TransactionItem ${isSender ? 'sender' : ''}`}
    >
      <div className="other">
        {Icons[otherType]}
        <p
          className={(otherType === 'identity' || otherType === 'team') && 'clickable'}
          onClick={(event) => {
            event.stopPropagation();

            if (otherType === 'identity') {
              store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGPROFILE}-${transaction.toWalletId}`, value: { type: WindowTypes.DIALOGPROFILE, identityId: transaction.toWalletId } }] }));
            } else if (otherType === 'team') {
              // store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGPROFILE}-${transaction.toWalletId}`, value: { type: WindowTypes.DIALOGPROFILE, identityId: transaction.toWalletId } }] }));
            }
          }}
        >
          <span>{isSender ? toName : fromName}</span>
        </p>
        <p className="time">
          <span>{timestamp.halfDate}</span>
          <span>{timestamp.halfTime}</span>
        </p>
      </div>
      {transaction.note && (
        <div className="note">
          <p>{transaction.note}</p>
        </div>
      )}
      <div className="current">
        {Icons[currentType]}
        <p>{isSender ? fromName : toName}</p>
      </div>
      <div className="amount">
        <p className={isSender ? 'negative' : ''}>{`${isSender ? '-' : '+'}${transaction.amount}`}</p>
      </div>
    </ListItem>
  );
};

export default React.memo(TransactionItem);

TransactionItem.propTypes = {
  transactionId: string.isRequired,
  isSender: bool.isRequired,
};
