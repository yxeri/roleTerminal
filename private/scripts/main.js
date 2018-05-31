require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const TopView = require('../library/components/views/TopView');

const element = document.getElementById('main');

const chatView = new ChatView({
  sendOnEnter: true,
  placeholder: 'Enter your message',
});

const worldMapView = new WorldMapView({
  clusterStyle: {
    gridSize: 22,
    maxZoom: 16,
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
    'zones',
    'missions',
  ],
  polygonStyle: {
    strokeColor: '#000000',
    fillColor: '#FFFFFF',
  },
  lineStyle: {
    strokeColor: '#FFFFFF',
  },
  mapStyles: [
    {
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
        { color: '#bababa' },
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
    },
  ],
});

const viewWrapper = new ViewWrapper({
  topView: new TopView({
    title: 'SISCOM',
    showClock: true,
    showControls: {
      user: true,
      alias: true,
    },
  }),
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

viewWrapper.addToView({ element });

window.addEventListener('error', (event) => {
  element.appendChild(document.createTextNode(`<<ERROR>>${JSON.stringify(event)}`));

  return false;
});
