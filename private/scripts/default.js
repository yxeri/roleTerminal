/*
 Copyright 2018 Carmilla Mina Jankovic
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

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');
const TeamView = require('../library/components/views/TeamView');
const PeopleView = require('../library/components/views/PeopleView');
const TerminalView = require('../library/components/views/TerminalView');
const ForumView = require('../library/components/views/ForumView');
const AdminView = require('../library/components/views/AdminView');
const ViewWrapper = require('../library/components/ViewWrapper');

const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const userComposer = require('../library/data/composers/UserComposer');
const mouseHandler = require('../library/MouseHandler');
const positionTracker = require('../library/PositionTracker');
const notificationManager = require('../library/NotificationManager');
const tools = require('../library/Tools');
const viewTools = require('../library/ViewTools');
const deviceChecker = require('../library/DeviceChecker');

const worldMapParams = {
  alwaysShowLabels: {
    line: true,
  },
  maxZoom: 19,
  clusterStyle: {
    gridSize: 10,
    maxZoom: 15,
    styles: [{
      width: 24,
      height: 24,
      iconAnchor: [12, 12],
      textSize: 12,
      url: 'images/mapcluster.png',
      textColor: '#ff00d7',
      fontFamily: 'monospace',
    }],
  },
  labelStyle: {
    fontColor: '#00ffef',
    minZoomLevel: 18,
    fontSize: 11,
  },
  backgroundColor: '#23001e',
  positionTypes: [
    'user',
    'device',
    'lantern',
    'local',
    'world',
    'roads',
    'drivable-roads',
  ],
  polygonStyle: {
    strokeColor: '#00ffef',
    fillColor: '#ff00d7',
    opacity: 1,
    strokeOpacity: 1,
    fillOpacity: 1,
    strokeWeight: 1.5,
  },
  markerStyle: {
    opacity: 0.9,
    icon: {
      url: '/images/mapicon.png',
    },
  },
  triggeredStyles: {
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
      style: {
        strokeColor: '#ff00d7',
        fillColor: '#00ffef',
        styleName: 'Occupied',
      },
    }],
  },
  markedStyles: {
    polygons: {
      strokeColor: '#009100',
      fillColor: '#009100',
      styleName: 'Marked',
    },
  },
  choosableStyles: {
    markers: [{
      styleName: 'Red',
      icon: {
        url: '/images/mapicon-red.png',
      },
    }, {
      styleName: 'Green',
      icon: {
        url: '/images/mapicon-green.png',
      },
    }],
    polygons: [{
      strokeColor: '#ff0001',
      fillColor: '#ff0001',
      styleName: 'Red',
    }, {
      strokeColor: '#787878',
      fillColor: '#787878',
      styleName: 'Grey',
    }, {
      strokeColor: '#009100',
      fillColor: '#009100',
      styleName: 'Marked',
    }, {
      strokeColor: '#ff00d7',
      fillColor: '#00ffef',
      styleName: 'Occupied',
    }, {
      strokeColor: '#00ffef',
      fillColor: '#ff00d7',
      styleName: 'Not Occupied',
    }],
  },
  lineStyle: {
    strokeColor: '#ffffff',
    strokeWeight: 2,
  },
  mapStyles: [{
    elementType: 'geometry',
    stylers: [
      { color: '#23001e' },
    ],
  }, {
    elementType: 'labels',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'poi',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'administrative',
    stylers: [
      { color: '#57004a' },
    ],
  }, {
    featureType: 'landscape.natural.terrain',
    stylers: [
      { color: '#44003a' },
    ],
  }, {
    featureType: 'road',
    stylers: [
      { color: '#414141' },
      { weight: 0.5 },
    ],
  }, {
    featureType: 'transit',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'water',
    stylers: [
      { color: '#7d006c' },
    ],
  }],
  lists: [{
    elementId: 'housingList',
    title: 'Housing',
    positionTypes: ['local'],
    effect: true,
    zoomLevel: 18,
  }, {
    elementId: 'userList',
    title: 'Users',
    positionTypes: ['user'],
    effect: true,
    listItemFields: [{
      paramName: 'objectId',
      convertFunc: (objectId) => {
        const name = userComposer.getIdentityName({ objectId });

        return name || objectId;
      },
    }],
    zoomLevel: 18,
  }, {
    elementId: 'worldList',
    title: 'World',
    positionTypes: ['world'],
    effect: true,
    zoomLevel: 10,
  }],
};
const chatView = new ChatView({
  allowImages: true,
  placeholder: 'Alt+Enter to send message',
});
const docFileView = new DocFileView({});
const walletView = new WalletView({});
const worldMapPage = new WorldMapPage(worldMapParams);
const worldMapView = new WorldMapView(worldMapParams);
const teamView = new TeamView({});
const peopleView = new PeopleView({});
const terminalView = new TerminalView({});
const forumView = new ForumView({
  showUserList: true,
});
const adminView = new AdminView({});

const menuBar = new MenuBar({
  viewSwitcher,
  showClock: true,
  showControls: {
    user: true,
    register: true,
    teamProfile: true,
    docFile: true,
    room: true,
    alias: true,
    team: true,
    currentUser: true,
    wallet: true,
  },
});
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Chat',
  columns: [
    {
      components: [{ component: chatView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const docWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.DOCS,
  title: 'Documents',
  columns: [
    {
      components: [{ component: docFileView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const walletWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WALLET,
  title: 'Wallet',
  columns: [
    {
      components: [{ component: walletView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const mapWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WORLDMAP,
  title: 'World Map',
  columns: [
    {
      components: [{ component: worldMapView }],
    },
  ],
});
const teamWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TEAM,
  title: 'Teams',
  columns: [
    {
      components: [{ component: teamView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const peopleWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.PEOPLE,
  title: 'Users',
  columns: [
    {
      components: [{ component: peopleView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const terminalWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TERMINAL,
  title: 'Terminal',
  columns: [
    {
      components: [{ component: terminalView }],
    }, {
      components: [{ component: terminalView }],
    },
  ],
});
const forumWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.FORUM,
  title: 'Forum',
  columns: [
    {
      components: [{ component: forumView }],
    }, {
      components: [{ component: worldMapPage }],
    },
  ],
});
const adminWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.ADMIN,
  title: 'Admin',
  columns: [
    {
      components: [{ component: adminView }],
    },
  ],
});

menuBar.setViews({
  views: [
    { view: chatWrapper },
    { view: docWrapper },
    { view: walletWrapper },
    { view: mapWrapper },
    { view: teamWrapper },
    { view: peopleWrapper },
    { view: terminalWrapper },
    { view: forumWrapper },
    { view: adminWrapper },
  ],
});
viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    docWrapper.viewType,
    walletWrapper.viewType,
    mapWrapper.viewType,
    teamWrapper.viewType,
    peopleWrapper.viewType,
    terminalWrapper.viewType,
    forumWrapper.viewType,
    adminWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: chatWrapper });
viewSwitcher.switchView({ setToDefault: true });
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

console.log(viewSwitcher);
