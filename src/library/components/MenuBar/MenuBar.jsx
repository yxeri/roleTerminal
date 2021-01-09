import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Clock from './sub-components/Clock/Clock';
import MainList from './lists/MainList';
import { isOnline } from '../../redux/selectors/online';
import OpenApps from './lists/OpenApps/OpenApps';
import Button from '../common/sub-components/Button/Button';
import { ReactComponent as Help } from '../../icons/help.svg';
import store from '../../redux/store';
import { changeMode, changeTarget } from '../../redux/actions/mode';
import { Modes } from '../../redux/reducers/mode';
import { getMode } from '../../redux/selectors/mode';
import { ReactComponent as Menu } from '../../icons/menu.svg';
import { ReactComponent as Wallet } from '../../icons/wallet.svg';
import { ReactComponent as Chat } from '../../icons/chat.svg';
import { ReactComponent as Map } from '../../icons/map.svg';
import { ReactComponent as News } from '../../icons/news.svg';
import { ReactComponent as File } from '../../icons/file.svg';
import { ReactComponent as Layers } from '../../icons/layers.svg';
import { ReactComponent as ClockIcon } from '../../icons/clock.svg';
import { ReactComponent as ChevronLeft } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRight } from '../../icons/chevron-right.svg';
import { ReactComponent as Grid } from '../../icons/grid.svg';
import { ReactComponent as Camera } from '../../icons/camera.svg';
import { getCurrentAccessLevel, getSystemConfig } from '../../redux/selectors/users';
import { AccessLevels } from '../../AccessCentral';
import { getHideMenu } from '../../redux/selectors/interfaceConfig';
import { reconnect } from '../../socket/SocketManager';

import './MenuBar.scss';
import { changeInterfaceConfig } from '../../redux/actions/interfaceConfig';
import IdentityPicker from '../common/lists/IdentityPicker/IdentityPicker';
import { MessageTypes, postMessage } from '../../Messenger';

const componentId = 'MenuBar';

const MenuBar = () => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const systemConfig = useSelector(getSystemConfig);
  const hideMenu = useSelector(getHideMenu);
  const mode = useSelector(getMode);
  const online = useSelector(isOnline);
  const classes = [];

  if (!online) {
    classes.push('warning');
  }

  useEffect(() => {
    if (systemConfig.hideMenuBar) {
      store.dispatch(changeInterfaceConfig({ hideMenu: true }));
    } else {
      store.dispatch(changeInterfaceConfig({ hideMenu: false }));
    }
  }, [systemConfig.hideMenuBar]);

  const onHelp = useCallback(() => store.dispatch(changeMode({ mode: Modes.HELP, target: componentId })), []);

  return (
    <>
      {
        hideMenu
          ? (
            <div className="miniMenu">
              <Button
                type="button"
                onClick={() => store.dispatch(changeInterfaceConfig({ toggleHideMenu: true }))}
              >
                <ChevronLeft />
              </Button>
            </div>
          )
          : (
            <>
              <div
                key={componentId}
                onClick={() => {
                  if (!online) {
                    reconnect();
                  }

                  if (mode.mode === Modes.HELP) {
                    store.dispatch(changeTarget({ target: componentId }));
                  }
                }}
                className={`${componentId} ${classes.join(' ')}`}
                id={componentId}
              >
                <MainList key="mainList" />
                <OpenApps key="openApps" />
                <div className="rightAligned">
                  {!systemConfig.hideHelp && (
                    <Button
                      type="button"
                      className={`helpButton ${mode.mode === Modes.HELP && mode.target === componentId ? 'active' : ''}`}
                      onClick={onHelp}
                    >
                      <Help />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => postMessage({ type: MessageTypes.QR, data: {} })}
                  >
                    <Camera />
                  </Button>
                  {accessLevel >= AccessLevels.STANDARD && (
                    <IdentityPicker />
                  )}
                  <Clock />
                </div>
                {mode.mode === Modes.HELP && mode.target === componentId && (
                  <div className="helpOverlay">
                    <ul>
                      <li>
                        <p>Overview of the app, that has everything from chat and news feed to digital currency and map.</p>
                        <p>{'Don\'t be afraid to experiment! You won\'t break the system.'}</p>
                        <p>
                          {'There is a '}
                          <Help />
                          {' button in each app. The scroll is usually hidden, but you can still scroll (like in this pop-up!). Apps and menu:'}
                        </p>
                      </li>
                      <li>
                        <Grid />
                        <span>APPS Shows all apps.</span>
                      </li>
                      <li>
                        <Chat />
                        <span>CHAT Read and send messages. You have access to read Public without logging in.</span>
                      </li>
                      <li>
                        <News />
                        <span>NEWS Read the latest news. You need access to be able to create news.</span>
                      </li>
                      <li>
                        <File />
                        <span>FILES Read and create documents. You have access to read documents without logging in.</span>
                      </li>
                      <li>
                        <Map />
                        <span>MAP See the local, world map, track users and add new locations.</span>
                      </li>
                      <li>
                        <Wallet />
                        <span>WALLET Send and receive currency. You need to login to access your wallet.</span>
                      </li>
                      <li>
                        <Menu />
                        <span>MENU You can create a user, login, check your info, change settings and more here.</span>
                      </li>
                      <li>
                        <Layers />
                        <span>WINDOWS Other windows you have open (like dialog windows) will be listed here.</span>
                      </li>
                      <li>
                        <ClockIcon />
                        <span>TIME Click it to reveal the current time.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              {accessLevel >= AccessLevels.STANDARD && (
                <div className={`miniMenu minimize ${systemConfig.hideMenuBar ? 'hideOn' : ''}`}>
                  <Button
                    type="button"
                    onClick={() => store.dispatch(changeInterfaceConfig({ toggleHideMenu: true }))}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </>
          )
      }
    </>
  );
};

export default React.memo(MenuBar);
