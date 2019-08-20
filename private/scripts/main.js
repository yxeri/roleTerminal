require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const PeopleView = require('../library/components/views/PeopleView');
const userComposer = require('../library/data/composers/UserComposer');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
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
      url: '/images/mapicon.png',
    },
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
      styleName: 'Normal',
      icon: {
        url: '/images/mapicon.png',
      },
    }, {
      styleName: 'Active',
      icon: {
        url: '/images/mapicon-active.png',
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
    elementId: 'worldList',
    title: 'World',
    positionTypes: ['world'],
    effect: true,
    zoomLevel: 7,
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
  }],
};
const chatView = new ChatView({
  allowImages: false,
  effect: true,
  placeholder: 'Alt+Enter to send message',
});
const docFileView = new DocFileView({
  effect: true,
});
const worldMapView = new WorldMapView(worldMapParams);
const worldMapPage = new WorldMapPage(worldMapParams);
const peopleView = new PeopleView({
  effect: true,
});

const menuBar = new MenuBar({
  viewSwitcher,
  title: 'RHINO',
  setMenuImage: false,
  appendTop: false,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    room: true,
    view: true,
    docFile: true,
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
const peopleWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.PEOPLE,
  title: 'Users',
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

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: docWrapper },
    { view: fullMapWrapper },
    { view: peopleWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    fullMapWrapper.viewType,
    docWrapper.viewType,
    peopleWrapper.viewType,
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

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    StatusBar.hide(); // eslint-disable-line
    positionTracker.startTracker({ standalone: true });
  }, false);
} else {
  positionTracker.startTracker({});
}

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}
