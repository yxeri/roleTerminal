import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  arrayOf,
  func, shape,
  string,
} from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getWhisperRoomName } from '../../../../../redux/selectors/rooms';

const WhisperItem = ({ room, onChange, className }) => {
  const roomName = useSelector((state) => getWhisperRoomName(state, { ids: room.participantIds }));

  const onClick = useCallback(() => {
    onChange({ roomId: room.objectId });
  }, [room]);

  return (
    <ListItem
      className={className}
      key={room.objectId}
      onClick={onClick}
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
  className: string,
};

WhisperItem.defaultProps = {
  className: undefined,
};
