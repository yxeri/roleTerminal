import React from 'react';
import { useSelector } from 'react-redux';
import {
  arrayOf,
  func, shape,
  string,
} from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getWhisperRoomName } from '../../../../../redux/selectors/rooms';

const WhisperItem = ({ room, onChange }) => {
  const roomName = useSelector((state) => getWhisperRoomName(state, { ids: room.participantIds }));

  return (
    <ListItem
      key={room.objectId}
      onClick={() => {
        onChange({ roomId: room.objectId, roomName });
      }}
    >
      {roomName}
    </ListItem>
  );
};

export default React.memo(WhisperItem);

WhisperItem.propTypes = {
  room: shape({
    participantIds: arrayOf(string),
  }).isRequired,
  onChange: func.isRequired,
};
