import React from 'react';

import Window from '../common/Window';
import MapView from './views/MapView';
import Positions from './views/Positions';

const WorldMap = () => {
  return (
    <Window>
      <Positions />
      <MapView />
    </Window>
  );
};

export default WorldMap
