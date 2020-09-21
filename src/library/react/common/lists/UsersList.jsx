import React from 'react';
import { useSelector } from 'react-redux';

import List from '../sub-components/List';
import { getIdentities, SortBy } from '../../redux/selectors/users';

const UsersList = () => {
  const identities = useSelector((state) => getIdentities(state, { sortBy: SortBy.NAME }));

  return (
    <div
      key="usersList"
      className="usersList"
    >
      <List
        title="Users"
        items={identities.map((identity) => {
          return {
            key: identity.objectId,
            value: identity.username || identity.aliasName,
            onClick: () => { console.log(identity); },
          };
        })}
      />
    </div>
  );
};

export default UsersList;
