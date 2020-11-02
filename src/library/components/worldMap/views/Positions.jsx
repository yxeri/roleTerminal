import React from 'react';
import PositionsList from '../lists/PositionsList';

const Positions = ({ positionTypes = [] }) => (
  <div className="lists positions">
    {positionTypes.map((positionType) => (
      <PositionsList
        title={positionType}
        positionType={positionType}
      />
    ))}
  </div>
);

export default Positions;
