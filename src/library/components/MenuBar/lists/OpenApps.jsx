import React from 'react';
import List from '../../common/lists/List/List';
import ListItem from '../../common/lists/List/Item/ListItem';

import { ReactComponent as Chat } from '../../../icons/chat.svg';
import { ReactComponent as Map } from '../../../icons/map.svg';
import { ReactComponent as Wallet } from '../../../icons/wallet.svg';
import Button from '../../common/sub-components/Button/Button';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import store from '../../../redux/store';
import { changeWindowOrder } from '../../../redux/actions/windowOrder';

const OpenApps = () => {
  const changeOrder = ({ id, value }) => store.dispatch(changeWindowOrder({ windows: [{ id, value }] }));

  return (
    <List classNames={['OpenApps']}>
      <ListItem key="wallet"><Button onClick={() => changeOrder({ id: WindowTypes.WALLET, value: { type: WindowTypes.WALLET } })}><Wallet /></Button></ListItem>
      <ListItem key="map"><Button onClick={() => changeOrder({ id: WindowTypes.WORLDMAP, value: { type: WindowTypes.WORLDMAP } })}><Map /></Button></ListItem>
      <ListItem key="chat"><Button onClick={() => changeOrder({ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT } })}><Chat /></Button></ListItem>
    </List>
  );
};

export default React.memo(OpenApps);
