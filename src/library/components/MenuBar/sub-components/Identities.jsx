import React from 'react';
import { useSelector } from 'react-redux';
import List from '../../common/lists/List/List';
import { getCurrentUserIdentities } from '../../../redux/selectors/users';

const Identities = () => {
  const identities = useSelector(getCurrentUserIdentities);

  return (
    <div className="Identities">
      <List
        title=""
        items=""
      />
    </div>
  );
};

export default Identities;
