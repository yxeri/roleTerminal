import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from '../../common/sub-components/List/List';
import { getPositions } from '../../../redux/selectors/positions';
import ListItem from '../../common/sub-components/List/ListItem/ListItem';

export default function PositionsList({ title, positionType }) {
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
      className="positionsList"
    >
      <List
        title={title}
      >
        {positionMapper()}
      </List>
    </div>
  );
}

PositionsList.propTypes = {
  title: string,
  positionType: string.isRequired,
};

PositionsList.defaultProps = {
  title: undefined,
};
