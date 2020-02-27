/*
 Copyright 2020 Carmilla Mina Jankovic

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

const BaseView = require('./BaseView');

const elementCreator = require('../../ElementCreator');
const teamComposer = require('../../data/composers/TeamComposer');
const eventCentral = require('../../EventCentral');

class TeamScoreInfo extends BaseView {
  constructor() {
    super({ classes: ['teamScoreInfo'] });

    eventCentral.addWatcher({
      event: eventCentral.Events.TEAM,
      func: () => {
        this.renderTeams();
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.TEAMS,
      func: () => {
        this.renderTeams();
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.COMPLETE_TEAM,
      func: () => {
        this.renderTeams();
      },
    });
  }

  renderTeams() {
    const list = elementCreator.createList({
      classes: ['teamScore'],
      items: teamComposer.getTeams().map((team) => {
        return {
          elements: [elementCreator.createSpan({ text: `${team.teamName}: ${team.score}` })],
        };
      }),
    });

    if (this.element.firstElementChild) {
      this.element.replaceChild(list, this.element.firstElementChild);
    } else {
      this.element.appendChild(list);
    }
  }
}

module.exports = TeamScoreInfo;
