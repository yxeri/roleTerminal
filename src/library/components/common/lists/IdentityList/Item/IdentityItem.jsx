import React, { useCallback } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import ListItem from '../../List/Item/ListItem';
import { getIdentityById } from '../../../../../redux/selectors/users';

const IdentityItem = ({ identityId, onClick }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));

  const onClickCall = useCallback(() => {
    if (onClick) {
      onClick();
    }

    store.dispatch(changeWindowOrder({
      windows: [{
        id: `${WindowTypes.DIALOGIDENTITY}-${identity.objectId}`,
        value: {
          identityId: identity.objectId,
          type: WindowTypes.DIALOGIDENTITY,
        },
      }],
    }));
  }, [identity.objectId]);

  return (
    <ListItem
      stopPropagation
      key={identity.objectId}
      onClick={onClickCall}
    >
      {identity.username || identity.aliasName}
    </ListItem>
  );
};

export default React.memo(IdentityItem);

IdentityItem.propTypes = {
  identityId: string.isRequired,
  onClick: func,
};

IdentityItem.defaultProps = {
  onClick: undefined,
};
