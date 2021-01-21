import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';

import List from '../../../common/lists/List/List';
import { getWalletIdsByCurrentUser } from '../../../../redux/selectors/wallets';
import WalletItem from './Item/WalletItem';
import { ReactComponent as Wallet } from '../../../../icons/wallet.svg';

const WalletList = ({ onChange, walletId }) => {
  const walletIds = useSelector(getWalletIdsByCurrentUser);

  const itemMapper = () => walletIds.map((id) => (
    <WalletItem
      key={id}
      walletId={id}
      onChange={onChange}
      className={walletId === id ? 'selected' : ''}
    />
  ));

  return (
    <List
      dropdown
      checkWidth
      title={(
        <Wallet />
      )}
      className="WalletList"
    >
      <WalletItem
        className={walletId === 'showAll' ? 'selected' : ''}
        key="showAll"
        onChange={onChange}
        walletId="showAll"
      />
      {itemMapper()}
    </List>
  );
};

export default React.memo(WalletList);

WalletList.propTypes = {
  onChange: func.isRequired,
  walletId: string.isRequired,
};
