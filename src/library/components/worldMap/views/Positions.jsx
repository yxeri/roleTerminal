import React from 'react';
import PositionsList from '../lists/PositionsList';

const Positions = ({ positionTypes = [] }) => {
  const listMapper = () => positionTypes.map((positionType) => (
    <PositionsList
      title={positionType}
      positionType={positionType}
    />
  ));

  return (
    <div className="lists positions">
      {listMapper()}
    </div>
  );
};

export default Positions;
