'use strict';

const config = {};

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

config.accessLevels = {
  admin: 11,
  superUser: 12,
  anonymous: 0,
  basic: 1,
};

/**
 * Users to be created on first run
 * superuser should always be created. The rest are optional
 */
config.users = {
  // Admin users to be used to create the first rooms and verify first users
  superuser: {
    userName: 'superuser',
    password: generatePass(),
    verified: true,
    accessLevel: config.accessLevels.superUser,
    visibility: config.accessLevels.superUser,
    rooms: ['public'],
  },
};

/**
 * Rooms to be created on first run
 * important, broadcast, admin should always be created. The rest are optional
 */
config.rooms = {
  // General chat room, available for every user
  public: {
    roomName: 'public',
    visibility: config.accessLevels.basic,
    accessLevel: config.accessLevels.basic,
  },

  /**
   * Used to store messages labeled as important.
   * Not used as an ordinary chat room
   */
  important: {
    roomName: 'important',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },

  /**
   * Used to store messages labeled as broadcast.
   * Not used as an ordinary chat room
   */
  broadcast: {
    roomName: 'broadcast',
    visibility: config.accessLevels.superUser,
    accessLevel: config.accessLevels.superUser,
    password: generatePass(),
  },

  /**
   * Admin related messages will be sent here
   * E.g. when a user needs verification
   */
  admin: {
    roomName: 'hqroom',
    visibility: config.accessLevels.admin,
    accessLevel: config.accessLevels.admin,
  },
};

/**
 * Appended to the user name to create a room which is used to store private
 * messages sent to a user (e.g user1-whisper)
 */
config.whisper = '-whisper';

/**
 * Appended to device ID to create a room which is used to store messages
 * sent to a device (e.g fe3Liw19Xz-device)
 */
config.device = '-device';

/**
 *
 */
config.commands = {
  help: {
    commandName: 'help',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  clear: {
    commandName: 'clear',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  whoami: {
    commandName: 'whoami',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  msg: {
    commandName: 'msg',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  broadcast: {
    commandName: 'broadcast',
    accessLevel: 9,
    visibility: 9,
    category: 'advanced',
  },
  follow: {
    commandName: 'follow',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  unfollow: {
    commandName: 'unfollow',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  list: {
    commandName: 'list',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  mode: {
    commandName: 'mode',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  register: {
    commandName: 'register',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'login',
  },
  createroom: {
    commandName: 'createroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  myrooms: {
    commandName: 'myrooms',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  login: {
    commandName: 'login',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'login',
  },
  time: {
    commandName: 'time',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  locate: {
    commandName: 'locate',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  history: {
    commandName: 'history',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  morse: {
    commandName: 'morse',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  password: {
    commandName: 'password',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  logout: {
    commandName: 'logout',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  reboot: {
    commandName: 'reboot',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'login',
  },
  verifyuser: {
    commandName: 'verifyuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  banuser: {
    commandName: 'banuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  unbanuser: {
    commandName: 'unbanuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  whisper: {
    commandName: 'whisper',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  hackroom: {
    commandName: 'hackroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'hacking',
  },
  importantmsg: {
    commandName: 'importantmsg',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  chipper: {
    commandName: 'chipper',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'hacking',
    authGroup: 'hackers',
  },
  switchroom: {
    commandName: 'room',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'advanced',
  },
  removeroom: {
    commandName: 'removeroom',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'admin',
  },
  updateuser: {
    commandName: 'updateuser',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  updatecommand: {
    commandName: 'updatecommand',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  weather: {
    commandName: 'weather',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
  updatedevice: {
    commandName: 'updatedevice',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  updateroom: {
    commandName: 'updateroom',
    accessLevel: config.accessLevels.admin,
    visibility: config.accessLevels.admin,
    category: 'admin',
  },
  inviteteam: {
    commandName: 'inviteteam',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'admin',
  },
  createteam: {
    commandName: 'createteam',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'admin',
  },
  alias: {
    commandName: 'alias',
    accessLevel: config.accessLevels.basic,
    visibility: config.accessLevels.basic,
    category: 'basic',
  },
  jobs: {
    commandName: 'jobs',
    accessLevel: config.accessLevels.anonymous,
    visibility: config.accessLevels.anonymous,
    category: 'basic',
  },
};

config.modes = {
  command: 'cmd',
  chat: 'chat',
};

module.exports = config;
