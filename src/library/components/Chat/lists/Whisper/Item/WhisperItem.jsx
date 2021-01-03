import React, { useCallback } from 'react';
import { batch, useSelector } from 'react-redux';
import {
  arrayOf,
  func, shape,
  string,
} from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getWhisperRoomName } from '../../../../../redux/selectors/rooms';
import { ReactComponent as Eye } from '../../../../../icons/eye.svg';
import { followRoom } from '../../../../../socket/actions/rooms';
import { getCurrentUser } from '../../../../../redux/selectors/users';
import store from '../../../../../redux/store';

import './WhisperItem.scss';

const WhisperItem = ({ room, onChange, className }) => {
  const roomName = useSelector((state) => getWhisperRoomName(state, { ids: room.participantIds }));

  const onClick = () => {
    const currentUser = getCurrentUser(store.getState());

    if (!room.participantIds.some((id) => currentUser.objectId === id || currentUser.aliases.includes(id))) {
      followRoom({ roomId: room.objectId })
        .then(() => {
          onChange({ roomId: room.objectId, spyMode: room.spyMode });
        })
        .catch((followError) => console.log(followError));

      return;
    }

    onChange({ roomId: room.objectId, spyMode: room.spyMode });
  };

  return (
    <ListItem
      className={className}
      key={room.objectId}
      onClick={onClick}
    >
      {roomName}
      {room.spyMode && (<div className="spy"><Eye /></div>)}
    </ListItem>
  );
};

export default React.memo(WhisperItem, (prevProps, newProps) => {
  const prevRoom = prevProps.room;
  const newRoom = newProps.room;

  if (prevProps.className !== newProps.className) {
    return false;
  }

  if (!Object.keys(newRoom).every((key) => prevRoom[key] && newRoom[key])) {
    return false;
  }

  if (!newRoom.participantIds.every((id) => prevRoom.participantIds.includes(id))) {
    return false;
  }

  return true;
});

WhisperItem.propTypes = {
  room: shape({
    participantIds: arrayOf(string),
  }).isRequired,
  onChange: func.isRequired,
  className: string,
};

WhisperItem.defaultProps = {
  className: undefined,
};
