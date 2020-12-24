import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import UserList from '../../common/lists/IdentityList/IdentityList';
import RoomList from '../lists/Room/RoomList';
import WhisperList from '../lists/Whisper/WhisperList';
import FollowingList from '../lists/Following/FollowingList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

const Rooms = ({ onChange }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <>
      {
        accessLevel >= AccessLevels.STANDARD && (
          <>
            <FollowingList
              key="following"
              onChange={onChange}
            />
            <WhisperList
              key="whisper"
              onChange={onChange}
            />
            <RoomList
              key="room"
              onChange={onChange}
            />
          </>
        )
      }
      <UserList
        onDone={onChange}
        key="user"
      />
    </>
  );
};

export default React.memo(Rooms);

Rooms.propTypes = {
  onChange: func.isRequired,
};
