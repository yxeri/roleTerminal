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
const storageManager = require('../../StorageManager');

class RoomList extends List {
  constructor({
    classes = [],
    elementId = `rList-${Date.now()}`,
  }) {
    classes.push('roomList');

    const headerFields = [
      { paramName: 'username' },
    ];

    super({
      elementId,
      classes,
      focusedId: storageManager.getCurrentRoom(),
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_ROOM,
            params: {
              origin: this.elementId,
              room: { objectId },
            },
          });
        },
      },
      collector: dataHandler.rooms,
      listItemFields: headerFields,
    });
  }
}

module.exports = RoomList;
