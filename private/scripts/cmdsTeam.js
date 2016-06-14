const labels = require('./labels');
const storage = require('./storage');
const socketHandler = require('./socketHandler');
const commandHandler = require('./commandHandler');
const messenger = require('./messenger');
const domManipulator = require('./domManipulator');

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
      commandHelper.onStep++;
    },
    (phrases) => {
      const commandHelper = commandHandler.commandHelper;

      if (phrases[0] !== '') {
        const owner = phrases[0];

        commandHelper.data.team.owner = owner;
        commandHelper.data.team.admins = [storage.getUser()];
      } else {
        commandHelper.data.team.owner = storage.getUser();
      }

      socketHandler.emit('createTeam', commandHelper.data);
      commandHandler.resetCommand(false);
    },
  ],
  accessLevel: 13,
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
