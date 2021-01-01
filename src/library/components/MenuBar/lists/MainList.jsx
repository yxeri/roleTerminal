import React from 'react';
import { useSelector } from 'react-redux';

import List from '../../common/lists/List/List';
import { AccessLevels } from '../../../AccessCentral';
import { logout } from '../../../socket/actions/auth';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';
import ListItem from '../../common/lists/List/Item/ListItem';
import { ReactComponent as Menu } from '../../../icons/menu.svg';
import store from '../../../redux/store';
import { changeWindowOrder } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { getPermissions } from '../../../redux/selectors/config';

const MainList = () => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const permissions = useSelector(getPermissions);
  const items = [];

  if (accessLevel === permissions.CreateUser.accessLevel) {
    items.push(
      <ListItem
        stopPropagation
        key="register"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGREGISTER, value: { type: WindowTypes.DIALOGREGISTER } }] }))}
      >
        Create user
      </ListItem>,
    );
  }

  if (accessLevel === AccessLevels.ANONYMOUS) {
    items.push(
      <ListItem
        stopPropagation
        key="login"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGLOGIN, value: { type: WindowTypes.DIALOGLOGIN } }] }))}
      >
        Login
      </ListItem>,
    );
  }

  if (accessLevel >= permissions.CreateAlias.accessLevel) {
    items.push(
      <ListItem
        stopPropagation
        key="alias"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEALIAS, value: { type: WindowTypes.DIALOGCREATEALIAS } }] }))}
      >
        Create alias
      </ListItem>,
    );
  }

  if (accessLevel >= AccessLevels.STANDARD) {
    items.push(
      <ListItem
        stopPropagation
        key="settings"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCONFIGSYSTEM, value: { type: WindowTypes.DIALOGCONFIGSYSTEM } }] }))}
      >
        Settings
      </ListItem>,
    );
    items.push(
      <ListItem
        stopPropagation
        key="logout"
        onClick={() => {
          logout();
        }}
      >
        Logout
      </ListItem>,
    );
  }

  return (
    <List
      dropdown
      title={<Menu />}
    >
      {items}
    </List>
  );
};

export default React.memo(MainList);
