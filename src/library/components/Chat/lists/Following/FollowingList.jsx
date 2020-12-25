import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import List from '../../../common/lists/List/List';
import { getFollowedRoomsIds } from '../../../../redux/selectors/rooms';
import FollowingItem from './Item/FollowingItem';

const FollowingList = ({ onChange, roomId }) => {
  const roomIds = useSelector(getFollowedRoomsIds);

  const roomMapper = () => roomIds.map((id) => (
    <FollowingItem
      classNames={[`${id === roomId ? 'selected' : ''}`]}
      key={id}
      roomId={id}
      onChange={onChange}
    />
  ));

  return (
    <List
      dropdown
      checkWidth
      key="followingList"
      classNames={['FollowingList']}
      title="Joined"
    >
      {roomMapper()}
    </List>
  );
};

export default React.memo(FollowingList);

FollowingList.propTypes = {
  onChange: func.isRequired,
  roomId: string.isRequired,
};
