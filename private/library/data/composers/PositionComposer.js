const BaseComposer = require('./BaseComposer');

const eventHandler = require('../../EventCentral');
const dataHandler = require('../DataHandler');

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
    this.PositionTypes = {};
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

  addPositionTypes(positionTypes = []) {
    positionTypes.forEach((positionType) => {
      this.PositionTypes[positionType] = positionType;
    });
  }
}

const positionComposer = new PositionComposer();

module.exports = positionComposer;
