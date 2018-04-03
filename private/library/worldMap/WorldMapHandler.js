const eventHandler = require('../EventCentral');
const dataHandler = require('../data/DataHandler');

class WorldMapHandler {
  constructor() {
    /**
     * A LOCAL position is within the game area.
     * Eveything outside of the game area is of type WORLD.
     * @type {{string}}
     */
    this.PositionTypes = {
      USER: 'user',
      DEVICE: 'device',
      WORLD: 'world',
      LOCAL: 'local',
      TOOL: 'tool',
    };
    this.hasFected = false;

    eventHandler.addWatcher({
      event: eventHandler.Events.POSITION,
      func: () => {},
    });

    this.startMap();
  }

  startMap() {
    if (
      typeof google === 'undefined'
      || typeof google.maps.geometry === 'undefined'
      || typeof MarkerClusterer === 'undefined'
      || typeof MapLabel === 'undefined'
      || !dataHandler.positions.hasFetched
      || !dataHandler.users.hasFetched
      || !dataHandler.teams.hasFetched
    ) {
      setTimeout(() => { this.startMap(); }, 500);

      return;
    }

    this.hasFected = true;

    eventHandler.emitEvent({
      event: eventHandler.Events.WORLDMAP,
      params: {},
    });
  }
}

const worldMapHandler = new WorldMapHandler();

module.exports = worldMapHandler;
