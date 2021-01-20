import React, { useCallback } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import ListItem from '../../List/Item/ListItem';
import { getIdentityImage, getIdentityName } from '../../../../../redux/selectors/users';
import Image from '../../../sub-components/Image/Image';
import { ReactComponent as Square } from '../../../../../icons/square.svg';

import './IdentityItem.scss';

const IdentityItem = ({ identityId, onClick }) => {
  const name = useSelector((state) => getIdentityName(state, { id: identityId }));
  const image = useSelector((state) => getIdentityImage(state, { id: identityId }));

  const onClickCall = useCallback(() => {
    if (onClick) {
      onClick();
    }

    store.dispatch(changeWindowOrder({
      windows: [{
        id: `${WindowTypes.DIALOGPROFILE}-${identityId}`,
        value: {
          identityId,
          type: WindowTypes.DIALOGPROFILE,
        },
      }],
    }));
  }, [identityId]);

  return (
    <ListItem
      stopPropagation
      className="IdentityItem"
      key={identityId}
      onClick={onClickCall}
    >
      <div className="icon">
        {
          image
            ? <Image image={`/upload/images/${image.thumbFileName}`} />
            : <Square />
        }
      </div>
      <span>{name || '-'}</span>
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
