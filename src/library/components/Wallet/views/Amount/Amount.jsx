import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import { getWalletById } from '../../../../redux/selectors/wallets';
import { getUserId } from '../../../../redux/selectors/userId';

import './Amount.scss';

const Amount = ({ walletId }) => {
  const currentUserId = useSelector(getUserId);
  const wallet = useSelector((state) => getWalletById(state, { id: walletId !== 'showAll' ? walletId : currentUserId }));
  const isNegative = wallet.amount < 0;

  return (
    <div className="Amount">
      <span>Balance</span>
      <span className={isNegative ? 'negative' : ''}>
        {isNegative ? '-' : ''}
        {wallet.amount}
      </span>
    </div>
  );
};

export default React.memo(Amount);

Amount.propTypes = {
  walletId: string.isRequired,
};
