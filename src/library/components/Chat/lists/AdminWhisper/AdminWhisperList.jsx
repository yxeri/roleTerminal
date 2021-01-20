import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { getWhisperRooms } from '../../../../redux/selectors/rooms';
import List from '../../../common/lists/List/List';
import WhisperItem from '../Whisper/Item/WhisperItem';
import { ReactComponent as Admin } from '../../../../icons/admin.svg';

const AdminWhisperList = ({ onChange, roomId }) => {
  const whisperRooms = useSelector((state) => getWhisperRooms(state, { spyMode: true }));

  const items = whisperRooms
    .map((room) => (
      <WhisperItem key={room.objectId} room={room} onChange={onChange} className={`${room.objectId === roomId ? 'selected' : ''}`} />
    ));

  return (
    <List
      dropdown
      checkWidth
      key="whisperList"
      className="WhisperList"
      title={(
        <>
          <Admin />
          <span>PM</span>
        </>
      )}
    >
      {items}
    </List>
  );
};

export default React.memo(AdminWhisperList);

AdminWhisperList.propTypes = {
  onChange: func.isRequired,
  roomId: string,
};

AdminWhisperList.defaultProps = {
  roomId: undefined,
};
