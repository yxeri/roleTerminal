import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../../common/sub-components/List';
import { getChatRooms, RoomTypes } from '../../../redux/selectors/rooms';

export default function FollowingList({ onChange }) {
  const rooms = useSelector((state) => getChatRooms(state, { roomType: RoomTypes.FOLLOWED }));

  return (
    <List
      classNames={['followingList']}
      title="Joined"
      items={
        rooms.map((room) => ({
          key: room.objectId,
          value: room.roomName,
          onClick: () => {
            onChange(room.objectId);
          },
        }))
      }
    />
  );
}

FollowingList.propTypes = {
  onChange: func.isRequired,
};
