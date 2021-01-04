import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { getWhisperRooms } from '../../../../redux/selectors/rooms';
import List from '../../../common/lists/List/List';
import WhisperItem from '../Whisper/Item/WhisperItem';
import { ReactComponent as Admin } from '../../../../icons/admin.svg';

const WhisperList = ({ onChange, roomId }) => {
  const whisperRooms = useSelector((state) => getWhisperRooms(state, { spyMode: true }));

  const rooms = (() => whisperRooms
    .map((room) => (
      <WhisperItem key={room.objectId} room={room} onChange={onChange} className={`${room.objectId === roomId ? 'selected' : ''}`} />
    ))
  )();

  return (
    <List
      dropdown
      checkWidth
      key="whisperList"
      className="WhisperList"
      title={(
        <span>
          <Admin />
          PM
        </span>
      )}
    >
      {rooms}
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
