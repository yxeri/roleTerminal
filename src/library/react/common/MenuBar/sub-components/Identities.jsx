import React from 'react';

import List from '../../sub-components/List';
import { useSelector } from 'react-redux';
import { getCurrentUserIdentities } from '../../../redux/selectors/users';

const Identities = () => {
  const identities = useSelector(getCurrentUserIdentities);

  return (
    <div className="identitiesList">
      <List
        title=""
        items=""
      />
    </div>
  );
};

export default Identities;
