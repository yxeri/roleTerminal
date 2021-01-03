import React, { useCallback, useMemo, useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import TransactionList from './lists/Transaction/TransactionList';
import { getWalletIdsByCurrentUser } from '../../redux/selectors/wallets';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import IdentityList from '../common/lists/IdentityList/IdentityList';
import WalletList from './lists/Wallet/WalletList';
import { getCurrentAccessLevel, getIdentityOrTeamById } from '../../redux/selectors/users';
import { AccessLevels } from '../../AccessCentral';
import AdminWalletList from './lists/AdminWallet/AdminWalletList';

import './Wallet.scss';

const Wallet = ({ id, index }) => {
  const [walletId, setWalletId] = useState('showAll');
  const currentWalletIds = useSelector(getWalletIdsByCurrentUser);
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: walletId }));
  const accessLevel = useSelector(getCurrentAccessLevel);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.WALLET } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onChange = useCallback((newWalletId) => setWalletId(newWalletId), []);

  const menu = useMemo(() => (
    <>
      <WalletList key="walletList" onChange={onChange} walletId={walletId} />
      <IdentityList key="identityList" />
      {accessLevel >= AccessLevels.MODERATOR && (
        <AdminWalletList key="adminWalletList" onChange={onChange} walletId={walletId} />
      )}
    </>
  ), [onChange, walletId]);

  return (
    <Window
      id={id}
      className="Wallet"
      index={index}
      done={onDone}
      title={`Wallet${identity ? `: ${identity.teamName || identity.aliasName || identity.username}` : ''}`}
      onClick={onClick}
      menu={menu}
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
  index: number.isRequired,
};
