import React from 'react';
import List from '../../common/sub-components/List';
import { useSelector } from 'react-redux';
import { getPositions } from '../../redux/selectors/positions';

const PositionsList = ({ title, positionType }) => {
  const positions = useSelector((state) => getPositions(state, { positionType }));

  return (
    <div
      key="positionsList"
      className="positionsList"
    >
      <List
        title={title}
        items={positions.map((position) => {
          return {
            key: position.objectId,
            value: position.positionName,
            onClick: () => { console.log(position.objectId); },
          };
        })}
      />
    </div>
  );
};

export default PositionsList;
