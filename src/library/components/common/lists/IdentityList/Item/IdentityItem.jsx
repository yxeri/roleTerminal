import React, { useCallback } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import ListItem from '../../List/Item/ListItem';
import { getIdentityName } from '../../../../../redux/selectors/users';

const IdentityItem = ({ identityId, onClick }) => {
  const name = useSelector((state) => getIdentityName(state, { id: identityId }));

  const onClickCall = useCallback(() => {
    if (onClick) {
      onClick();
    }

    store.dispatch(changeWindowOrder({
      windows: [{
        id: `${WindowTypes.DIALOGIDENTITY}-${identityId}`,
        value: {
          identityId,
          type: WindowTypes.DIALOGIDENTITY,
        },
      }],
    }));
  }, [identityId]);

  return (
    <ListItem
      stopPropagation
      key={identityId}
      onClick={onClickCall}
    >
      {name || '-'}
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
