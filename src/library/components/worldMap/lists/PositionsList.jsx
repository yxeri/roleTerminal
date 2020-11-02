import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from '../../common/sub-components/List';
import { getPositions } from '../../../redux/selectors/positions';

export default function PositionsList({ title, positionType }) {
  const positions = useSelector((state) => getPositions(state, { positionType }));

  return (
    <div
      key="positionsList"
      className="positionsList"
    >
      <List
        title={title}
        items={positions.map((position) => ({
          key: position.objectId,
          value: position.positionName,
          onClick: () => { console.log(position.objectId); },
        }))}
      />
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
