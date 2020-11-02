import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import List from '../sub-components/List';
import { getIdentities, SortBy } from '../../../redux/selectors/users';
import UserDialog from '../dialogs/UserDialog';

export default function UserList() {
  const identities = useSelector((state) => getIdentities(state, { sortBy: SortBy.NAME }));
  const [dialog, setDialog] = useState();
  const main = document.querySelector('#main');

  return (
    <>
      <List
        classNames={['userList']}
        title="Users"
        items={identities.map((identity) => ({
          key: identity.objectId,
          value: identity.username || identity.aliasName,
          onClick: () => {
            setDialog(createPortal(<UserDialog />, main));
          },
        }))}
      />
      {dialog}
    </>
  );
}
