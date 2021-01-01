import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { getWhisperRooms } from '../../../../redux/selectors/rooms';
import List from '../../../common/lists/List/List';
import WhisperItem from './Item/WhisperItem';

const WhisperList = ({ onChange, roomId }) => {
  const rooms = useSelector(getWhisperRooms);

  const roomMapper = () => rooms.map((room) => (
    <WhisperItem key={room.objectId} room={room} onChange={onChange} className={`${room.objectId === roomId ? 'selected' : ''}`} />
  ));

  return (
    <List
      dropdown
      checkWidth
      key="whisperList"
      className="WhisperList"
      title="PM"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(WhisperList);

WhisperList.propTypes = {
  onChange: func.isRequired,
  roomId: string,
};

WhisperList.defaultProps = {
  roomId: undefined,
};
