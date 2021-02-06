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
import List from '../../common/lists/List/List';
import { ReactComponent as Edit } from '../../../icons/edit.svg';

import './Rooms.scss';
import ListItem from '../../common/lists/List/Item/ListItem';

const Rooms = ({ onChange, roomId }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <>
      <List
        dropdown
        checkWidth
        title={<Edit />}
        className="rooms"
      >
        <ListItem>
          <FollowingList
            alwaysExpanded
            roomId={roomId}
            key="following"
            onChange={onChange}
          />
        </ListItem>
        <ListItem>
          {accessLevel >= AccessLevels.STANDARD && (
            <WhisperList
              alwaysExpand
              roomId={roomId}
              key="whisper"
              onChange={onChange}
            />
          )}
        </ListItem>
        {accessLevel >= AccessLevels.STANDARD && (
          <ListItem>
            <RoomList
              alwaysExpanded
              key="room"
              onChange={onChange}
            />
          </ListItem>
        )}
        {accessLevel >= AccessLevels.MODERATOR && (
          <AdminWhisperList
            roomId={roomId}
            key="adminWhisper"
            onChange={onChange}
          />
        )}
      </List>
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
