import React from 'react';
import { useSelector } from 'react-redux';
import { bool, func, string } from 'prop-types';
import { getWhisperRooms } from '../../../../redux/selectors/rooms';
import List from '../../../common/lists/List/List';
import WhisperItem from './Item/WhisperItem';
import { getCurrentUserIdentitiesNames } from '../../../../redux/selectors/users';

const WhisperList = ({ onChange, roomId, alwaysExpand }) => {
  const identities = useSelector(getCurrentUserIdentitiesNames);
  const whisperRooms = useSelector((state) => getWhisperRooms(state, { spyMode: false }));

  const items = whisperRooms
    .map((room) => (
      <WhisperItem
        singleUser={identities.length === 1}
        key={room.objectId}
        room={room}
        onChange={onChange}
        className={`${room.objectId === roomId ? 'selected' : ''}`}
      />
    ));

  return (
    <List
      alwaysExpanded={alwaysExpand}
      key="whisperList"
      className={`WhisperList ${whisperRooms.length === 0 ? 'hide' : ''}`}
      title="Direct messages"
    >
      {items}
    </List>
  );
};

export default React.memo(WhisperList);

WhisperList.propTypes = {
  onChange: func.isRequired,
  roomId: string,
  alwaysExpand: bool,
};

WhisperList.defaultProps = {
  roomId: undefined,
  alwaysExpand: undefined,
};
