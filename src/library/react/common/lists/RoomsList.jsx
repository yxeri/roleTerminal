import React from 'react';
import { useSelector } from 'react-redux';

import List from '../sub-components/List';
import { getChatRooms, SortBy } from '../../redux/selectors/rooms';

const RoomsList = () => {
  const rooms = useSelector((state) => getChatRooms(state, { sortBy: SortBy.NAME }));

  return (
    <div
      key="roomsList"
      className="roomsList"
    >
      <List
        title="Rooms"
        items={rooms.map((room) => { return { key: room.objectId, value: room.roomName }; })}
      />
    </div>
  );
};

export default RoomsList;
