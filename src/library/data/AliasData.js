/*
 Copyright 2018 Carmilla Mina Jankovic

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

import BaseData from './BaseData';

import eventCentral from '../EventCentral';
import { EmitTypes } from '../react/SocketManager';

class AliasData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'createAlias',
      },
      retrieveEvents: {
        one: 'getAlias',
        many: 'getAliases',
      },
      updateEvents: {
        one: 'updateAlias',
      },
      objectTypes: {
        one: 'alias',
        many: 'aliases',
      },
      eventTypes: {
        one: eventCentral.Events.ALIAS,
        many: eventCentral.Events.ALIASES,
      },
      removeEvents: {
        one: 'removeAlias',
      },
      emitTypes: [EmitTypes.ALIAS],
    });
  }
}

const aliasData = new AliasData();

export default aliasData;
