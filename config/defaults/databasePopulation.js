'use strict';

const config = {};
let modifiedDatabasePop = {};

try {
  modifiedDatabasePop = require('../modified/databasePopulation').databasePopulation;
} catch (err) {
  console.log('Did not find modified databasePopulation. Using defaults');
}

const generatePass = function generatePass() {
  const randomString = '023456789abcdefghijkmnopqrstuvwxyz';
  const randomLength = randomString.length;
  let code = '';

  for (let i = 0; i < 10; i++) {
    const randomVal = Math.random() * (randomLength - 1);

    code += randomString[Math.round(randomVal)];
  }

  return code;
};

// To avoid undefined if rooms and commands haven't been changed
modifiedDatabasePop.rooms = modifiedDatabasePop.rooms ? modifiedDatabasePop.rooms : {};
modifiedDatabasePop.commands = modifiedDatabasePop.commands ? modifiedDatabasePop.commands : {};

config.accessLevels = {
  god: 13,
  superUser: 12,
  admin: 11,
  privileged: 9,
  advanced: 3,
  basic: 1,
  anonymous: 0,
};

/**
 * Rooms to be created on first run
 * important, broadcast, admin should always be created. The rest are optional
 */
config.rooms = {
  // General chat room, available for every user
  public: modifiedDatabasePop.rooms.public || {
    roomName: 'public',
    visibility: config.accessLevels.basic,
    accessLevel: config.accessLevels.basic,
  },

  /**
   * Used to store messages labeled as important.
   * Not used as an ordinary chat room
   */
  important: modifiedDatabasePop.rooms.important || {
    roomName: 'important',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },

  /**
   * Used to store messages labeled as broadcast.
   * Not used as an ordinary chat room
   */
  broadcast: modifiedDatabasePop.rooms.broadcast || {
    roomName: 'broadcast',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },

  /**
   * Used for morse messages
   * Not used as an ordinary chat room
   */
  morse: {
    roomName: 'morse',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },

  /**
   * Admin related messages will be sent here
   * E.g. when a user needs verification
   */
  admin: modifiedDatabasePop.rooms.admin || {
    roomName: 'hqroom',
    visibility: config.accessLevels.admin,
    accessLevel: config.accessLevels.admin,
  },

  /**
   * Blocking name for users
   * Not used as an ordinary chat room
   */
  team: {
    roomName: 'team',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },
};

/**
 * Users to be created on first run
 * superuser should always be created. The rest are optional
 */
config.users = modifiedDatabasePop.users || {
  // Admin users to be used to create the first rooms and verify first users
  superuser: {
    userName: 'superuser',
    password: generatePass(),
    verified: true,
    accessLevel: config.accessLevels.superUser,
    visibility: config.accessLevels.superUser,
    rooms: [config.rooms.public.roomName],
  },
  // Blocking name for users
  root: {
    userName: 'root',
    password: generatePass(),
    verified: true,
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.superUser,
    rooms: [],
  },
  // Blocking name for users
  admin: {
    userName: 'admin',
    password: generatePass(),
    verified: true,
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.superUser,
    rooms: [],
  },
};

/**
 *
 */
