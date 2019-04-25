require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
// const DocFileView = require('../library/components/views/DocFileView');
// const WalletView = require('../library/components/views/WalletView');
// const TeamView = require('../library/components/views/TeamView');
// const ForumView = require('../library/components/views/ForumView');

const userComposer = require('../library/data/composers/UserComposer');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');

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
      textColor: '#15ff00',
      fontFamily: 'monospace',
    }],
  },
  labelStyle: {
    fontColor: '#15ff00',
    minZoomLevel: 18,
    fontSize: 11,
  },
  backgroundColor: '#000000',
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
    strokeColor: '#15ff00',
    fillColor: '#009100',
    opacity: 1,
    strokeOpacity: 1,
    fillOpacity: 1,
    strokeWeight: 1.5,
  },
  markerStyle: {
    opacity: 0.9,
    icon: {
      url: '/images/mapicon-red.png',
    },
  },
  circleStyle: {
    strokeColor: '#15ff00',
    fillColor: '#15ff00',
    strokeOpacity: 1,
    fillOpacity: 0.7,
  },
  triggeredStyles: {
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
      style: {
        strokeColor: '#009100',
        fillColor: '#15ff00',
        styleName: 'Occupied',
      },
    }],
  },
  showLabelRules: {
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
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
    strokeColor: '#15ff00',
    strokeWeight: 2,
  },
  mapStyles: [{
    elementType: 'geometry',
    stylers: [
      { color: '#000000' },
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
      { color: '#065700' },
    ],
  }, {
    featureType: 'landscape.natural.terrain',
    stylers: [
      { color: '#044400' },
    ],
  }, {
    featureType: 'road',
    stylers: [
      { color: '#094100' },
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
      { color: '#077d00' },
    ],
  }],
  lists: [{
    elementId: 'housingList',
    title: 'Housing',
    positionTypes: ['local'],
    effect: true,
    zoomLevel: 18,
  }, {
    elementId: 'lanternList',
    title: 'LANTERN',
    positionTypes: ['lantern'],
    effect: true,
    zoomLevel: 16,
  }, {
    elementId: 'userList',
    title: 'Users',
    positionTypes: ['user'],
    effect: true,
    listItemFields: [{
      paramName: 'objectId',
      convertFunc: (objectId) => {
        const user = userComposer.getUser({ userId: objectId });

        if (user) {
          return user.username;
        }

        return objectId.slice(0, 10);
      },
    }],
    zoomLevel: 18,
  }, {
    elementId: 'roadList',
    title: 'Roads',
    positionTypes: [
      'drivable-roads',
      'roads',
    ],
    effect: true,
    zoomLevel: 18,
  }, {
    elementId: 'deviceList',
    title: 'Device',
    positionTypes: ['device'],
    effect: true,
    zoomLevel: 18,
  }, {
    elementId: 'worldList',
    title: 'World',
    positionTypes: ['world'],
    effect: true,
    zoomLevel: 11,
  }],
};
const chatView = new ChatView({
  allowImages: true,
  hideRoomList: true,
  effect: true,
  placeholder: 'Alt+Enter to send message',
});
// const docFileView = new DocFileView({
//   effect: true,
// });
const worldMapView = new WorldMapView(worldMapParams);
// const walletView = new WalletView({
//   effect: true,
// });
const worldMapPage = new WorldMapPage(worldMapParams);
// const teamView = new TeamView({
//   effect: true,
// });
// const forumView = new ForumView({
//   effect: true,
// });

const menuBar = new MenuBar({
  viewSwitcher,
  appendTop: false,
  title: 'O3C',
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    // room: true,
    view: true,
    // docFile: true,
    // team: true,
  },
});
// const docWrapper = new ViewWrapper({
//   menuBar,
//   viewType: viewSwitcher.ViewTypes.DOCS,
//   title: 'Docs',
//   columns: [{
//     components: [
//       { component: docFileView },
//     ],
//   }, {
//     components: [
//       { component: worldMapPage },
//     ],
//   }],
// });
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Coms',
  columns: [{
    components: [
      { component: chatView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const fullMapWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WORLDMAP,
  title: 'Maps',
  columns: [{
    components: [{ component: worldMapView }],
  }],
});
// const walletWrapper = new ViewWrapper({
//   menuBar,
//   viewType: viewSwitcher.ViewTypes.WALLET,
//   title: 'Vcaps',
//   columns: [{
//     components: [
//       { component: walletView },
//     ],
//   }, {
//     components: [
//       { component: worldMapPage },
//     ],
//   }],
// });
// const teamWrapper = new ViewWrapper({
//   menuBar,
//   viewType: viewSwitcher.ViewTypes.TEAM,
//   title: 'Teams',
//   columns: [{
//     components: [
//       { component: teamView },
//     ],
//   }, {
//     components: [
//       { component: worldMapPage },
//     ],
//   }],
// });
// const forumWrapper = new ViewWrapper({
//   menuBar,
//   viewType: viewSwitcher.ViewTypes.FORUM,
//   title: 'Forums',
//   columns: [{
//     components: [
//       { component: forumView },
//     ],
//   }],
// });

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    // { view: docWrapper },
    { view: fullMapWrapper },
    // { view: walletWrapper },
    // { view: teamWrapper },
    // { view: forumWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    fullMapWrapper.viewType,
    // walletWrapper.viewType,
    // docWrapper.viewType,
    // teamWrapper.viewType,
    // forumWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: chatWrapper });
viewSwitcher.switchView({
  setToDefault: true,
  view: chatWrapper,
});

if (!tools.getQueryParameters().noFullscreen) {
  document.addEventListener('click', () => {
    viewTools.goFullScreen({});
  });
}

voiceCommander.start();
voiceCommander.addCommands({
  activationString: labelHandler.getLabel({ baseObject: 'VoiceCommands', label: 'viewSwitch' }),
  commands: [
    {
      strings: [
        'chat',
        'coms',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT }); },
    },
    // {
    //   strings: [
    //     'docs',
    //     'documents',
    //     'files',
    //   ],
    //   func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.DOCS }); },
    // },
    {
      strings: [
        'map',
        'maps',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP }); },
    },
    // {
    //   strings: [
    //     'wallet',
    //     'vcaps',
    //   ],
    //   func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WALLET }); },
    // }, {
    //   strings: [
    //     'teams',
    //   ],
    //   func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.TEAM }); },
    // }, {
    //   strings: [
    //     'forum',
    //     'forums',
    //   ],
    //   func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.FORUM }); },
    // },
  ],
});

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    StatusBar.hide(); // eslint-disable-line
    positionTracker.startTracker({ standalone: true });
  }, false);
} else {
  positionTracker.startTracker({});
}
