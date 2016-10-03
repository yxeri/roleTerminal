/*
 Copyright 2015 Aleksandar Jankovic

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

/** @module */

const textTools = require('./textTools');
const socketHandler = require('./socketHandler');
const commandHandler = require('./commandHandler');
const messenger = require('./messenger');
const domManipulator = require('./domManipulator');
const labels = require('./labels');

/**
 * @static
 * @type {Object}
 */
const commands = {};
const statsTimeoutTime = 5000;
let statsTimeout = null;

/**
 * Translates password hints and make them human readable
 * @static
 * @param {string[]} hints - Password hints
 * @return {string[]} Human readable password hints
 */
function humanReadableHints(hints) {
  const modifiedHints = [];

  /**
   * Translates a password hint and makes it human readable
   * @private
   * @param {string} hint - Password hint
   * @return {string[]} Human readable password hint
   */
  function createReadable(hint) {
    const splitHint = hint.split(' ');
    let modifiedHint = hint;

    if (splitHint[0] === 'end') {
      modifiedHint = `Password ends with: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'middle') {
      modifiedHint = `Position ${parseInt(splitHint[1], 10)} in the password is: ${splitHint[2]}. `;
    } else if (splitHint[0] === 'start') {
      modifiedHint = `Password starts with: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'type') {
      modifiedHint = `Password is a word of type: ${splitHint[1]}. `;
    } else if (splitHint[0] === 'length') {
      modifiedHint = `Password length is: ${splitHint[1]}. `;
    }

    return modifiedHint;
  }

  for (let i = 0; i < hints.length; i += 1) {
    modifiedHints.push(createReadable(hints[i]));
  }

  return modifiedHints;
}

/**
 * Emits getStationStats to retrieve gameplay stats and sets a timeout to repeat the emit
 * @static
 */
function getStats() {
  /**
   * @param {Object} params - Parameters
   * @param {Object[]} params.teams - Team names, scores
   * @param {string} params.teams[].short_name - Name of the team
   * @param {Object[]} params.stations - Station IDs, status
   * @param {Object} params.currentRound - Times for current round
   * @param {Object} params.futureRounds - Times for future rounds
   * @param {Date} params.now - Current time
   */
  socketHandler.emit('getStationStats', '', ({ stations, teams, currentRound, futureRounds, now }) => {
    const stationsStats = {};
    const teamsStats = {};

    for (let i = 0; i < stations.length; i += 1) {
      const station = stations[i];
      const stationId = `${station.id || station.stationId}`;
      const stationTeam = teams.find(team => station.owner === team.name);

      if (!stations[stationId]) {
        stationsStats[stationId] = {};
      }

      if (station.owner && stationTeam && stationTeam.short_name) {
        stationsStats[stationId].owner = stationTeam.short_name;
      } else if (stationTeam && !stationTeam.short_name) {
        stationsStats[stationId].owner = '?';
      } else if (station.owner === null) {
        stationsStats[stationId].owner = '-';
      }

      if (station.signalValue || station.boost) {
        stationsStats[stationId].signalValue = station.signalValue || station.boost;
      }

      if (typeof station.active === 'boolean') {
        stationsStats[stationId].active = station.active;
      }
    }

    for (let i = 0; i < teams.length; i += 1) {
      /**
       * @type {{score: number, name: string}}
       */
      const team = teams[i];
      const teamName = team.name;

      if (teamName !== 'ownerless') {
        teamsStats[teamName] = team.score;
      }
    }

    domManipulator.setStationStats(stations, teams, currentRound, futureRounds, now);
  });
  statsTimeout = setTimeout(getStats, statsTimeoutTime);
}

commands.creategameuser = {
  func: () => {
    messenger.queueMessage({
      text: [
        'Input user name + password to create a new game user',
        'Input "list" to list all existing game users',
        'Input "exit" when you are done',
        'Example: user1 banana',
        'Example: list',
        'Example: exit',
      ],
    });
  },
  steps: [(phrases = []) => {
    if (phrases.length > 0) {
      switch (phrases[0]) {
        case 'list': {
          socketHandler.emit('getAllGameUsers');

          break;
        }
        default: {
          if (phrases.length > 1) {
            socketHandler.emit('createGameUser', { userName: phrases[0], password: phrases[1] });
          } else {
            messenger.queueMessage({ text: ['You need to input a name and password. Example: creategameuser user1 banana'] });
          }

          break;
        }
      }
    }
  }],
  visibility: 11,
  accessLevel: 11,
  category: 'admin',
  commandName: 'creategameuser',
};

commands.creategameword = {
  func: () => {
    messenger.queueMessage({
      text: [
        'Input word to create a new game word, which will be used to fill out the hacklantern mini-game',
        'Don\'t use words that are passwords for game users!',
        'Input "list" to list all existing words',
        'Input "exit" when you are done',
        'Example: banana',
        'Example: list',
        'Example: exit',
      ],
    });
  },
  steps: [(phrases = []) => {
    if (phrases.length > 0) {
      switch (phrases[0]) {
        case 'list': {
          socketHandler.emit('getAllGamePasswords');

          break;
        }
        default: {
          socketHandler.emit('createGamePassword', { password: phrases[0] });

          break;
        }
      }
    }
  }],
  visibility: 11,
  accessLevel: 11,
  category: 'admin',
  commandName: 'creategameword',
};

commands.lantern = {
  func: (phrases = []) => {
    switch (phrases[0]) {
      case 'on': {
        getStats();
        domManipulator.toggleStationStats(true);

        break;
      }
      case 'off': {
        domManipulator.toggleStationStats(false);
        clearInterval(statsTimeout);
        statsTimeout = null;

        break;
      }
      default: {
        messenger.queueMessage({ text: ['Incorrect option. Available options are: on, off'] });

        break;
      }
    }
  },
  options: {
    on: { description: 'Show LANTERN status' },
    off: { description: 'Hide LANTERN status' },
  },
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'lantern',
};

