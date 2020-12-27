import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';

import { getAllWallets } from '../../../../redux/selectors/wallets';
import WalletItem from '../Wallet/Item/WalletItem';
import List from '../../../common/lists/List/List';

const AdminWalletList = ({ onChange, walletId }) => {
  const wallets = useSelector(getAllWallets);

  const itemMapper = () => [...wallets.values()].map(({ objectId }) => (
    <WalletItem
      key={objectId}
      walletId={objectId}
      onChange={onChange}
      classNames={[walletId === objectId ? 'selected' : '']}
    />
  ));

  return (
    <List
      dropdown
      checkWidth
      title="[ADMIN]"
      classNames={['WalletList']}
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
