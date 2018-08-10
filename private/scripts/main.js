require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const TopView = require('../library/components/views/StatusBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');

const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });

const chatView = new ChatView({
  sendOnEnter: true,
  placeholder: 'Enter your message',
});
const docFileView = new DocFileView({});
const worldMapView = new WorldMapView({
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
    minZoomLevel: 19,
    fontSize: 11,
  },
  backgroundColor: '#23001e',
  positionTypes: [
    'user',
    'device',
    'lantern',
    'housing',
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
      url: '/images/mapicon-red.png',
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
  showLabelRules: {
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
    }],
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
      { color: '#555555' },
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
});
const walletView = new WalletView({});

const statusBar = new TopView({
  viewSwitcher,
  title: 'O3C',
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
  statusBar,
  viewType: viewSwitcher.ViewTypes.DOCS,
  title: 'Docs',
  columns: [{
    components: [
      { component: docFileView },
    ],
  }, {
    components: [
      { component: worldMapView },
    ],
  }],
});
const chatWrapper = new ViewWrapper({
  statusBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Coms',
  columns: [{
    components: [
      { component: chatView },
    ],
  }, {
    components: [
      { component: worldMapView },
    ],
  }],
});
const fullMapWrapper = new ViewWrapper({
  statusBar,
  viewType: viewSwitcher.ViewTypes.WORLDMAP,
  title: 'Maps',
  columns: [{
    components: [{ component: worldMapView }],
  }],
});
const walletWrapper = new ViewWrapper({
  statusBar,
  viewType: viewSwitcher.ViewTypes.WALLET,
  title: 'Vcaps',
  columns: [{
    components: [
      { component: walletView },
    ],
  }, {
    components: [
      { component: worldMapView },
    ],
  }],
});

statusBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: docWrapper },
    { view: fullMapWrapper },
    { view: walletWrapper },
  ],
});

document.addEventListener('click', () => {
  viewTools.goFullScreen({});
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    fullMapWrapper.viewType,
    walletWrapper.viewType,
    docWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: chatWrapper });
viewSwitcher.switchView({
  setToDefault: true,
  view: chatWrapper,
});

positionTracker.startTracker();
