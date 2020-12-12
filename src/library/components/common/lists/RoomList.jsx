import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../sub-components/List/List';
import { getChatRooms, SortBy } from '../../../redux/selectors/rooms';
import ListItem from '../sub-components/List/ListItem/ListItem';

export default function RoomList({ onChange }) {
  const rooms = useSelector((state) => getChatRooms(state, { sortBy: SortBy.NAME }));

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
      classNames={['roomList']}
      title="Rooms"
    >
      {roomMapper()}
    </List>
  );
}

RoomList.propTypes = {
  onChange: func.isRequired,
};
