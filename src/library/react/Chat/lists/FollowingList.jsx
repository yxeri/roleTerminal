import React from 'react';

import List from '../../common/sub-components/List';
import { useSelector } from 'react-redux';
import { getChatRooms, RoomTypes } from '../../redux/selectors/rooms';

const FollowingList = () => {
  const rooms = useSelector((state) => getChatRooms(state, { roomType: RoomTypes.FOLLOWED }));

  return (
    <div
      key="followingList"
      className="followingList"
    >
      <List
        title="Following"
        items={rooms.map((room) => { return { key: room.objectId, value: room.roomName }; })}
      />
    </div>
  );
};

export default FollowingList;
