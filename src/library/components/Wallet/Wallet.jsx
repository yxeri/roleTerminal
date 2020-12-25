import React, { useCallback, useState } from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import TransactionList from './lists/Transaction/TransactionList';
import { getWalletIdsByCurrentUser } from '../../redux/selectors/wallets';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import IdentityList from '../common/lists/IdentityList/IdentityList';
import WalletList from './lists/Wallet/WalletList';
import { getIdentityOrTeamById } from '../../redux/selectors/users';

import './Wallet.scss';

const Wallet = ({ id }) => {
  const [walletId, setWalletId] = useState('showAll');
  const currentWalletIds = useSelector(getWalletIdsByCurrentUser);
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: walletId }));

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.WALLET } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onChange = useCallback((newWalletId) => setWalletId(newWalletId), []);

  return (
    <Window
      done={onDone}
      classNames={['Wallet']}
      title={`Wallet${identity ? `: ${identity.teamName || identity.aliasName || identity.username}` : 's'}`}
      onClick={onClick}
      menu={(
        <>
          <WalletList key="walletList" onChange={onChange} />
          <IdentityList key="identityList" />
        </>
      )}
    >
      <TransactionList
        key="transactionList"
        walletIds={walletId !== 'showAll' ? [walletId] : currentWalletIds}
      />
    </Window>
  );
};

export default React.memo(Wallet);

Wallet.propTypes = {
  id: string.isRequired,
};
