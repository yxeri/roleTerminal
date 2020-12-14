import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from './List/List';
import { getOthersIdentities } from '../../../redux/selectors/users';
import UserDialog from '../dialogs/UserDialog';
import { createDialog } from '../../helper';
import ListItem from './List/ListItem/ListItem';

const UserList = ({ onDialog }) => {
  const identities = useSelector(getOthersIdentities);

  const userMapper = () => identities.map((identity) => (
    <ListItem
      key={identity.objectId}
      onClick={() => {
        onDialog(createDialog(<UserDialog done={() => onDialog()} userId={identity.objectId} />));
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
};
