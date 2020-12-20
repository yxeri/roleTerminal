import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';

import { followRoom } from '../../../../../socket/actions/rooms';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoom } from '../../../../../redux/selectors/rooms';

const RoomItem = ({ roomId, onChange }) => {
  const room = useSelector((state) => getRoom(state, { id: roomId }));

  return (
    <ListItem
      key={roomId}
      onClick={() => {
        followRoom({ roomId: room.objectId })
          .then(() => onChange({ roomId: room.objectId }))
          .catch((followError) => console.log(followError));
      }}
    >
      {room.roomName}
    </ListItem>
  );
};

export default React.memo(RoomItem);

RoomItem.propTypes = {
  roomId: string.isRequired,
  onChange: func.isRequired,
};
