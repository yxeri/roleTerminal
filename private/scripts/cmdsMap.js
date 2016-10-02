/*
 Copyright 2015 Aleksandar Jankovic

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

/** @module */

const mapTools = require('./mapTools');
const layoutChanger = require('./layoutChanger');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.map = {
  func: (phrases = []) => {
    if (phrases.length > 0) {
      const choice = phrases[0];
      const value = phrases[1];
      const mapDiv = document.getElementById('map');

      switch (choice) {
        case 'on': {
          layoutChanger.splitView(true, mapDiv, mapTools.realignMap);

          if (value) {
            mapTools.setMapView(value);
          } else {
            mapTools.setMapView('area');
          }

          if (mapTools.getMap()) {
            mapTools.resetClusters();
            mapTools.realignMap();
            messenger.queueMessage({ text: ['Map has been loaded'] });
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
          if (mapTools.getMap() && phrases.length > 1) {
            mapTools.setMapView(value);
            mapTools.realignMap();
          }

          break;
        }
        default: {
          layoutChanger.splitView(true, mapDiv, mapTools.realignMap);

          if (mapTools.getMap()) {
            mapTools.resetClusters();
            mapTools.realignMap();
            messenger.queueMessage({ text: ['Map has been loaded'] });
          } else {
            messenger.queueMessage({ text: ['Map data is still loading. Please try again in a couple of seconds'] });
          }

          break;
        }
      }
    } else {
      messenger.queueMessage({ text: ['Incorrect option. Turn on the map with "map on" Turn it off with "map off"'] });
    }
  },
  accessLevel: 1,
  visibility: 1,
  category: 'advanced',
  options: {
    on: { description: 'Show map',
      next: {
        overview: { description: 'World map' },
        me: { description: 'Your location' },
      },
    },
    off: { description: 'Turn off map' },
    zoomin: { description: 'Increase zoom' },
    zoomout: { description: 'Decrease zoom' },
    locate: { description: 'Locate user', next: {} },
    info: { description: 'Show information for the location', next: {} },
  },
  commandName: 'map',
};

module.exports = commands;
