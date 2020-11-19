import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import List from '../../common/sub-components/List/List';
import { AccessLevels } from '../../../AccessCentral';
import LoginDialog from '../../common/dialogs/LoginDialog';
import RegisterDialog from '../../common/dialogs/RegisterDialog';
import { emitSocketEvent, logout } from '../../../SocketManager';
import { USERID } from '../../../redux/actionTypes';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

export default function MainList() {
  const [dialog, setDialog] = useState();
  const dispatch = useDispatch();
  const accessLevel = useSelector(getCurrentAccessLevel);
  const items = [];
  const main = document.querySelector('#main');

  if (accessLevel === AccessLevels.ANONYMOUS) {
    items.push({
      key: 'register',
      value: 'Create user',
      onClick: () => {
        setDialog(createPortal(<RegisterDialog done={() => setDialog()} />, main));
      },
    });
    items.push({
      key: 'login',
      value: 'Login',
      onClick: () => {
        setDialog(createPortal(<LoginDialog done={() => setDialog()} />, main));
      },
    });
  }

  if (accessLevel >= AccessLevels.STANDARD) {
    items.push({
      key: 'logout',
      value: 'Logout',
      onClick: () => {
        logout();
      },
    });
  }

  return (
    <>
      <List
        dropdown
        title="Main"
        items={items}
      />
      {dialog}
    </>
  );
}
