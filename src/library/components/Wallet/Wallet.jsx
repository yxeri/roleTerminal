import React from 'react';
import { func, number } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import TransactionList from './lists/TransactionList/TransactionList';
import { getCurrentUser } from '../../redux/selectors/users';
import { getWalletByOwners } from '../../redux/selectors/wallets';

const Wallet = ({ onClick, order }) => {
  const user = useSelector(getCurrentUser);
  const wallets = useSelector((state) => getWalletByOwners(state, {
    ownerIds: [user.objectId].concat(user.aliases),
  }));

  return (
    <Window
      classNames={['Wallet']}
      order={order}
      title="wallet"
      onClick={onClick}
    >
      <TransactionList walletIds={wallets.map((wallet) => wallet.objectId)} />
    </Window>
  );
};

export default React.memo(Wallet);

Wallet.propTypes = {
  onClick: func.isRequired,
  order: number.isRequired,
};
