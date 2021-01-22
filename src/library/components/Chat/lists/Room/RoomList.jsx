import React from 'react';
import { useSelector } from 'react-redux';
import { bool, func } from 'prop-types';

import List from '../../../common/lists/List/List';
import { getUnfollowedRoomIds } from '../../../../redux/selectors/rooms';
import RoomItem from './Item/RoomItem';

const RoomList = ({ onChange, alwaysExpanded }) => {
  const roomIds = useSelector(getUnfollowedRoomIds);

  const roomMapper = () => roomIds.map((roomId) => (
    <RoomItem
      key={roomId}
      roomId={roomId}
      onChange={onChange}
    />
  ));

  return (
    <List
      alwaysExpanded={alwaysExpanded}
      key="roomList"
      className="RoomList"
      title="Rooms"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(RoomList);

RoomList.propTypes = {
  onChange: func.isRequired,
  alwaysExpanded: bool,
};

RoomList.defaultProps = {
  alwaysExpanded: undefined,
};
