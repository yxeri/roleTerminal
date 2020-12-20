import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';

import List from '../../common/lists/List/List';
import { AccessLevels } from '../../../AccessCentral';
import LoginDialog from '../../common/dialogs/LoginDialog';
import RegisterDialog from '../../common/dialogs/RegisterDialog';
import { logout } from '../../../socket/actions/auth';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';
import { createDialog } from '../../helper';
import ListItem from '../../common/lists/List/Item/ListItem';

const MainList = ({ onDialog }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const items = [];

  if (accessLevel === AccessLevels.ANONYMOUS) {
    items.push(
      <ListItem
        key="register"
        onClick={() => {
          onDialog(createDialog(<RegisterDialog done={() => onDialog()} />));
        }}
      >
        Create user
      </ListItem>,
      <ListItem
        key="login"
        onClick={() => {
          onDialog(createDialog(<LoginDialog done={() => onDialog()} />));
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
    <List
      dropdown
      title="Main"
    >
      {items}
    </List>
  );
};

export default MainList;

MainList.propTypes = {
  onDialog: func.isRequired,
};
