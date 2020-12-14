import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from '../../common/lists/List/List';
import { getPositions } from '../../../redux/selectors/positions';
import ListItem from '../../common/lists/List/ListItem/ListItem';

const PositionList = ({ title, positionType }) => {
  const positions = useSelector((state) => getPositions(state, { positionType }));

  const positionMapper = () => positions.map((position) => (
    <ListItem
      key={position.objectId}
      onClick={() => { console.log(position.objectId); }}
    >
      {position.positionName}
    </ListItem>
  ));

  return (
    <div
      key="positionsList"
      className="PositionsList"
    >
      <List
        title={title}
      >
        {positionMapper()}
      </List>
    </div>
  );
};

export default PositionList;

PositionList.propTypes = {
  title: string,
  positionType: string.isRequired,
};

PositionList.defaultProps = {
  title: undefined,
};
