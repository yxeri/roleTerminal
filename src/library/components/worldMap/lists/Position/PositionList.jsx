import React, { useMemo } from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from '../../../common/lists/List/List';
import { getPositionNamesByType } from '../../../../redux/selectors/positions';
import ListItem from '../../../common/lists/List/Item/ListItem';

const PositionList = ({ title, positionType }) => {
  const positionsSelector = useMemo(getPositionNamesByType, []);
  const positions = useSelector((state) => positionsSelector(state, positionType));

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

export default React.memo(PositionList);

PositionList.propTypes = {
  title: string,
  positionType: string.isRequired,
};

PositionList.defaultProps = {
  title: undefined,
};
