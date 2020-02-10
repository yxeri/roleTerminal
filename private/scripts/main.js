require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');
const TeamView = require('../library/components/views/TeamView');
const PeopleView = require('../library/components/views/PeopleView');
const TerminalView = require('../library/components/views/TerminalView');
const ForumView = require('../library/components/views/ForumView');
const AdminView = require('../library/components/views/AdminView');

const userComposer = require('../library/data/composers/UserComposer');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');
const elementCreator = require('../library/ElementCreator');
const deviceChecker = require('../library/DeviceChecker');
const mouseHandler = require('../library/MouseHandler');
const notificationManager = require('../library/NotificationManager');

labelHandler.setLabel({
  baseObject: 'WalletDialog',
  labelName: 'currency',
  label: 'vcaps',
});

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
    markers: [{
      paramName: 'positionName',
      type: 'string',
      value: 'Sticky Spoon Love Bureau',
      style: {
        icon: {
          url: '/images/heart.png',
        },
      },
    }, {
      paramName: 'positionType',
      type: 'string',
      value: 'lantern',
      style: {
        icon: {
          url: '/images/mapicon-red.png',
        },
      },
    }],
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
  effect: true,
  placeholder: 'Alt+Enter to send message',
});
const docFileView = new DocFileView({
  effect: true,
});
const worldMapView = new WorldMapView(worldMapParams);
const walletView = new WalletView({
  effect: true,
});
const worldMapPage = new WorldMapPage(worldMapParams);
const teamView = new TeamView({
  effect: true,
});
const peopleView = new PeopleView({
  effect: true,
});
const forumView = new ForumView({
  showForumList: false,
  showUserList: false,
});
const adminView = new AdminView({});
const terminalView = new TerminalView({
  bootSequence: [
    { element: elementCreator.createSpan({ text: 'O̶r̶g̶a̶n̶i̶c̶a RAZOR System Administrator Toolset' }) },
    { element: elementCreator.createSpan({ text: 'RSAT ACCESS AUTHENTICATION' }) },
    { element: elementCreator.createSpan({ text: 'PERMITTED ONLY BY AUTHORIZED PERSONNEL' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
    { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
    { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
    { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
    { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
    { element: elementCreator.createSpan({ text: 'Loading...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'ACCESS GRANTED' }) },
    { element: elementCreator.createSpan({ text: 'Welcome, administrator Charlotte Jenkins' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Your field report is -1 days late' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Oracle status: HQ CONNECTION FAILED' }) },
    { element: elementCreator.createSpan({ text: 'RSAT version: UNDEFINED' }) },
    { element: elementCreator.createSpan({ text: 'THIS RELEASE OF RSAT WAS BROUGHT TO YOU BY' }) },
  ],
});

const menuBar = new MenuBar({
  viewSwitcher,
  appendTop: false,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    room: true,
    view: true,
    docFile: true,
    team: true,
  },
});
const docWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.DOCS,
  title: 'Docs',
  columns: [{
    components: [
      { component: docFileView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
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
const walletWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WALLET,
  title: 'Vcaps',
  columns: [{
    components: [
      { component: walletView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const teamWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TEAM,
  title: 'Teams',
  columns: [{
    components: [
      { component: teamView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const peopleWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.PEOPLE,
  title: 'Employees',
  columns: [{
    components: [
      { component: peopleView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const terminalWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TERMINAL,
  title: 'Terminal',
  columns: [{
    components: [{ component: terminalView }],
  }, {
    components: [{ component: worldMapPage }],
  }],
});
const forumWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.FORUM,
  title: 'Forum',
  columns: [{
    components: [{ component: forumView }],
  }, {
    components: [{ component: worldMapPage }],
  }],
});
const adminWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.ADMIN,
  title: 'Admin',
  columns: [{
    components: [{ component: adminView }],
  }],
});

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: docWrapper },
    { view: fullMapWrapper },
    { view: walletWrapper },
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
    fullMapWrapper.viewType,
    walletWrapper.viewType,
    docWrapper.viewType,
    teamWrapper.viewType,
    peopleWrapper.viewType,
    terminalWrapper.viewType,
    forumWrapper.viewType,
    adminWrapper.viewType,
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

// voiceCommander.start();
voiceCommander.addCommands({
  activationString: labelHandler.getLabel({ baseObject: 'VoiceCommands', label: 'viewSwitch' }),
  commands: [
    {
      strings: [
        'chat',
        'coms',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT }); },
    }, {
      strings: [
        'docs',
        'documents',
        'files',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.DOCS }); },
    }, {
      strings: [
        'map',
        'maps',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP }); },
    }, {
      strings: [
        'wallet',
        'vcaps',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WALLET }); },
    }, {
      strings: [
        'teams',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.TEAM }); },
    }, {
      strings: [
        'forum',
        'forums',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.FORUM }); },
    },
  ],
});

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}

mouseHandler.setAllowRightClick(true);

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    window.StatusBar.hide();
    positionTracker.startTracker({ standalone: true });
  });
} else {
  positionTracker.startTracker({});
}

notificationManager.start();
