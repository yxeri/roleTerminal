import React, { useCallback } from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import TransactionList from './lists/Transaction/TransactionList';
import { getWalletIdsByCurrentUser } from '../../redux/selectors/wallets';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

const Wallet = ({ id }) => {
  const walletIds = useSelector(getWalletIdsByCurrentUser);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.WALLET } }] }));
  }, []);

  return (
    <Window
      done={() => store.dispatch(removeWindow({ id }))}
      classNames={['Wallet']}
      title="wallet"
      onClick={onClick}
    >
      <TransactionList walletIds={walletIds} />
    </Window>
  );
};

export default React.memo(Wallet);

Wallet.propTypes = {
  id: string.isRequired,
};
