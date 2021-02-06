import React, { useCallback } from 'react';
import { number, string } from 'prop-types';
import FileMenu from '../common/lists/FileMenu/FileMenu';
import Window from '../common/Window/Window';
import MapView from './views/MapView';
import Positions from './views/Positions';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import { ReactComponent as Map } from '../../icons/map.svg';

import './WorldMap.scss';

const WorldMap = ({ id, index }) => {
  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.WORLDMAP } }] }));
  }, []);

  return (
    <Window
      id={id}
      index={index}
      done={() => store.dispatch(removeWindow({ id }))}
      className="WorldMap"
      title={<span>Map</span>}
      onClick={onClick}
      menu={(
        <>
          <FileMenu
            menuIcon={<Map />}
            id={id}
          />
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
