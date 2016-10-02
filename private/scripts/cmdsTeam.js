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

const labels = require('./labels');
const storage = require('./storage');
const socketHandler = require('./socketHandler');
const commandHandler = require('./commandHandler');
const messenger = require('./messenger');
const domManipulator = require('./domManipulator');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.createteam = {
  func: (phrases) => {
    const commandHelper = commandHandler.commandHelper;
    const data = { team: { teamName: '' } };

    if (phrases.length > 0) {
      data.team.teamName = phrases.join(' ');
      commandHelper.data = data;
      messenger.queueMessage({ text: labels.getText('info', 'cancel') });
      domManipulator.setInputStart('owner');
      socketHandler.emit('teamExists', commandHelper.data);
    } else {
      messenger.queueMessage({
        text: ['You have to enter a name. Example: createteam My Team Name'],
        text_se: ['Ni måste skriva in ett namn. Exempel: createteam Mitt Team'],
      });
      commandHandler.resetCommand(false);
    }
  },
  steps: [
    () => {
      const commandHelper = commandHandler.commandHelper;

      messenger.queueMessage({
        text: [
          'Are you the owner of the team? Leave it empty and press enter, if you are. Enter the name of the user that is the owner, if you are not',
          'You can press tab or double space to see available users',
        ],
        text_se: [
          'Är ni ägaren av teamet? Lämna fältet tomt och tryck på Enter-knappen om ni är det. Skriv annars in användarnamnet som är ägaren om inte ni är det',
          'Ni kan trycka på tab-knappen eller skriva in dubbelblanksteg för att se tillgängliga användare',
        ],
      });
      commandHelper.allowAutoComplete = true;
      commandHelper.onStep += 1;
    },
    (phrases) => {
      const commandHelper = commandHandler.commandHelper;
      const user = storage.getUser();

      if (phrases[0] !== '') {
        commandHelper.data.team.owner = phrases[0];
        commandHelper.data.team.admins = [user];
      } else {
        commandHelper.data.team.owner = user;
      }

      socketHandler.emit('createTeam', commandHelper.data);
      commandHandler.resetCommand(false);
    },
  ],
  accessLevel: 13,
  visibility: 13,
  category: 'basic',
  autocomplete: { type: 'users' },
  commandName: 'createteam',
};

commands.inviteteam = {
  func: (phrases) => {
    const data = { user: { userName: phrases[0] } };

    if (data.user.userName) {
      socketHandler.emit('inviteToTeam', data);
    } else {
      messenger.queueMessage({
        text: ['You have to enter a user name. Example: inviteteam bob'],
        text_se: ['Ni måste skriva in ett användarnamn. Exempel: inviteteam bob'],
      });
    }
  },
  accessLevel: 13,
  category: 'basic',
  commandName: 'inviteteam',
};

module.exports = commands;
