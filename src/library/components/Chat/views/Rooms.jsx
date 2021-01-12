import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import UserList from '../../common/lists/IdentityList/IdentityList';
import RoomList from '../lists/Room/RoomList';
import WhisperList from '../lists/Whisper/WhisperList';
import FollowingList from '../lists/Following/FollowingList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';
import AdminWhisperList from '../lists/AdminWhisper/AdminWhisperList';

const Rooms = ({ onChange, roomId }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <>
      <FollowingList
        roomId={roomId}
        key="following"
        onChange={onChange}
      />
      {
        accessLevel >= AccessLevels.STANDARD && (
          <>
            <WhisperList
              roomId={roomId}
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
      {
        accessLevel >= AccessLevels.MODERATOR && (
          <AdminWhisperList
            roomId={roomId}
            key="adminWhisper"
            onChange={onChange}
          />
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
  roomId: string.isRequired,
};
