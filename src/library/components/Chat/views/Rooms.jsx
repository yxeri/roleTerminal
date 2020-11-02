import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import UserList from '../../common/lists/UserList';
import RoomList from '../../common/lists/RoomList';
import WhisperList from '../lists/WhisperList';
import FollowingList from '../lists/FollowingList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

export default function Rooms({ onChange }) {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [];

  if (accessLevel >= AccessLevels.STANDARD) {
    content.push(
      <FollowingList onChange={onChange} />,
      <WhisperList onChange={onChange} />,
      <RoomList onChange={onChange} />,
    );
  }

  return (
    <>
      {content}
      <UserList />
    </>
  );
}

Rooms.propTypes = {
  onChange: func.isRequired,
};
