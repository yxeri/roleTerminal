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

const BaseData = require('./BaseData');

const eventCentral = require('../EventCentral');
const socketManager = require('../SocketManager');

class RoomData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'createRoom',
      },
      retrieveEvents: {
        one: 'getRoom',
        many: 'getRooms',
      },
      updateEvents: {
        one: 'updateRoom',
      },
      objectTypes: {
        one: 'room',
        many: 'rooms',
      },
      eventTypes: {
        one: eventCentral.Events.ROOM,
        many: eventCentral.Events.ROOMS,
      },
      removeEvents: {
        one: 'removeRoom',
      },
      emitTypes: [socketManager.EmitTypes.ROOM],
    });
  }
}

const roomData = new RoomData();

module.exports = roomData;
