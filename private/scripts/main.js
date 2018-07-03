require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const TopView = require('../library/components/views/StatusBar');
const DocFileView = require('../library/components/views/DocFileView');

const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });

const chatView = new ChatView({
  sendOnEnter: true,
  placeholder: 'Enter your message',
});
const docFileView = new DocFileView({});
const worldMapView = new WorldMapView({
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
      textColor: '#000000',
      fontFamily: 'monospace',
    }],
  },
  backgroundColor: '#11433e',
  positionTypes: [
    'housing',
    'roads',
  ],
  polygonStyle: {
    strokeColor: '#000000',
    fillColor: '#0c9e00',
    opacity: 1,
    strokeOpacity: 1,
    fillOpacity: 1,
  },
  markerStyle: {
    opacity: 0.9,
    icon: {
      url: '/images/mapicon-red.png',
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
      strokeColor: '#000000',
      fillColor: '#9b0000',
      styleName: 'Red',
    }, {
      styleName: 'Green',
      strokeColor: '#000000',
      fillColor: '#00b402',
    }],
  },
  lineStyle: {
    strokeColor: '#7f7f7f',
    strokeWeight: 2,
  },
  mapStyles: [{
    elementType: 'geometry',
    stylers: [
      { color: '#11433e' },
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
      { color: '#000000' },
    ],
  }, {
    featureType: 'landscape.man_made',
    stylers: [
      { color: '#11433e' },
    ],
  }, {
    featureType: 'landscape.natural.terrain',
    stylers: [
      { color: '#1a6962' },
    ],
  }, {
    featureType: 'road',
    stylers: [
      { color: '#696969' },
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
      { color: '#092522' },
    ],
  }],
});

const statusBar = new TopView({
  viewSwitcher,
  title: 'SISCOM',
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
const mapWrapper = new ViewWrapper({
  statusBar,
  title: 'MAPS',
  columns: [{
    components: [
      { component: worldMapView },
    ],
  }, {
    components: [
      { component: chatView },
    ],
  }],
});
const docWrapper = new ViewWrapper({
  statusBar,
  title: 'DOCS',
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
  title: 'COMS',
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
  title: 'MAPS FOCUS',
  columns: [{
    components: [{ component: worldMapView }],
  }],
});

statusBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: mapWrapper },
    { view: docWrapper },
    { view: fullMapWrapper },
  ],
});

viewSwitcher.switchView({ view: chatWrapper });
