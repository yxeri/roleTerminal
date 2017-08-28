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

const elementCreator = require('../../ElementCreator');
const eventCentral = require('../../EventCentral');
const textTools = require('../../TextTools');

class WreckingStatus {
  constructor({ element }) {
    this.element = element;
    this.element.classList.add('clickable');

    this.stations = {};
    this.teams = {};

    this.stationStats = elementCreator.createList({ classes: ['stationStats'] });
    this.teamStats = elementCreator.createList({ classes: ['teamStats'] });

    this.container = elementCreator.createContainer({ classes: ['hide'] });

    this.container.appendChild(this.stationStats);
    this.container.appendChild(this.teamStats);
    this.element.appendChild(this.container);

    this.isActive = false;
    this.timeSpan = elementCreator.createSpan({ text: '----' });
    this.timeLeft = new Date();

    this.startTime();

    this.element.addEventListener('click', (event) => {
      this.container.classList.toggle('hide');

      event.stopPropagation();
    });

    eventCentral.addWatcher({
      watcherParent: this.stationStats,
      event: eventCentral.Events.LANTERNSTATIONS,
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
            const foundTeamId = station.owner ? Object.keys(this.teams).find(teamId => teamId === station.owner.toString()) : undefined;
            const ownerName = foundTeamId ? this.teams[foundTeamId].shortName.toUpperCase() : '-----';
            const classes = ['stationInfo'];
            const elements = [];

            if (station.isUnderAttack && this.isActive) {
              classes.push('warning');
            }

            elements.push(elementCreator.createSpan({ text: `${station.stationName || station.stationId}` }));

            if (!this.isActive) {
              elements.push(elementCreator.createSpan({ text: 'REQUIRES' }));
              elements.push(elementCreator.createSpan({ text: 'MAINTENANCE' }));
            } else if (station.isActive) {
              elements.push(elementCreator.createSpan({ text: `Signal: ${station.signalValue}` }));
              elements.push(elementCreator.createSpan({ text: `Owner: ${ownerName}` }));
            } else {
              elements.push(elementCreator.createSpan({ text: 'NO SIGNAL' }));
              elements.push(elementCreator.createSpan({ text: 'INACTIVE' }));
            }

            const list = elementCreator.createList({
              classes,
              elements,
            });

            fragment.appendChild(list);
          }
        });

        this.stationStats.innerHTML = '';
        this.stationStats.appendChild(fragment);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this.teamStats,
      event: eventCentral.Events.LANTERNTEAMS,
      func: ({ teams }) => {
        if (!teams) {
          console.log('no lantern teams');

          return;
        }

        const fragment = document.createDocumentFragment();

        fragment.appendChild(elementCreator.createListItem({ element: this.timeSpan }));

        teams.forEach((team) => {
          this.teams[team.teamId] = team;
        });

        Object.keys(this.teams).forEach((teamId) => {
          const team = this.teams[teamId];

          if (team) {
            fragment.appendChild(elementCreator.createListItem({ element: elementCreator.createSpan({ text: `${team.shortName.toUpperCase()}: ${team.points}` }) }));
          }
        });

        this.teamStats.innerHTML = '';
        this.teamStats.appendChild(fragment);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this.element,
      event: eventCentral.Events.LANTERNROUND,
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
    const text = this.isActive ? 'Active for' : 'Next in';
    const timeLeft = this.timeLeft >= 0 ? textTools.getHoursAndMinutes(this.timeLeft) : undefined;
    const timeText = timeLeft ? `${text}: ${timeLeft.hours}h${timeLeft.minutes}m` : `${text}: UNKNOWN`;

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
    this.element.classList.add('flash', 'isActive');
  }

  end() {
    this.isActive = false;
    this.element.classList.remove('flash', 'isActive');

    eventCentral.triggerEvent({
      event: eventCentral.Events.LANTERNTEAMS,
      params: { teams: Object.keys(this.teams).map(teamId => this.teams[teamId]) },
    });
    eventCentral.triggerEvent({
      event: eventCentral.Events.LANTERNSTATIONS,
      params: { stations: Object.keys(this.stations).map(stationId => this.stations[stationId]) },
    });
  }
}

module.exports = WreckingStatus;
