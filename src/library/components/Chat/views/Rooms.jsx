import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import UserList from '../../common/lists/UserList';
import RoomList from '../../common/lists/RoomList';
import WhisperList from '../lists/WhisperList';
import FollowingList from '../lists/FollowingList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

const Rooms = ({ onChange }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [];

  if (accessLevel >= AccessLevels.STANDARD) {
    content.push(
      <FollowingList key="followingList" onChange={onChange} />,
      <WhisperList key="whisperList" onChange={onChange} />,
      <RoomList key="roomList" onChange={onChange} />,
    );
  }

  return (
    <>
      {content}
      <UserList key="userList" />
    </>
  );
};

export default Rooms;

Rooms.propTypes = {
  onChange: func.isRequired,
};
