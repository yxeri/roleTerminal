/*
 Copyright 2017 Aleksandar Jankovic
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

const elementCreator = require('../library/ElementCreator');
const eventCentral = require('../library/EventCentral');
const textTools = require('../library/TextTools');

class WreckingStatus {
  constructor({ parent }) {
    this.element = elementCreator.createContainer({ classes: ['hide', 'wreckingStatus'] });

    this.stations = {};
    this.teams = {};

    this.stationStats = elementCreator.createList({ classes: ['stationStats'] });
    this.teamStats = elementCreator.createList({ classes: ['teamStats'] });

    this.isActive = false;
    this.timeSpan = elementCreator.createSpan({ text: '----' });
    this.timeLeft = new Date();

    this.element.appendChild(this.timeSpan);
    this.element.appendChild(this.teamStats);
    this.element.appendChild(this.stationStats);

    this.startTime();

    this.element.addEventListener('click', (event) => {
      this.element.classList.toggle('hide');

      event.stopPropagation();
    });

    eventCentral.addWatcher({
      event: 'lanternStations',
      func: ({ stations }) => {
        if (!stations) {
          console.log('no lantern stations');

          return;
        }

        const fragment = document.createDocumentFragment();

        stations.forEach((station) => {
          this.stations[station.stationId] = station;
        });

        Object.keys(this.stations).forEach((stationId) => {
          const station = this.stations[stationId];

          if (station) {
            const foundTeamId = station.owner
              ? Object.keys(this.teams).find(teamId => teamId === station.owner.toString())
              : undefined;
            const ownerName = foundTeamId
              ? this.teams[foundTeamId].shortName.toUpperCase()
              : '-----';
            const classes = ['stationInfo'];
            const items = [];

            if (station.isUnderAttack && this.isActive) {
              classes.push('warning');
            }

            items.push({ elements: [elementCreator.createSpan({ text: `${station.stationName || station.stationId}` })] });

            if (!this.isActive) {
              items.push({ elements: [elementCreator.createSpan({ text: 'REQUIRES MAINTENANCE' })] });
            } else if (station.isActive) {
              items.push({
                elements: [elementCreator.createSpan({ text: `Signal: ${station.signalValue}` }), elementCreator.createSpan({ text: `Owner: ${ownerName}` })],
              });
            } else {
              items.push({ elements: [elementCreator.createSpan({ text: 'NO SIGNAL' })] });
            }

            const list = elementCreator.createList({
              classes,
              items,
            });

            fragment.appendChild(list);
          }
        });

        this.stationStats.innerHTML = '';
        this.stationStats.appendChild(fragment);
      },
    });

    eventCentral.addWatcher({
      event: 'lanternTeams',
      func: ({ teams }) => {
        if (!teams) {
          console.log('no lantern teams');

          return;
        }

        const fragment = document.createDocumentFragment();

        fragment.appendChild(elementCreator.createListItem({ elements: [this.timeSpan] }));

        teams.forEach((team) => {
          this.teams[team.teamId] = team;
        });

        Object.keys(this.teams).forEach((teamId) => {
          const team = this.teams[teamId];

          if (team) {
            fragment.appendChild(elementCreator.createListItem({
              elements: [elementCreator.createSpan({ text: `${team.shortName.toUpperCase()}: ${team.points}` })],
            }));
          }
        });

        this.teamStats.innerHTML = '';
        this.teamStats.appendChild(fragment);
      },
    });

    eventCentral.addWatcher({
      event: 'lanternRound',
      func: ({ round, timeLeft }) => {
        if (!round) {
          console.log('no round');

          return;
        }

        if (!round.isActive) {
          this.end();
        } else {
          this.start();
        }

        this.timeLeft = Math.ceil(((new Date(timeLeft)) / 1000) / 60);
        this.updateTime();
      },
    });

    parent.appendChild(this.element);
  }

  startTime() {
    const now = new Date();
    const waitTime = ((60 - now.getSeconds()) * 1000) - now.getMilliseconds();

    setTimeout(() => {
      this.updateTime();
      this.startTime();
    }, waitTime);
  }

  displayTime() {
    const text = this.isActive
      ? 'Active for'
      : 'Next in';
    const timeLeft = this.timeLeft >= 0
      ? textTools.getHoursAndMinutes(this.timeLeft)
      : undefined;
    const timeText = timeLeft
      ? `${text}: ${timeLeft.hours}h${timeLeft.minutes}m`
      : `${text}: UNKNOWN`;

    this.timeSpan.innerHTML = '';
    this.timeSpan.appendChild(document.createTextNode(timeText));
  }

  updateTime() {
    const date = new Date();

    if (date.getSeconds() > 59 || date.getSeconds() === 0) {
      this.timeLeft -= 1;
    }

    this.displayTime();
  }

  start() {
    this.isActive = true;
  }

  end() {
    this.isActive = false;

    eventCentral.emitEvent({
      event: 'lanternTeams',
      params: { teams: Object.keys(this.teams).map(teamId => this.teams[teamId]) },
    });
    eventCentral.emitEvent({
      event: 'lanternStations',
      params: { stations: Object.keys(this.stations).map(stationId => this.stations[stationId]) },
    });
  }
}

module.exports = WreckingStatus;
