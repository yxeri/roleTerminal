import React from 'react';
import { func, number } from 'prop-types';
import Window from '../common/Window/Window';
import MapView from './views/MapView';
import Positions from './views/Positions';

import './WorldMap.scss';

export default function WorldMap({ onClick, order }) {
  return (
    <Window
      order={order}
      title="map"
      onClick={onClick}
    >
      <Positions />
      <MapView />
    </Window>
  );
}

WorldMap.propTypes = {
  onClick: func.isRequired,
  order: number.isRequired,
};
