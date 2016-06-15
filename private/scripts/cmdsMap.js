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

          mapTools.resetClusters();
          mapTools.realignMap();

          break;
        }
        case 'off': {
          layoutChanger.splitView(false, mapDiv);

          break;
        }
        case 'zoomin': {
          if (mapTools.getMap()) {
            mapTools.increaseZoom();
          }

          break;
        }
        case 'zoomout': {
          if (mapTools.getMap()) {
            mapTools.decreaseZoom();
          }

          break;
        }
        case 'info': {
          const searchString = phrases.slice(1).join(' ').toLowerCase();
          const infoText = mapTools.getInfoText(searchString);

          if (infoText) {
            messenger.queueMessage({ text: [infoText.title, infoText.description] });
          }

          break;
        }
        case 'locate': {
          // if (value) {
          //   const marker = mapMarkers[value];
          //
          //   if (marker) {
          //     // stuff
          //   } else {
          //     queueMessage({ text: labels.getText('error', 'unableToFindMap') });
          //   }
          // } else {
          //   queueMessage({ text: labels.getText('error', 'locateValueMissing') });
          // }

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
    locate: { description: 'Locate person or place' },
    info: { description: 'Show information for the location' },
  },
  commandName: 'map',
};

module.exports = commands;
