/*
 Copyright 2019 Carmilla Mina Jankovic

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

import BaseView from './BaseView';

import elementCreator from '../../ElementCreator';
import userComposer from '../../data/composers/UserComposer';
import eventCentral from '../../EventCentral';
import teamComposer from '../../data/composers/TeamComposer';

class TeamInfo extends BaseView {
  constructor() {
    const teamSpan = elementCreator.createSpan({ text: '---' });
    const setTeamFunc = ({ user, team }) => {
      const identity = user || userComposer.getCurrentIdentity();

      teamSpan.innerHTML = '';

      if (identity.partOfTeams && identity.partOfTeams.length > 0) {
        const currentTeam = team || teamComposer.getTeam({ teamId: identity.partOfTeams[0] });

        teamSpan.appendChild(document.createTextNode(currentTeam.teamName));
      } else {
        teamSpan.appendChild(document.createTextNode('---'));
      }
    };

    super({});

    this.element = elementCreator.createContainer({
      classes: ['teamInfo'],
      clickFuncs: {
        leftFunc: () => {
        },
      },
    });
    this.element.appendChild(teamSpan);

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_USER,
      func: () => {
        setTeamFunc({});
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.CHANGED_ALIAS,
      func: () => {
        setTeamFunc({});
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGIN,
      func: () => {
        setTeamFunc({});
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGOUT,
      func: () => {
        setTeamFunc({});
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.TEAM_MEMBER,
      func: ({ user, team }) => {
        const identity = userComposer.getCurrentIdentity();

        if (identity.objectId === user.objectId) {
          setTeamFunc({ user, team });
        }
      },
    });
  }
}

export default TeamInfo;
