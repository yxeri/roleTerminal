import React from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoom } from '../../../../../redux/selectors/rooms';

const FollowingItem = ({ roomId, onChange }) => {
  const room = useSelector((state) => getRoom(state, { id: roomId }));

  return (
    <ListItem
      key={roomId}
      onClick={() => {
        onChange({ roomId });
      }}
    >
      {room.roomName}
    </ListItem>
  );
};

export default React.memo(FollowingItem);

FollowingItem.propTypes = {
  roomId: string.isRequired,
  onChange: func.isRequired,
};
