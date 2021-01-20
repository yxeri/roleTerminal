import React from 'react';
import { useSelector } from 'react-redux';

import List from '../../../common/lists/List/List';
import { AccessLevels } from '../../../../AccessCentral';
import { logout } from '../../../../socket/actions/auth';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import ListItem from '../../../common/lists/List/Item/ListItem';
import { ReactComponent as Menu } from '../../../../icons/menu.svg';
import { ReactComponent as LogOut } from '../../../../icons/log-out.svg';
import { ReactComponent as Settings } from '../../../../icons/settings.svg';
import { ReactComponent as User } from '../../../../icons/user.svg';
import { ReactComponent as LogIn } from '../../../../icons/log-in.svg';
import { ReactComponent as Plus } from '../../../../icons/plus.svg';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { getPermissions } from '../../../../redux/selectors/config';
import { MessageTypes, postMessage } from '../../../../Messenger';

import './MainList.scss';

const MainList = () => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const permissions = useSelector(getPermissions);
  const items = [];

  if (accessLevel === permissions.CreateUser.accessLevel) {
    items.push(
      <ListItem
        key="register"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGREGISTER, value: { type: WindowTypes.DIALOGREGISTER } }] }))}
      >
        <Plus />
        <span>Create user</span>
      </ListItem>,
    );
  }

  if (accessLevel === AccessLevels.ANONYMOUS) {
    items.push(
      <ListItem
        key="login"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGLOGIN, value: { type: WindowTypes.DIALOGLOGIN } }] }))}
      >
        <LogIn />
        <span>Login</span>
      </ListItem>,
    );
  }

  if (accessLevel >= permissions.CreateAlias.accessLevel) {
    items.push(
      <ListItem
        key="alias"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEALIAS, value: { type: WindowTypes.DIALOGCREATEALIAS } }] }))}
      >
        <Plus />
        <span>Create alias</span>
      </ListItem>,
    );
  }

  if (accessLevel >= AccessLevels.STANDARD) {
    items.push(
      <ListItem
        key="profile"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGPROFILE, value: { type: WindowTypes.DIALOGPROFILE } }] }))}
      >
        <User />
        <span>Your profile</span>
      </ListItem>,
    );
  }

  if (accessLevel >= AccessLevels.STANDARD) {
    items.push(
      <ListItem
        key="settings"
        onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCONFIGSYSTEM, value: { type: WindowTypes.DIALOGCONFIGSYSTEM } }] }))}
      >
        <Settings />
        <span>Settings</span>
      </ListItem>,
    );
    items.push(
      <ListItem
        key="logout"
        onClick={() => {
          logout();
        }}
      >
        <LogOut />
        <span>Logout</span>
      </ListItem>,
    );
  }

  if (window.ReactNativeWebView) {
    items.push(
      <ListItem
        key="quit"
        onClick={() => {
          postMessage({ type: MessageTypes.QUIT, data: {} });
        }}
      >
        <span>Shutdown</span>
      </ListItem>,
    );
  }

  return (
    <List
      dropdown
      className="MainList"
      title={<Menu />}
    >
      {items}
    </List>
  );
};

export default React.memo(MainList);
