import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import ListItem from '../../List/Item/ListItem';
import { getIdentityById } from '../../../../../redux/selectors/users';

const IdentityItem = ({ identityId }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));

  return (
    <ListItem
      stopPropagation
      key={identity.objectId}
      onClick={() => {
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
  );
};

export default React.memo(IdentityItem);

IdentityItem.propTypes = {
  identityId: string.isRequired,
};
