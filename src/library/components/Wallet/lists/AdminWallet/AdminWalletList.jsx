import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';

import { getWalletIds } from '../../../../redux/selectors/wallets';
import WalletItem from '../Wallet/Item/WalletItem';
import List from '../../../common/lists/List/List';

const AdminWalletList = ({ onChange, walletId }) => {
  const walletIds = useSelector(getWalletIds);

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
      title="[ADMIN]"
      className="WalletList"
    >
      {itemMapper()}
    </List>
  );
};

export default React.memo(AdminWalletList);

AdminWalletList.propTypes = {
  onChange: func.isRequired,
  walletId: string.isRequired,
};
