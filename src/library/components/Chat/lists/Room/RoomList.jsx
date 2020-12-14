import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../../../common/lists/List/List';
import { getUnfollowedRooms } from '../../../../redux/selectors/rooms';
import ListItem from '../../../common/lists/List/ListItem/ListItem';
import { followRoom } from '../../../../socket/actions/rooms';

const RoomList = ({ onChange }) => {
  const rooms = useSelector(getUnfollowedRooms);

  const roomMapper = () => rooms.map((room) => (
    <ListItem
      key={room.objectId}
      onClick={() => {
        followRoom({ roomId: room.objectId })
          .then(() => onChange(room.objectId))
          .catch((followError) => console.log(followError));
      }}
    >
      {room.roomName}
    </ListItem>
  ));

  return (
    <List
      dropdown
      classNames={['RoomList']}
      title="Rooms"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(RoomList);

RoomList.propTypes = {
  onChange: func.isRequired,
};
