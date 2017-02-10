/*
 Copyright 2016 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

require('../library/polyfills');

const LoginBox = require('../library/view/templates/LoginBox');
const Messenger = require('../library/view/templates/Messenger');
const Time = require('../library/view/templates/Clock');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
const MainMenu = require('../library/view/templates/MainMenu');
const WorldMap = require('../library/view/worldMap/WorldMap');
const keyHandler = require('../library/KeyHandler');
const deviceChecker = require('../library/DeviceChecker');
const socketManager = require('../library/SocketManager');
const storageManager = require('../library/StorageManager');
const textTools = require('../library/TextTools');
const viewTools = require('../library/ViewTools');
const eventCentral = require('../library/EventCentral');

const mainView = document.getElementById('main');
const top = document.getElementById('top');
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));

if (storageManager.getDeviceId() === null) {
  storageManager.setDeviceId(textTools.createAlphaNumbericalString(16, false));
}

if (!storageManager.getUserName()) {
  storageManager.setAccessLevel(0);
}

window.addEventListener('error', (event) => {
  /**
   * Reloads page
   * @private
   */
  function restart() {
    window.location.reload();
  }

  console.log(event.error);
  // setTimeout(restart, 3000);

  return false;
});

const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Skicka', isTopDown: false });
const map = new WorldMap({
  mapView: WorldMap.MapViews.OVERVIEW,
  clusterStyle: {
    gridSize: 24,
    maxZoom: 17,
    zoomOnClick: false,
    singleSize: true,
    averageCenter: true,
    styles: [{
      width: 24,
      height: 24,
      iconAnchor: [12, 12],
      textSize: 12,
      url: 'images/mapcluster.png',
    }],
  },
  mapStyles: [
    {
      featureType: 'all',
      elementType: 'all',
      stylers: [
        { color: '#d9d9d9' },
      ],
    }, {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        { color: '#000000' },
      ],
    }, {
      featureType: 'road',
      elementType: 'labels',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'poi',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'administrative',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        { color: '#ffffff' },
      ],
    },
  ],
  labelStyle: {
    fontFamily: 'monospace',
    fontColor: '#00ffcc',
    strokeColor: '#001e15',
    fontSize: 12,
  },
  mapBackground: '#d9d9d9',
});
const topMenu = new MainMenu({ parentElement: mainView });

topMenu.appendTo(top);

top.addEventListener('click', () => {
  topMenu.element.classList.toggle('hide');
});

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOS) {
  if (!viewTools.isLandscape()) {
    top.classList.add('appleMenuFix');
  }

  window.addEventListener('orientationchange', () => {
    if (viewTools.isLandscape()) {
      top.classList.remove('appleMenuFix');
    } else {
      top.classList.add('appleMenuFix');
    }
  });
}

keyHandler.addKey(112, viewTools.goFullScreen);

window.addEventListener('click', () => {
  viewTools.goFullScreen();
});

socketManager.addEvents([
  {
    event: 'disconnect',
    func: () => {
      onlineStatus.setOffline();
    },
  }, {
    event: 'reconnect',
    func: () => {
      onlineStatus.setOnline();
      socketManager.reconnectDone();
    },
  }, {
    event: 'startup',
    func: ({ yearModification, centerLat, centerLong, cornerOneLat, cornerOneLong, cornerTwoLat, cornerTwoLong, defaultZoomLevel }) => {
      storageManager.setLocalVal('yearModification', yearModification);
      storageManager.setCenterCoordinates(centerLong, centerLat);
      storageManager.setCornerOneCoordinates(cornerOneLong, cornerOneLat);
      storageManager.setCornerTwoCoordinates(cornerTwoLong, cornerTwoLat);
      storageManager.setDefaultZoomLevel(defaultZoomLevel);

      onlineStatus.setOnline();
      new Time(document.getElementById('time')).startClock();

      socketManager.emitEvent('updateId', {
        user: { userName: storageManager.getUserName() },
        device: { deviceId: storageManager.getDeviceId() },
      }, ({ error, data = {} }) => {
        if (error) {
          return;
        }

        const userName = storageManager.getUserName();

        if (userName && data.anonUser) {
          storageManager.removeUser();

          new LoginBox({
            description: ['Endast för Krismyndigheten och Försvarsmakten'],
            extraDescription: [
              'Din användare kunde inte hittas i databasen',
              'Ni behöver registrera en ny användare',
            ],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else if (data.anonUser) {
          new LoginBox({
            description: ['Endast för Krismyndigheten och Försvarsmakten'],
            extraDescription: ['Skriv in ert användarnamn och lösenord'],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else {
          // TODO Duplicate code with LoginBox?
          storageManager.setAccessLevel(data.user.accessLevel);
          eventCentral.triggerEvent({ event: eventCentral.Events.ALIAS, params: { aliases: data.user.aliases } });
        }

        map.setCornerCoordinates(storageManager.getCornerOneCoordinates(), storageManager.getCornerTwoCoordinates());
        map.setCenterCoordinates(storageManager.getCenterCoordinates());
        map.setDefaultZoomLevel(storageManager.getDefaultZoomlevel());
        map.appendTo(mainView);
        map.startMap();

        // messenger.appendTo(mainView);

        socketManager.emitEvent('history', { lines: 10000 }, ({ data: historyData, historyError }) => {
          if (historyError) {
            console.log('history', historyError);

            return;
          }

          eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { messages: historyData.messages, options: { printable: true }, shouldScroll: true } });
        });
      });
    },
  }, {
    event: 'message',
    func: ({ message }) => {
      console.log(message);
    },
  }, {
    event: 'chatMsgs',
    func: ({ messages }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { messages, options: { printable: true } } });
    },
  },
]);
