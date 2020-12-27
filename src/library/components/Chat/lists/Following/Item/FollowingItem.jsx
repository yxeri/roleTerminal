import React from 'react';
import { arrayOf, func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoomById } from '../../../../../redux/selectors/rooms';

const FollowingItem = ({ roomId, onChange, classNames = [] }) => {
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  return (
    <ListItem
      classNames={['FollowingItem'].concat(classNames)}
      key={roomId}
      onClick={() => {
        onChange({ roomId });
      }}
    >
      {room.roomName}
    </ListItem>
  );
};

export default React.memo(FollowingItem);

FollowingItem.propTypes = {
  roomId: string.isRequired,
  onChange: func.isRequired,
  classNames: arrayOf(string),
};

FollowingItem.defaultProps = {
  classNames: [],
}
