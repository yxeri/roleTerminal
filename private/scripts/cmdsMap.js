const mapTools = require('./mapTools');
const socketHandler = require('./socketHandler');
const storage = require('./storage');
const layoutChanger = require('./layoutChanger');
const messenger = require('./messenger');

const commands = {};

commands.map = {
  func: (phrases = []) => {
    if (phrases.length > 0) {
      const choice = phrases[0];
      const value = phrases[1];
      const mapDiv = document.getElementById('map');

      switch (choice) {
        case 'on': {
          layoutChanger.splitView(true, mapDiv);

          if (value) {
            mapTools.setMapView(value);
          } else {
            mapTools.setMapView('area');
          }

          if (!mapTools.getMap()) {
            mapTools.createMap({
              centerCoordinates: storage.getCenterCoordinates(),
              zoomLevel: storage.getDefaultZoomLevel(),
              elementId: 'map',
            });
            socketHandler.emit('getMapPositions', { types: ['static', 'users'] });
            socketHandler.emit('getGooglePositions', { types: ['world'] });
          }

          if (mapTools.getMap()) {
            mapTools.resetClusters();
            mapTools.realignMap();
          } else {
            messenger.queueMessage({ text: ['Map data is still loading. Please try again in a couple of seconds'] });
          }

          break;
        }
        case 'off': {
          layoutChanger.splitView(false, mapDiv);

          break;
        }
        case 'zoomin': {
          if (mapTools.getMap() && layoutChanger.isViewSplit) {
            mapTools.increaseZoom();
          }

          break;
        }
        case 'zoomout': {
          if (mapTools.getMap() && layoutChanger.isViewSplit) {
            mapTools.decreaseZoom();
          }

          break;
        }
        case 'info': {
          if (mapTools.getMap() && phrases.length > 1) {
            const searchString = phrases.slice(1).join(' ').toLowerCase();
            const infoText = mapTools.getInfoText(searchString);

            if (infoText) {
              messenger.queueMessage({ text: [infoText.title, infoText.description] });
            }
          }

          break;
        }
        case 'locate': {
          // TODO

          break;
        }
        default: {
          break;
        }
      }
    }
  },
  accessLevel: 1,
  visibility: 1,
  category: 'advanced',
  options: {
    on: { description: 'Show map', next: {
      overview: { description: 'World map' },
      me: { description: 'Your location' },
    } },
    off: { description: 'Turn off map' },
    zoomin: { description: 'Increase zoom' },
    zoomout: { description: 'Decrease zoom' },
    user: { description: 'Locate user', next: {} },
    location: { description: 'Locate location', next: {} },
    info: { description: 'Show information for the location' },
  },
  commandName: 'map',
};

module.exports = commands;
