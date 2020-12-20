import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from './List/List';
import { getOthersIdentities } from '../../../redux/selectors/users';
import UserDialog from '../dialogs/UserDialog';
import { createDialog } from '../../helper';
import ListItem from './List/Item/ListItem';

export const choices = {
  WHISPER: 'whisper',
};

const UserList = ({ onDialog, onDone }) => {
  const identities = useSelector(getOthersIdentities);

  const userMapper = () => identities.map((identity) => (
    <ListItem
      key={identity.objectId}
      onClick={() => {
        onDialog((createDialog(
          <UserDialog
            done={(params) => {
              onDone(params);
              onDialog();
            }}
            identityId={identity.objectId}
          />,
        )));
      }}
    >
      {identity.username || identity.aliasName}
    </ListItem>
  ));

  return (
    <List
      dropdown
      classNames={['UserList']}
      title="Users"
    >
      {userMapper()}
    </List>
  );
};

export default React.memo(UserList);

UserList.propTypes = {
  onDialog: func.isRequired,
  onDone: func.isRequired,
};
