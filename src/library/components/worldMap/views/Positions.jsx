import React from 'react';
import PositionList from '../lists/PositionList';

const Positions = ({ positionTypes = [] }) => {
  const listMapper = () => positionTypes.map((positionType) => (
    <PositionList
      title={positionType}
      positionType={positionType}
    />
  ));

  return (
    <div className="lists Positions">
      {listMapper()}
    </div>
  );
};

export default Positions;
