require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const TeamView = require('../library/components/views/TeamView');
const PeopleView = require('../library/components/views/PeopleView');
const TextAnimation = require('../library/components/views/TextAnimation');
const AdminView = require('../library/components/views/AdminView');
const TargetDialog = require('../library/components/views/dialogs/TargetDialog');
const TemporaryDialog = require('../library/components/views/dialogs/TemporaryDialog');

const userComposer = require('../library/data/composers/UserComposer');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');
const elementCreator = require('../library/ElementCreator');
const socketManager = require('../library/SocketManager');
const deviceChecker = require('../library/DeviceChecker');
const mouseHandler = require('../library/MouseHandler');
const notificationManager = require('../library/NotificationManager');
const accessCentral = require('../library/AccessCentral');
const storageManager = require('../library/StorageManager');
const eventCentral = require('../library/EventCentral');

const organicaLogo = [
  { element: elementCreator.createSpan({ text: '                          ####', classes: ['pre'] }), fullscreen: true },
  { element: elementCreator.createSpan({ text: '                ####    #########    ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '               ###########################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              #############################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '            #######        ##   #  ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      ##########           ##    #  ###  ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #########             #########   #   #########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '       #####               ##     ########   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #####                 ##     ##     ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     ####                  ##      ##     #   ######', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' #######                   ##########     ##    ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##       ########     ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ######    O̶r̶g̶a̶n̶i̶c̶a RAZOR  ##       #      #############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####   Oracle           ##       #      ##     ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####   Operating        ##       #      ##    #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####    System          ##       #      ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##       #########    ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##########      #    #########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ########                  ##      ##     ## ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #####                 ##      ##     ### #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '       #####               ##     ########   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      #######              ##########   #  ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     ###########           ##    ##    # ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      #############        ##    #   #############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '            ################################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              ############################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              #######  ##########  #######', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                ###      ######      ###', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                          ####', classes: ['pre'] }), afterTimeout: 2000 },
];
const razorLogo = [
  { element: elementCreator.createSpan({ text: '   ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '###############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' #####  #########                                           ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####     #######  ########     ###########    ####     ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####    ######      #######   ####   #####  ########    ####   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####  ###         ####  ####        ####  ###    ###### ####   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  #########        ####    ####     ####   #####     ##############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  #### ######     ####     #####  ####     #######   ###  ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####   ######  ##### #### #### ############  #######    ####   ###', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ######    #############    ################     ###      ####    #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########     ########        ####                        ######      #####   ##', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '               ###########        ##                                    ###### ', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                    ###############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '#RAZOR# Demos - Warez - Honey' }), afterTimeout: 2000 },
];

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
const worldMapPage = new WorldMapPage(worldMapParams);
const teamView = new TeamView({
  effect: true,
});
const peopleView = new PeopleView({
  effect: true,
});
const adminView = new AdminView({});
const targetButton = elementCreator.createSpan({
  text: 'TARGET',
  classes: ['topMenuButton'],
  clickFuncs: {
    leftFunc: () => {
      const dialog = new TargetDialog({});

      dialog.addToView({ element: viewSwitcher.getParentElement() });
    },
  },
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
  elements: [
    targetButton,
  ],
});
accessCentral.addAccessElement({
  element: targetButton,
  minimumAccessLevel: 1,
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
    { view: teamWrapper },
    { view: peopleWrapper },
    { view: adminWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    fullMapWrapper.viewType,
    docWrapper.viewType,
    teamWrapper.viewType,
    peopleWrapper.viewType,
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

const boot = new TextAnimation({
  messages: organicaLogo.concat([
    { element: elementCreator.createSpan({ text: 'Connecting to HQ...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Failed to connect to HQ' }) },
    { element: elementCreator.createSpan({ text: 'Rerouting...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Connected!' }) },
    { element: elementCreator.createSpan({ text: 'Welcome to the Oracle, employee UNDEFINED.' }) },
    { element: elementCreator.createSpan({ text: 'May you have a productive day!' }) },
    { element: elementCreator.createSpan({ text: '' }) },
    { element: elementCreator.createSpan({ text: 'Establishing uplink to relays...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Uplink established!' }) },
    { element: elementCreator.createSpan({ text: 'Downloading modules...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'LAMM  - LANTERN Amplification Master Manipulator' }) },
    { element: elementCreator.createSpan({ text: 'RSAT  - O̶r̶g̶a̶n̶i̶c̶a RAZOR System Administrator Toolset' }) },
    { element: elementCreator.createSpan({ text: 'CHAT  - Communication Host-Agent Tracker' }) },
    { element: elementCreator.createSpan({ text: 'CREDS - Computer Registered Evaluative Decision System' }) },
    { element: elementCreator.createSpan({ text: 'YOU   - YOU Object Unifier' }) },
    { element: elementCreator.createSpan({ text: 'Booting O3S 7.1.3...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'THIS RELEASE OF O3S WAS BROUGHT TO YOU BY' }) },
  ], razorLogo, [
    { element: elementCreator.createSpan({ text: 'ENJOY' }) },
    { element: elementCreator.createSpan({ text: 'O̶r̶g̶a̶n̶i̶c̶a RAZOR approved device detected!' }) },
    { element: elementCreator.createSpan({ text: 'Rewriting firmware...' }) },
    { element: elementCreator.createSpan({ text: 'Overriding lock...' }) },
    { element: elementCreator.createSpan({ text: 'Loading' }), afterTimeout: 2000 },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
  ]),
});

// boot.addToView({ element: viewSwitcher.getParentElement() });

socketManager.addEvent(socketManager.EmitTypes.TERMINATE, () => {
  storageManager.resetUser();

  eventCentral.emitEvent({
    event: eventCentral.Events.LOGOUT,
    params: {},
  });

  const dialog = new TemporaryDialog({
    text: [labelHandler.getLabel({ baseObject: 'UserUpdate', label: 'terminated' })],
  });

  dialog.addToView({ element: viewSwitcher.getParentElement() });
});

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
