import React from 'react';
import { func, number } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import TransactionList from './lists/Transaction/TransactionList';
import { getWalletIdsByCurrentUser } from '../../redux/selectors/wallets';

const Wallet = ({ onClick, order }) => {
  const walletIds = useSelector(getWalletIdsByCurrentUser);

  return (
    <Window
      classNames={['Wallet']}
      order={order}
      title="wallet"
      onClick={onClick}
    >
      <TransactionList walletIds={walletIds} />
    </Window>
  );
};

export default React.memo(Wallet);

Wallet.propTypes = {
  onClick: func.isRequired,
  order: number.isRequired,
};