commands.hacklantern = {
  func: () => {
    commandHandler.commandHelper.data = {};
    commandHandler.commandHelper.fallbackStep = 4;

    socketHandler.emit('getGameUsersSelection', { userAmount: 1 });
  },
  steps: [
    (params = {}) => {
      const users = params.users;
      const passwords = params.passwords;
      const codeColumns = [];

      for (let i = 0; i < 2; i += 1) {
        codeColumns.push(textTools.createMixedArray({
          amount: 23,
          length: 27,
          upperCase: false,
          codeMode: true,
          requiredStrings: passwords[i],
        }));
      }

      domManipulator.setInputStart('lsm');
      messenger.queueMessage({ text: labels.getText('info', 'hackLanternIntro') });
      messenger.queueMessage({ text: labels.getText('info', 'cancel') });
      messenger.queueMessage({ text: [textTools.createFullLine()] });
      socketHandler.emit('getActiveStations');

      commandHandler.commandHelper.data.codeColumns = codeColumns;
      commandHandler.commandHelper.data.users = users;
    },
    (params = {}) => {
      if (params.stations) {
        const stationList = params.stations.map(station => `[${station.id}] #${station.id} ${station.location} - Owner: ${station.owner || 'None'}`);
        commandHandler.commandHelper.data.stations = params.stations;

        messenger.queueMessage({ text: ['Available LANTERNs:'].concat(stationList) });
      }

      messenger.queueMessage({
        text: ['Input the number of your chosen LANTERN:'],
      });

      commandHandler.commandHelper.onStep += 1;
    },
    (phrases = ['']) => {
      const stationId = parseInt(phrases[0], 10);

      if (isNaN(stationId) || !commandHandler.commandHelper.data.stations.find(station => station.id === stationId)) {
        messenger.queueMessage({ text: ['Incorrect choice'] });

        commandHandler.commandHelper.onStep -= 1;
        commandHandler.triggerCommandStep();
      } else {
        const users = commandHandler.commandHelper.data.users;
        let userList = [];
        commandHandler.commandHelper.onStep += 1;
        commandHandler.commandHelper.data.stationId = stationId;

        for (let i = 0; i < users.length; i += 1) {
          const user = users[i];

          userList.push(textTools.createFullLine());
          userList.push(`User: ${user.userName}`);
          userList.push('Gathered password information:');
          userList = userList.concat(humanReadableHints(user.hints));
        }

        commandHandler.triggerCommand({ cmd: 'clear' });
        messenger.queueMessage({
          text: [
            `Accessing LANTERN ${stationId}...`,
            'Users with authorization to access the LANTERN:',
          ].concat(userList),
        });
        messenger.queueMessage({
          text: [
            textTools.createFullLine(),
            'Press enter to continue. Prepare to receive memory dumps',
          ],
        });
      }
    },
    () => {
      const codeColumns = commandHandler.commandHelper.data.codeColumns;

      commandHandler.triggerCommand({ cmd: 'clear' });
      messenger.queueMessage({
        text: [
          'Dumping and translating memory content...',
          textTools.createFullLine(),
        ],
      });
      messenger.queueMessage({ text: codeColumns.shift() });

      if (codeColumns.length === 0) {
        commandHandler.commandHelper.onStep += 1;
      }
    },
    (params = {}) => {
      commandHandler.commandHelper.onStep += 1;

      if (!params.reset) {
        commandHandler.triggerCommand({ cmd: 'clear' });
        messenger.queueMessage({
          text: [
            'Memory dump done',
            'All traces cleared',
            'Input authorized user:',
          ],
        });
      } else {
        messenger.queueMessage({
          text: ['Input authorized user:'],
        });
      }

      domManipulator.setInputStart('authUsr');
    },
    (phrases = ['']) => {
      if (!phrases) {
        domManipulator.setInputStart('authUsr');
        messenger.queueMessage({
          text: [
            'Incorrect user and/or password',
            'Lockdown will initiate with too many failed attempts',
            'Input authorized user:',
          ],
        });
      } else {
        commandHandler.commandHelper.data.gameUser = { userName: phrases[0].toLowerCase() };
        commandHandler.commandHelper.onStep += 1;

        domManipulator.setInputStart('passwd');
        messenger.queueMessage({ text: ['Input password:'] });
      }
    },
    (phrases = ['']) => {
      commandHandler.commandHelper.data.gameUser.password = phrases[0];
      commandHandler.commandHelper.onStep += 1;

      domManipulator.setInputStart('choice');
      messenger.queueMessage({
        text: [
          'Which command do you want to trigger?',
          'Enter the number of your choice:',
          '[1] Amplify signal',
          '[2] Dampen signal',
        ],
      });
    },
    (phrases = ['']) => {
      const validOptions = ['1', '2'];

      if (!phrases || validOptions.indexOf(phrases[0]) === -1) {
        messenger.queueMessage({
          text: [
            'Incorrect choice',
            'Which command do you want to trigger?',
            'Enter the number of your choice:',
            '[1] Amplify signal',
            '[2] Dampen signal',
          ],
        });
      } else {
        commandHandler.commandHelper.data.choice = phrases[0];
        commandHandler.commandHelper.onStep += 1;

        socketHandler.emit('manipulateStation', commandHandler.commandHelper.data);
      }
    },
  ],
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'hacklantern',
};

module.exports = commands;
