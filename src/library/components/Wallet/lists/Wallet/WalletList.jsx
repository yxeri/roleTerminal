import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';

import List from '../../../common/lists/List/List';
import { getWalletIdsByCurrentUser } from '../../../../redux/selectors/wallets';
import WalletItem from './Item/WalletItem';

const WalletList = ({ onChange }) => {
  const walletIds = useSelector(getWalletIdsByCurrentUser);

  const itemMapper = () => walletIds.map((walletId) => <WalletItem key={walletId} walletId={walletId} onChange={onChange} />);

  return (
    <List
      dropdown
      checkWidth
      title="Your wallets"
      classNames={['WalletList']}
    >
      <WalletItem key="showAll" onChange={onChange} walletId="showAll" />
      {itemMapper()}
    </List>
  );
};

export default React.memo(WalletList);

WalletList.propTypes = {
  onChange: func.isRequired,
};
