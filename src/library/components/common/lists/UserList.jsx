import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import List from '../sub-components/List/List';
import { getIdentities, SortBy } from '../../../redux/selectors/users';
import UserDialog from '../dialogs/UserDialog';
import { createDialog } from '../../helper';
import ListItem from '../sub-components/List/ListItem/ListItem';

const UserList = () => {
  const identities = useSelector((state) => getIdentities(state, { sortBy: SortBy.NAME }));
  const [dialog, setDialog] = useState();

  const userMapper = () => identities.map((identity) => (
    <ListItem
      key={identity.objectId}
      onClick={() => {
        setDialog(createDialog(<UserDialog done={() => {}} userId={identity.objectId} />));
      }}
    >
      {identity.username || identity.aliasName}
    </ListItem>
  ));

  return (
    <>
      <List
        dropdown
        classNames={['UserList']}
        title="Users"
      >
        {userMapper()}
      </List>
      {dialog}
    </>
  );
};

export default UserList;
