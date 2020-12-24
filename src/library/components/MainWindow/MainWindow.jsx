import React from 'react';
import { useSelector } from 'react-redux';
import Wallet from '../Wallet/Wallet';
import WorldMap from '../WorldMap/WorldMap';
import Chat from '../Chat/Chat';
import { getOrder } from '../../redux/selectors/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './MainWindow.scss';
import IdentityDialog from '../common/dialogs/IdentityDialog';
import CreateRoomDialog from '../Chat/dialogs/CreateRoomDialog';
import RemoveRoomDialog from '../Chat/dialogs/RemoveRoomDialog';
import LoginDialog from '../common/dialogs/LoginDialog';
import RegisterDialog from '../common/dialogs/RegisterDialog';
import CreateAliasDialog from '../common/dialogs/CreateAliasDialog';

const MainWindow = () => {
  const order = useSelector(getOrder);
  const windows = [];

  order.forEach((value, key) => {
    const { type } = value;

    if (type === WindowTypes.CHAT) {
      windows.push(<Chat key={key} id={key} roomId={value.roomId} />);
    } else if (type === WindowTypes.WALLET) {
      windows.push(<Wallet key={key} id={key} />);
    } else if (type === WindowTypes.WORLDMAP) {
      windows.push(<WorldMap key={key} id={key} />);
    } else if (type === WindowTypes.DIALOGIDENTITY) {
      windows.push(<IdentityDialog key={key} id={key} identityId={value.identityId} />);
    } else if (type === WindowTypes.DIALOGCREATEROOM) {
      windows.push(<CreateRoomDialog key={key} id={key} />);
    } else if (type === WindowTypes.DIALOGLOGIN) {
      windows.push(<LoginDialog key={key} id={key} />);
    } else if (type === WindowTypes.DIALOGREGISTER) {
      windows.push(<RegisterDialog key={key} id={key} />);
    } else if (type === WindowTypes.DIALOGREMOVEROOM) {
      windows.push(<RemoveRoomDialog key={key} id={key} roomId={value.roomId} />);
    } else if (type === WindowTypes.DIALOGCREATEALIAS) {
      windows.push(<CreateAliasDialog key={key} id={key} />);
    }
  });

  return (
    <div id="MainWindow">
      {windows}
    </div>
  );
};

export default React.memo(MainWindow);
