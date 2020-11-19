import React from 'react';
import { useSelector } from 'react-redux';
import List from '../../common/sub-components/List/List';
import { getCurrentUserIdentities } from '../../../redux/selectors/users';

export default function Identities() {
  const identities = useSelector(getCurrentUserIdentities);

  return (
    <div className="identitiesList">
      <List
        title=""
        items=""
      />
    </div>
  );
}
