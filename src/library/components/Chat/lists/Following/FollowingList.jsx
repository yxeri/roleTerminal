import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import List from '../../../common/lists/List/List';
import { getFollowedRoomsIds } from '../../../../redux/selectors/rooms';
import FollowingItem from './Item/FollowingItem';

const FollowingList = ({ onChange }) => {
  const roomIds = useSelector(getFollowedRoomsIds);

  const roomMapper = () => roomIds.map((roomId) => (
    <FollowingItem
      key={roomId}
      roomId={roomId}
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
};
