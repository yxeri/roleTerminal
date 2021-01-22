import React from 'react';
import { useSelector } from 'react-redux';
import { bool, func, string } from 'prop-types';
import List from '../../../common/lists/List/List';
import { getFollowedRoomsIds } from '../../../../redux/selectors/rooms';
import FollowingItem from './Item/FollowingItem';

const FollowingList = ({ onChange, roomId, alwaysExpanded }) => {
  const roomIds = useSelector(getFollowedRoomsIds);

  const items = roomIds.map((id) => (
    <FollowingItem
      className={`${id === roomId ? 'selected' : ''}`}
      key={id}
      roomId={id}
      onChange={onChange}
    />
  ));

  return (
    <List
      alwaysExpanded={alwaysExpanded}
      key="followingList"
      className="FollowingList"
      title="Joined"
    >
      {items}
    </List>
  );
};

export default React.memo(FollowingList);

FollowingList.propTypes = {
  onChange: func.isRequired,
  roomId: string.isRequired,
  alwaysExpanded: bool,
};

FollowingList.defaultProps = {
  alwaysExpanded: undefined,
};
