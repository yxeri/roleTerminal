import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../sub-components/List/List';
import { getChatRooms, SortBy } from '../../../redux/selectors/rooms';

export default function RoomList({ onChange }) {
  const rooms = useSelector((state) => getChatRooms(state, { sortBy: SortBy.NAME }));

  const roomMapper = () => rooms.map((room) => ({
    key: room.objectId,
    value: room.roomName,
    onClick: () => {
      onChange(room.objectId);
    },
  }));

  return (
    <List
      classNames={['roomList']}
      title="Rooms"
      items={roomMapper()}
    />
  );
}

RoomList.propTypes = {
  onChange: func.isRequired,
};
