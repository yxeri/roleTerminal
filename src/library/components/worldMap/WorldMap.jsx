import React, { useCallback } from 'react';
import { number, string } from 'prop-types';
import Window from '../common/Window/Window';
import MapView from './views/MapView';
import Positions from './views/Positions';

import './WorldMap.scss';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

const WorldMap = ({ id, index }) => {
  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.WORLDMAP } }] }));
  }, []);

  return (
    <Window
      index={index}
      done={() => store.dispatch(removeWindow({ id }))}
      classNames={['WorldMap']}
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

export default React.memo(WorldMap);

WorldMap.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
