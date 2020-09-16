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
import socketManager from '../SocketManager';

class TeamData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'createTeam',
      },
      retrieveEvents: {
        one: 'getTeam',
        many: 'getTeams',
      },
      updateEvents: {
        one: 'updateTeam',
      },
      objectTypes: {
        one: 'team',
        many: 'teams',
      },
      eventTypes: {
        one: eventCentral.Events.TEAM,
        many: eventCentral.Events.TEAMS,
      },
      removeEvents: {
        one: 'removeTeam',
      },
      emitTypes: [socketManager.EmitTypes.TEAM],
    });

    socketManager.addEvent(socketManager.EmitTypes.TEAMMEMBER, ({ data }) => {
      const {
        team,
        user,
      } = data;

      eventCentral.emitEvent({
        event: eventCentral.Events.TEAM_MEMBER,
        params: {
          team,
          user,
        },
      });
    });
  }
}

const teamData = new TeamData();

export default teamData;
