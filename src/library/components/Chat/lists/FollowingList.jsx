import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../../common/lists/List/List';
import { getFollowedRooms } from '../../../redux/selectors/rooms';
import ListItem from '../../common/lists/List/ListItem/ListItem';

const FollowingList = ({ onChange }) => {
  const rooms = useSelector(getFollowedRooms);

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
      dropdown
      classNames={['FollowingList']}
      title="Joined"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(FollowingList);

FollowingList.propTypes = {
  onChange: func.isRequired,
};
