/** @module */

const socketHandler = require('./socketHandler');
const messenger = require('./messenger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.verifyuser = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const userName = phrases[0].toLowerCase();

      if (userName === '*') {
        socketHandler.emit('verifyAllUsers');
      } else {
        const data = { user: { userName } };

        socketHandler.emit('verifyUser', data);
      }
    } else {
      socketHandler.emit('unverifiedUsers');
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'verifyuser',
};

commands.verifyteam = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const teamName = phrases[0].toLowerCase();

      if (teamName === '*') {
        socketHandler.emit('verifyAllTeams');
      } else {
        const data = { team: { teamName } };

        socketHandler.emit('verifyTeam', data);
      }
    } else {
      socketHandler.emit('unverifiedTeams');
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'verifyteam',
};
commands.banuser = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const userName = phrases[0].toLowerCase();
      const data = { user: { userName } };

      socketHandler.emit('ban', data);
    } else {
      socketHandler.emit('bannedUsers');
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'banuser',
};
commands.unbanuser = {
  func: (phrases) => {
    if (phrases.length > 0) {
      const userName = phrases[0].toLowerCase();
      const data = { user: { userName } };

      socketHandler.emit('unban', data);
    } else {
      socketHandler.emit('bannedUsers');
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'unbanuser',
};
commands.updateuser = {
  func: (phrases) => {
    const data = { user: {} };

    if (phrases.length > 2) {
      data.user.userName = phrases[0];
      data.field = phrases[1];
      data.value = phrases[2];

      socketHandler.emit('updateUser', data);
    } else {
      messenger.queueMessage({
        text: [
          'You need to type a user name, field name and value',
          'Example: updateuser user1 accesslevel 3',
        ],
        text_se: [
          'Ni måste skriva in ett användarnamn, fältnamn och värde',
          'Exempel: updateuser user1 accesslevel 3',
        ],
      });
    }
  },
  autocomplete: { type: 'users' },
  accessLevel: 13,
  category: 'admin',
  commandName: 'updateuser',
};
commands.updatecommand = {
  func: (phrases) => {
    const data = {};

    if (phrases.length > 2) {
      data.command = { commandName: phrases[0] };
      data.field = phrases[1];
      data.value = phrases[2];

      socketHandler.emit('updateCommand', data);
    } else {
      messenger.queueMessage({
        text: [
          'You need to type a command name, field name and value',
          'Example: updatecommand help accesslevel 3',
        ],
        text_se: [
          'Ni måste skriva in ett kommandonamn, fältnamn och värde',
          'Exempel: updatecommand help accesslevel 3',
        ],
      });
    }
  },
  accessLevel: 13,
  category: 'admin',
  commandName: 'updatecommand',
};
commands.updateroom = {
  func: (phrases) => {
    const data = { room: {} };

    if (phrases.length > 2) {
      data.room.roomName = phrases[0];
      data.field = phrases[1];
      data.value = phrases[2];

      socketHandler.emit('updateRoom', data);
    } else {
      messenger.queueMessage({
        text: [
          'You need to type a room name, field name and value',
          'Example: updateroom room1 accesslevel 3',
        ],
        text_se: [
          'Ni måste skriva in ett rumsnamn, fältnamn och värde',
          'Exempel: updateroom room1 accesslevel 3',
        ],
      });
    }
  },
  autocomplete: { type: 'rooms' },
  accessLevel: 13,
  category: 'admin',
  commandName: 'updateroom',
};
commands.updatedevice = {
  func: (phrases) => {
    const data = { device: {} };

    if (phrases.length > 2) {
      data.device.deviceId = phrases[0];
      data.field = phrases[1];
      data.value = phrases[2];

      socketHandler.emit('updateDevice', data);
    } else {
      messenger.queueMessage({
        text: [
          'You need to type a device Id, field name and value',
          'Example: updatedevice 11jfej433 id betteralias',
        ],
        text_se: [
          'Ni måste skriva in ett enhets-ID, fältnamn och värde',
          'Exempel: updatedevice 11jfej433 id betteralias',
        ],
      });
    }
  },
  autocomplete: { type: 'devices' },
  accessLevel: 13,
  category: 'admin',
  commandName: 'updatedevice',
};

module.exports = commands;
