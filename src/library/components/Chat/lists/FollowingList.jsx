import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../../common/sub-components/List/List';
import { getChatRooms, RoomTypes } from '../../../redux/selectors/rooms';
import ListItem from '../../common/sub-components/List/ListItem/ListItem';

export default function FollowingList({ onChange }) {
  const rooms = useSelector((state) => getChatRooms(state, { roomType: RoomTypes.FOLLOWED }));

  const roomMapper = () => rooms.map((room) => (
    <ListItem
      key={room.objectId}
      onClick={() => {
        onChange(room.objectId);
      }}
    >
      {room.roomName}
    </ListItem>
  ));

  return (
    <List
      classNames={['followingList']}
      title="Joined"
    >
      {roomMapper()}
    </List>
  );
}

FollowingList.propTypes = {
  onChange: func.isRequired,
};
