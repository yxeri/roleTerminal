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
const socketManager = require('../../SocketManager');

class WreckingStatus {
  constructor({ element }) {
    this.element = element;
    this.element.classList.add('clickable');

    this.stations = [];
    this.teams = [];
    this.timeLeft = 0;

    this.stationStats = elementCreator.createList({});
    this.teamStats = elementCreator.createList({});

    this.element.appendChild(this.stationStats);
    this.element.appendChild(this.teamStats);

    this.isActive = false;

    this.element.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    eventCentral.addWatcher({
      watcherParent: this.stationStats,
      event: eventCentral.Events.LANTERNSTATIONS,
      func: ({ stations }) => {
        stations.forEach((station) => {
          const foundStation = this.stations.find(storedStation => storedStation.stationId === station.stationId);

          if (!foundStation) {
            this.stations.push(station);
          } else if (!station.isActive) {
            const index = this.stations.findIndex(storedStation => storedStation.stationId === station.stationId);

            if (index > -1) {
              this.stations.splice(index, 1);
            }
          }
        });

        console.log(this.stations, stations);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this.teamStats,
      event: eventCentral.Events.LANTERNTEAMS,
      func: ({ teams }) => {
        teams.forEach((team) => {
          const foundTeam = this.teams.find(storedTeam => storedTeam.teamId === team.teamId);

          if (!foundTeam) {
            this.teams.push(team);
          } else if (!team.isActive) {
            const index = this.teams.findIndex(storedTeam => storedTeam.teamId === team.teamId);

            if (index > -1) {
              this.teams.splice(index, 1);
            }
          }
        });

        console.log(this.teams, teams);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this.element,
      event: eventCentral.Events.LANTERNROUND,
      func: ({ round }) => {
        if (this.isActive !== round.isActive) {
          if (!round.isActive) {
            this.end();
          } else {
            this.start();
          }
        }

        socketManager.emitEvent('getLanternInfo', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          this.timeLeft = data.timeLeft;
        });

        console.log(round);
      },
    });
  }

  start() {
    this.isActive = true;
    this.element.classList.remove('hide');
  }

  end() {
    this.isActive = false;
    this.element.classList.add('hide');
  }
}

module.exports = WreckingStatus;
