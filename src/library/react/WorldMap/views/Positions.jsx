import React from 'react';
import PositionsList from '../lists/PositionsList';

const Positions = ({ positionTypes = [] }) => {
  return (
    <div className="positions">
      {positionTypes.map((positionType) => {
        return <PositionsList
          title={positionType}
          positionType={positionType}
        />;
      })}
    </div>
  );
};

export default Positions;
