import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoomById } from '../../../../../redux/selectors/rooms';
import { ReactComponent as Lock } from '../../../../../icons/lock.svg';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';

import './RoomItem.scss';

const RoomItem = ({ roomId }) => {
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGJOINROOM}-${roomId}`, value: { type: WindowTypes.DIALOGJOINROOM, roomId } }] }));
  }, [roomId]);

  return (
    <ListItem
      className="RoomItem"
      key={roomId}
      onClick={onClick}
    >
      {room.roomName}
      {room.isLocked && (
        <div className="lock"><Lock /></div>
      )}
    </ListItem>
  );
};

export default React.memo(RoomItem);

RoomItem.propTypes = {
  roomId: string.isRequired,
};
