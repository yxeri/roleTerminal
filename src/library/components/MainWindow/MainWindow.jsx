import React from 'react';
import { useSelector } from 'react-redux';
import Wallet from '../Wallet/Wallet';
import WorldMap from '../WorldMap/WorldMap';
import Chat from '../Chat/Chat';
import { getOrder } from '../../redux/selectors/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './MainWindow.scss';

const MainWindow = () => {
  const order = useSelector(getOrder);
  const windows = [];

  console.log(order);

  order.forEach((type, key) => {
    if (type === WindowTypes.CHAT) {
      windows.push(<Chat key={key} id={key} />);
    } else if (type === WindowTypes.WALLET) {
      windows.push(<Wallet key={key} id={key} />);
    } else if (type === WindowTypes.WORLDMAP) {
      windows.push(<WorldMap key={key} id={key} />);
    }
  });

  return (
    <div id="MainWindow">
      {windows}
    </div>
  );
};

export default React.memo(MainWindow);
