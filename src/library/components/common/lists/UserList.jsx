import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from './List/List';
import { getOthersIdentities } from '../../../redux/selectors/users';
import ListItem from './List/Item/ListItem';
import store from '../../../redux/store';
import { changeWindowOrder } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const UserList = () => {
  const identities = useSelector(getOthersIdentities);

  const userMapper = () => identities.map((identity) => (
    <ListItem
      key={identity.objectId}
      onClick={(event) => {
        event.stopPropagation();

        store.dispatch(changeWindowOrder({
          windows: [{
            id: `${WindowTypes.DIALOGIDENTITY}-${identity.objectId}`,
            value: {
              identityId: identity.objectId,
              type: WindowTypes.DIALOGIDENTITY,
            },
          }],
        }));
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
