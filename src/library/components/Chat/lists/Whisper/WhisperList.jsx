import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { getWhisperRooms } from '../../../../redux/selectors/rooms';
import List from '../../../common/lists/List/List';
import RoomItem from './Item/WhisperItem';

const WhisperList = ({ onChange }) => {
  const rooms = useSelector(getWhisperRooms);

  const roomMapper = () => rooms.map((room) => <RoomItem room={room} onChange={onChange} />);

  return (
    <List
      dropdown
      classNames={['WhisperList']}
      title="PM"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(WhisperList);

WhisperList.propTypes = {
  onChange: func.isRequired,
};
