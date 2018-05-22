/*
 Copyright 2018 Aleksandar Jankovic

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

const List = require('./List');

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const worldMapHandler = require('../worldMap/WorldMapHandler');

class PositionList extends List {
  constructor({
    classes = [],
    positionTypes = Object.keys(worldMapHandler.PositionTypes).map(positionType => worldMapHandler.PositionTypes[positionType]),
    elementId = `pList-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['positionList']),
      filter: {
        orCheck: true,
        rules: positionTypes.map((positionType) => {
          return { paramName: 'positionType', paramValue: positionType };
        }),
      },
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.positions,
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          eventCentral.emitEvent({
            event: eventCentral.Events.FOCUS_MAPPOSITION,
            params: {
              origin: this.elementId,
              position: { objectId },
            },
          });
        },
      },
      collector: dataHandler.positions,
      listItemFields: [
        { paramName: 'positionName' },
      ],
    });

    this.positionTypes = positionTypes;
  }
}

module.exports = PositionList;
