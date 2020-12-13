import React from 'react';
import { func, number } from 'prop-types';
import Window from '../common/Window/Window';
import MapView from './views/MapView';
import Positions from './views/Positions';

import './WorldMap.scss';

const WorldMap = ({ onClick, order }) => {
  return (
    <Window
      classNames={['WorldMap']}
      order={order}
      title="map"
      onClick={onClick}
      menu={(
        <>
          <Positions />
        </>
      )}
    >
      <MapView />
    </Window>
  );
};

export default WorldMap;

WorldMap.propTypes = {
  onClick: func.isRequired,
  order: number.isRequired,
};
