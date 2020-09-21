import React from 'react';

import accessCentral from '../../../AccessCentral';
import UsersList from '../../common/lists/UsersList';
import RoomsList from '../../common/lists/RoomsList';
import WhisperRoomsList from '../lists/WhisperList';
import FollowingList from '../lists/FollowingList';

const Rooms = () => {
  const content = [];

  if (accessCentral.getAccessLevel() >= accessCentral.AccessLevels.STANDARD) {
    content.push(
      <FollowingList />,
      <WhisperRoomsList />,
      <RoomsList />,
    );
  }

  return (
    <div className="rooms">
      {content}
      <UsersList />
    </div>
  );
};

export default Rooms;
