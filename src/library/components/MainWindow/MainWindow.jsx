import React from 'react';
import { useSelector } from 'react-redux';
import Wallet from '../Wallet/Wallet';
import WorldMap from '../WorldMap/WorldMap';
import Chat from '../Chat/Chat';
import { getOrder } from '../../redux/selectors/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './MainWindow.scss';
import IdentityDialog from '../common/dialogs/IdentityDialog';

const MainWindow = () => {
  const order = useSelector(getOrder);
  const windows = [];

  console.log(order);

  order.forEach((value, key) => {
    const { type } = value;

    if (type === WindowTypes.CHAT) {
      windows.push(<Chat key={key} id={key} />);
    } else if (type === WindowTypes.WALLET) {
      windows.push(<Wallet key={key} id={key} />);
    } else if (type === WindowTypes.WORLDMAP) {
      windows.push(<WorldMap key={key} id={key} />);
    } else if (type === WindowTypes.DIALOGIDENTITY) {
      windows.push(<IdentityDialog key={key} id={key} identityId={value.identityId} onDone={value.onDone} />);
    } else if (type === WindowTypes.DIALOGCREATEROOM) {

    } else if (type === WindowTypes.DIALOGLOGIN) {

    } else if (type === WindowTypes.DIALOGREGISTER) {

    } else if (type === WindowTypes.DIALOGREMOVEROOM) {

    }
  });

  return (
    <div id="MainWindow">
      {windows}
    </div>
  );
};

export default React.memo(MainWindow);