config.commands = {
  help: modifiedDatabasePop.commands.help || {
    commandName: 'help',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  clear: modifiedDatabasePop.commands.clear || {
    commandName: 'clear',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  whoami: modifiedDatabasePop.commands.whoami || {
    commandName: 'whoami',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  msg: modifiedDatabasePop.commands.msg || {
    commandName: 'msg',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'messaging',
  },
  broadcast: modifiedDatabasePop.commands.broadcast || {
    commandName: 'broadcast',
    accessLevel: config.accessLevels.privileged,
    visibility: config.accessLevels.privileged,
    category: 'messaging',
  },
  follow: modifiedDatabasePop.commands.follow || {
    commandName: 'follow',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  unfollow: modifiedDatabasePop.commands.unfollow || {
    commandName: 'unfollow',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  list: modifiedDatabasePop.commands.list || {
    commandName: 'list',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  mode: modifiedDatabasePop.commands.mode || {
    commandName: 'mode',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'extra',
  },
  register: modifiedDatabasePop.commands.register || {
    commandName: 'register',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'login',
  },
  createroom: modifiedDatabasePop.commands.createroom || {
    commandName: 'createroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.god,
    category: 'basic',
  },
  login: modifiedDatabasePop.commands.login || {
    commandName: 'login',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'login',
  },
  time: modifiedDatabasePop.commands.time || {
    commandName: 'time',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  locate: modifiedDatabasePop.commands.locate || {
    commandName: 'locate',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  history: modifiedDatabasePop.commands.history || {
    commandName: 'history',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'messaging',
  },
  morse: modifiedDatabasePop.commands.morse || {
    commandName: 'morse',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'messaging',
  },
  password: modifiedDatabasePop.commands.password || {
    commandName: 'password',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  logout: modifiedDatabasePop.commands.logout || {
    commandName: 'logout',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  reboot: modifiedDatabasePop.commands.reboot || {
    commandName: 'reboot',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  verifyuser: modifiedDatabasePop.commands.verifyuser || {
    commandName: 'verifyuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  banuser: modifiedDatabasePop.commands.banuser || {
    commandName: 'banuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  unbanuser: modifiedDatabasePop.commands.unbanuser || {
    commandName: 'unbanuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  whisper: modifiedDatabasePop.commands.whisper || {
    commandName: 'whisper',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'messaging',
  },
  hackroom: modifiedDatabasePop.commands.hackroom || {
    commandName: 'hackroom',
    accessLevel: config.accessLevels.advanced,
    visibility: config.accessLevels.advanced,
    category: 'basic',
  },
  hacklantern: modifiedDatabasePop.commands.hacklantern || {
    commandName: 'hacklantern',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  importantmsg: modifiedDatabasePop.commands.importantmsg || {
    commandName: 'importantmsg',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'messaging',
  },
  chipper: modifiedDatabasePop.commands.chipper || {
    commandName: 'chipper',
    accessLevel: config.accessLevels.advanced,
    visibility: config.accessLevels.advanced,
    category: 'basic',
    authGroup: 'hackers',
  },
  switchroom: modifiedDatabasePop.commands.switchroom || {
    commandName: 'room',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  removeroom: modifiedDatabasePop.commands.removeroom || {
    commandName: 'removeroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.god,
    category: 'basic',
  },
  updateuser: modifiedDatabasePop.commands.updateuser || {
    commandName: 'updateuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  updatecommand: modifiedDatabasePop.commands.updatecommand || {
    commandName: 'updatecommand',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  weather: modifiedDatabasePop.commands.weather || {
    commandName: 'weather',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  updatedevice: modifiedDatabasePop.commands.updatedevice || {
    commandName: 'updatedevice',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  updateroom: modifiedDatabasePop.commands.updateroom || {
    commandName: 'updateroom',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  inviteteam: modifiedDatabasePop.commands.inviteteam || {
    commandName: 'inviteteam',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.god,
    category: 'admin',
  },
  createteam: modifiedDatabasePop.commands.createteam || {
    commandName: 'createteam',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.god,
    category: 'basic',
  },
  alias: modifiedDatabasePop.commands.alias || {
    commandName: 'alias',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'extra',
  },
  central: modifiedDatabasePop.commands.central || {
    commandName: 'central',
    accessLevel: config.accessLevels.god,
    visibility: config.accessLevels.god,
    category: 'basic',
  },
  jobs: modifiedDatabasePop.commands.jobs || {
    commandName: 'jobs',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  invitations: modifiedDatabasePop.commands.invitations || {
    commandName: 'invitations',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  inviteroom: modifiedDatabasePop.commands.inviteroom || {
    commandName: 'inviteroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.god,
    category: 'basic',
  },
  createmission: modifiedDatabasePop.commands.createmission || {
    commandName: 'createmission',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  verifyteam: modifiedDatabasePop.commands.verifyteam || {
    commandName: 'verifyteam',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  map: modifiedDatabasePop.commands.map || {
    commandName: 'map',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  archives: modifiedDatabasePop.commands.archives || {
    commandName: 'archives',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  leaveteam: modifiedDatabasePop.commands.leaveteam || {
    commandName: 'leaveteam',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  creategameuser: modifiedDatabasePop.commands.creategameuser || {
    commandName: 'creategameuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'basic',
  },
  creategameword: modifiedDatabasePop.commands.creategameword || {
    commandName: 'creategameword',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'basic',
  },
};

module.exports = config;
