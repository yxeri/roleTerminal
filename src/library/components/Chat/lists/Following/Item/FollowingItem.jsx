import React, { useCallback } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoomById } from '../../../../../redux/selectors/rooms';

const FollowingItem = ({ roomId, onChange, className = '' }) => {
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  const onClick = useCallback(() => onChange({ roomId }), [roomId]);

  return (
    <ListItem
      className={`FollowingItem ${className}`}
      key={roomId}
      onClick={onClick}
    >
      {room.roomName}
    </ListItem>
  );
};

export default React.memo(FollowingItem);

FollowingItem.propTypes = {
  roomId: string.isRequired,
  onChange: func.isRequired,
  className: string,
};

FollowingItem.defaultProps = {
  className: '',
};
