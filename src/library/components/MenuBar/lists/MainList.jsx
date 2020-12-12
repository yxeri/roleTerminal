import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import List from '../../common/sub-components/List/List';
import { AccessLevels } from '../../../AccessCentral';
import LoginDialog from '../../common/dialogs/LoginDialog';
import RegisterDialog from '../../common/dialogs/RegisterDialog';
import { logout } from '../../../socket/actions/auth';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';
import { createDialog } from '../../helper';
import ListItem from '../../common/sub-components/List/ListItem/ListItem';

export default function MainList() {
  const [dialog, setDialog] = useState();
  const accessLevel = useSelector(getCurrentAccessLevel);
  const items = [];

  if (accessLevel === AccessLevels.ANONYMOUS) {
    items.push(
      <ListItem
        key="register"
        onClick={() => {
          setDialog(createDialog(<RegisterDialog done={() => setDialog()} />));
        }}
      >
        Create user
      </ListItem>,
      <ListItem
        key="login"
        onClick={() => {
          setDialog(createDialog(<LoginDialog done={() => setDialog()} />));
        }}
      >
        Login
      </ListItem>,
    );
  }

  if (accessLevel >= AccessLevels.STANDARD) {
    items.push(
      <ListItem
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
    <>
      <List
        dropdown
        title="Main"
      >
        {items}
      </List>
      {dialog}
    </>
  );
}
