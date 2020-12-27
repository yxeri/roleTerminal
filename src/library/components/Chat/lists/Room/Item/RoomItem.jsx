import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getRoomById } from '../../../../../redux/selectors/rooms';

import { ReactComponent as Lock } from '../../../../../icons/lock.svg';

import './RoomItem.scss';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';

const RoomItem = ({ roomId }) => {
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  return (
    <ListItem
      classNames={['RoomItem']}
      key={roomId}
      onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGJOINROOM}-${roomId}`, value: { type: WindowTypes.DIALOGJOINROOM, roomId } }] }))}
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
