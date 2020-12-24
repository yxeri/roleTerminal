import React from 'react';
import { useSelector } from 'react-redux';
import List from '../List/List';
import { getOthersIdentityIds } from '../../../../redux/selectors/users';
import IdentityItem from './Item/IdentityItem';

const IdentityList = () => {
  const identityIds = useSelector(getOthersIdentityIds);

  const userMapper = () => identityIds.map((identityId) => <IdentityItem key={identityId} identityId={identityId} />);

  return (
    <List
      dropdown
      checkWidth
      classNames={['IdentityList']}
      title="Users"
    >
      {userMapper()}
    </List>
  );
};

export default React.memo(IdentityList);
