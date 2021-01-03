import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Wallet from '../Wallet/Wallet';
import WorldMap from '../WorldMap/WorldMap';
import Chat from '../Chat/Chat';
import { getOrder } from '../../redux/selectors/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import IdentityDialog from '../common/dialogs/IdentityDialog';
import CreateRoomDialog from '../Chat/dialogs/CreateRoomDialog';
import RemoveRoomDialog from '../Chat/dialogs/RemoveRoomDialog';
import LoginDialog from '../common/dialogs/LoginDialog';
import RegisterDialog from '../common/dialogs/RegisterDialog';
import CreateAliasDialog from '../common/dialogs/CreateAliasDialog';
import CreateTransactionDialog from '../common/dialogs/CreateTransactionDialog';
import DocFile from '../DocFile/DocFile';
import CreateDocFileDialog from '../DocFile/dialogs/CreateDocFile/CreateDocFileDialog';
import Dashboard from './Dashboard/Dashboard';
import News from '../News/News';
import CreateNewsDialog from '../News/dialogs/CreateNewsDialog';
import JoinRoomDialog from '../Chat/dialogs/JoinRoomDialog';
import ConfigSystemDialog from '../common/dialogs/ConfigSystem/ConfigSystemDialog';
import { getSystemConfig } from '../../redux/selectors/users';
import store from '../../redux/store';
import { changeWindowOrder } from '../../redux/actions/windowOrder';
import UnlockDocFileDialog from '../DocFile/dialogs/UnlockDocFileDialog';
import SettingsNewsDialog from '../News/dialogs/SettingsNewsDialog';

import './MainWindow.scss';

const MainWindow = () => {
  const systemConfig = useSelector(getSystemConfig);
  const order = useSelector(getOrder);
  const windows = [];

  useEffect(() => {
    if (systemConfig.openApp) {
      store.dispatch(changeWindowOrder({ windows: [{ id: systemConfig.openApp, value: { type: systemConfig.openApp } }] }));
    }
  }, [systemConfig.openApp]);

  useEffect(() => {
    document.addEventListener('click', () => {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    });
  }, []);

  order.forEach((value, key) => {
    const { type } = value;

    if (type === WindowTypes.CHAT) {
      windows.push(<Chat key={key} id={key} roomId={value.roomId} index={value.index} />);
    } else if (type === WindowTypes.WALLET) {
      windows.push(<Wallet key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.WORLDMAP) {
      windows.push(<WorldMap key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DOCFILE) {
      windows.push(<DocFile key={key} id={key} docFileId={value.docFileId} index={value.index} />);
    } else if (type === WindowTypes.NEWS) {
      windows.push(<News key={key} id={key} messageId={value.messageId} index={value.index} />);
    } else if (type === WindowTypes.DIALOGIDENTITY) {
      windows.push(<IdentityDialog key={key} id={key} identityId={value.identityId} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCREATEROOM) {
      windows.push(<CreateRoomDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGLOGIN) {
      windows.push(<LoginDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGREGISTER) {
      windows.push(<RegisterDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGREMOVEROOM) {
      windows.push(<RemoveRoomDialog key={key} id={key} roomId={value.roomId} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCREATEALIAS) {
      windows.push(<CreateAliasDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCREATETRANSACTION) {
      windows.push(<CreateTransactionDialog key={key} id={key} toWalletId={value.toWalletId} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCREATEDOCFILE) {
      windows.push(<CreateDocFileDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCREATENEWS) {
      windows.push(<CreateNewsDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGJOINROOM) {
      windows.push(<JoinRoomDialog key={key} id={key} roomId={value.roomId} index={value.index} />);
    } else if (type === WindowTypes.DIALOGCONFIGSYSTEM) {
      windows.push(<ConfigSystemDialog key={key} id={key} index={value.index} />);
    } else if (type === WindowTypes.DIALOGUNLOCKROOM) {
      windows.push(<UnlockDocFileDialog key={key} id={key} index={value.index} docFileId={value.docFileId} />);
    } else if (type === WindowTypes.DIALOGSETTINGSNEWS) {
      windows.push(<SettingsNewsDialog key={key} id={key} index={value.index} />);
    }
  });

  return (
    <div
      key="mainWindow"
      id="MainWindow"
    >
      <Dashboard />
      {windows}
    </div>
  );
};

export default React.memo(MainWindow);
