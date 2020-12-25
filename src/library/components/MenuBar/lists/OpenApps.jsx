import React from 'react';
import { useSelector } from 'react-redux';

import List from '../../common/lists/List/List';
import ListItem from '../../common/lists/List/Item/ListItem';
import Button from '../../common/sub-components/Button/Button';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import store from '../../../redux/store';
import { changeWindowOrder } from '../../../redux/actions/windowOrder';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';
import { AccessLevels } from '../../../AccessCentral';

import { ReactComponent as Chat } from '../../../icons/chat.svg';
import { ReactComponent as Map } from '../../../icons/map.svg';
import { ReactComponent as Wallet } from '../../../icons/wallet.svg';
import { ReactComponent as File } from '../../../icons/file.svg';

const OpenApps = () => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  const changeOrder = ({ id, value }) => store.dispatch(changeWindowOrder({ windows: [{ id, value }] }));

  return (
    <List classNames={['OpenApps']}>
      <ListItem key="chat"><Button onClick={() => changeOrder({ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT } })}><Chat /></Button></ListItem>
      <ListItem key="docFile"><Button onClick={() => changeOrder({ id: WindowTypes.DOCFILE, value: { type: WindowTypes.DOCFILE } })}><File /></Button></ListItem>
      <ListItem key="map"><Button onClick={() => changeOrder({ id: WindowTypes.WORLDMAP, value: { type: WindowTypes.WORLDMAP } })}><Map /></Button></ListItem>
      {accessLevel >= AccessLevels.STANDARD && (
        <ListItem key="wallet"><Button onClick={() => changeOrder({ id: WindowTypes.WALLET, value: { type: WindowTypes.WALLET } })}><Wallet /></Button></ListItem>
      )}
    </List>
  );
};

export default React.memo(OpenApps);
