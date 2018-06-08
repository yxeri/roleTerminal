const BaseComposer = require('./BaseComposer');

const eventHandler = require('../../EventCentral');
const dataHandler = require('../DataHandler');
const socketManager = require('../../SocketManager');

class PositionComposer extends BaseComposer {
  constructor() {
    super({
      completionEvent: eventHandler.Events.COMPLETE_POSITION,
      handler: dataHandler.positions,
      dependencies: [
        dataHandler.positions,
        dataHandler.users,
        dataHandler.teams,
      ],
    });

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
    this.PositionStructures = {
      MARKER: 'marker',
      CIRCLE: 'circle',
      POLYGON: 'polygon',
      LINE: 'line',
    };

    eventHandler.addWatcher({
      event: eventHandler.Events.COMPLETE_POSITION,
      func: () => {
        eventHandler.emitEvent({
          event: eventHandler.Events.WORLDMAP,
          params: {},
        });
      },
    });
  }

  updatePosition({
    positionId,
    position,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        positionId,
        position,
      },
    });
  }

  updatePositionCoordinates({
    positionId,
    coordinates,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.UPDATEPOSITIONCOORDINATES,
      params: {
        positionId,
        coordinates,
      },
    });
  }

  getPositions({ positionTypes = [] }) {
    return this.handler.getObjects({
      filter: {
        orCheck: true,
        rules: positionTypes.map((positionType) => {
          return {
            paramName: 'positionType',
            paramValue: positionType,
          };
        }),
      },
    });
  }

  createPosition({
    position,
    callback,
  }) {
    this.handler.createObject({
      callback,
      params: { position },
    });
  }
}

const positionComposer = new PositionComposer();

module.exports = positionComposer;
