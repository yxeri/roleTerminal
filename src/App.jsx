import React, { useEffect } from 'react';
import {
  Switch,
  Route,
  BrowserRouter,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Chat from './library/react/Chat/Chat';
import {
  ALIASES,
  USERS,
  ROOMS,
  MESSAGES,
} from './library/react/redux/actionTypes';
import { getUserId } from './library/react/redux/selectors/userId';
import MenuBar from './library/react/common/MenuBar/MenuBar';

import mouseHandler from './library/MouseHandler';
import positionTracker from './library/PositionTracker';
import notificationManager from './library/NotificationManager';
import tools from './library/Tools';
import viewTools from './library/ViewTools';
import deviceChecker from './library/DeviceChecker';
import socketManager, { ChangeTypes } from './library/react/SocketManager';
import WorldMap from './library/react/WorldMap/WorldMap';

require('./library/polyfills');

mouseHandler.setAllowRightClick(true);

if (!tools.getQueryParameters().noFullscreen) {
  document.addEventListener('click', () => {
    viewTools.goFullScreen({});
  });
}

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    window.StatusBar.hide();
    positionTracker.startTracker({ standalone: true });
  });
} else {
  positionTracker.startTracker({});
}

notificationManager.start();

function App() {
  const dispatch = useDispatch();
  const currentUserId = useSelector(getUserId);

  useEffect(() => {
    [
      { type: USERS, event: 'getUsers' },
      { type: ALIASES, event: 'getAliases' },
      { type: MESSAGES, event: 'getMessages' },
      { type: ROOMS, event: 'getRooms' },
    ].forEach((getter) => {
      const { event, type } = getter;

      console.log('Retrieving stuff');

      socketManager.emitEvent(event, {}, ({ error, data }) => {
        if (error) {
          console.log(error);

          return;
        }

        dispatch({
          type,
          payload: {
            reset: true,
            changeType: ChangeTypes.CREATE,
            [type]: data[type],
          },
        });
      });
    });
  }, [dispatch, currentUserId]);

  return (
    <BrowserRouter>
      <MenuBar />
      <div className="main">
        <Chat />
        <WorldMap />
      </div>
      <Switch>
        <Route path="/chat">
          Chat
        </Route>
        <Route path="/docs">
          Docs
        </Route>
        <Route path="/wallet">
          Wallet
        </Route>
        <Route path="/map">
          Map
        </Route>
        <Route path="/teams">
          Teams
        </Route>
        <Route path="/people">
          People
        </Route>
        <Route path="/terminal">
          Terminal
        </Route>
        <Route path="/forum">
          Forum
        </Route>
        <Route path="/admin">
          Admin
        </Route>
        <Route path="/">
          Index
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
