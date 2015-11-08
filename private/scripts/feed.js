'use strict';

/**
 * const and let support is still kind of shaky on client side, thus the
 * usage of var
 */

var razLogo = {
  text : [
    ' ',
    '   ####',
    '###############',
    ' #####  #########                                           ####',
    '  ####     #######  ########     ###########    ####     ###########',
    '  ####    ######      #######   ####   #####  ########    ####   #####',
    '  ####  ###         ####  ####        ####  ###    ###### ####   #####',
    '  #########        ####    ####     ####   #####     ##############',
    '  #### ######     ####     #####  ####     #######   ###  ########',
    '  ####   ######  ##### #### #### ############  #######    ####   ###',
    ' ######    #############    ################     ###      ####    #####',
    '########     ########         ###                        ######      #####   ##',
    '               ###########        ##                                    ###### ',
    '                    ###############',
    '                         #####   demos - warez - honey',
    ' '
  ],
    extraClass : 'logo'
};
var logo = {
  text : [
    '                          ####',
    '                ####    #########    ####',
    '               ###########################',
    '              #############################',
    '            #######        ##   #  ##########',
    '      ##########           ##    #  ###  ##########',
    '     #########             #########   #   #########',
    '       #####               ##     ########   #####',
    '     #####                 ##     ##     ##########',
    '     ####                  ##      ##     #   ######',
    ' #######                   ##########     ##    ########',
    '########                   ##       ########     ########',
    ' ######      Organica      ##       #      #############',
    '   ####     Oracle         ##       #      ##     ####',
    '   ####     Operations     ##       #      ##    #####',
    '   ####      Center        ##       #      ###########',
    '########                   ##       #########    ########',
    '########                   ##########      #    #########',
    ' ########                  ##      ##     ## ###########',
    '     #####                 ##      ##     ### #####',
    '       #####               ##     ########   #####',
    '      #######              ##########   #  ########',
    '     ###########           ##    ##    # ###########',
    '      #############        ##    #   #############',
    '            ################################',
    '              ############################',
    '              #######  ##########  #######',
    '                ###      ######      ###',
    '                          ####'
  ],
    extraClass : 'logo'
};
// Timeout between print of rows (milliseconds)
var rowTimeout = 40;
/**
 * Number of messages that will be processed and printed
 * per loop in consumeMsgQueue
 */
var msgsPerQueue = 3;
/**
 * Queue of all the message objects that will be handled and printed
 */
var msgQueue = [];
/**
 * Shorter queue of messages that will be processed this loop. Length is
 * based on msgsPerQueue variable
 */
var shortMsgQueue = [];
var cmdQueue = [];
// True if messages are being processed and printed right now
var printing = false;
/**
 * Used to block repeat of some key presses
 */
var keyPressed = false;
/**
 * Used for Android full screen to change CSS layout
 */
var clicked = false;
/**
 * Char that is prepended on commands in chat mode
 */
var commandChars = ['-', '/'];
/**
 * Focus can sometimes trigger twice, which is used to check if a reconnection
 * is needed. This flag will be set to true while it is reconnecting to
 * block the second attempt
 */
var reconnecting = false;
// Interval/timeout times in milliseconds
var printIntervalTime = 200;
var screenOffIntervalTime = 1000;
var watchPositionTime = 15000;
var pausePositionTime = 40000;
/**
 * DOM element init
 * Initiation of DOM elements has to be done here.
 * Android 4.1.* would otherwise give JS errors
 */
var mainFeed = document.getElementById('mainFeed');
var marker = document.getElementById('marker');
var leftText = document.getElementById('leftText');
var rightText = document.getElementById('rightText');
var inputStart = document.getElementById('inputStart');
var modeField = document.getElementById('mode');
var spacer = document.getElementById('spacer');
// Socket.io
var socket = io(); // eslint-disable-line
// Is geolocation tracking on?
var isTracking = true;
var positions = [];
var watchId = null;
// Queue of all the sounds that will be handled and played
var soundQueue = [];
var audioCtx;
var oscillator;
var gainNode;
var soundTimeout = 0;
var previousCommandPointer;
var commandTime = 1000;
var commandUsed = false;
var dot = '.';
var dash = '-';
var morseSeparator = '#';
//TODO Convert to arrays with amounts pointing to either - or .
var morseCodes = {
  'a' : '.-',
  'b' : '-...',
  'c' : '-.-.',
  'd' : '-..',
  'e' : '.',
  'f' : '..-.',
  'g' : '--.',
  'h' : '....',
  'i' : '..',
  'j' : '.---',
  'k' : '-.-',
  'l' : '.-..',
  'm' : '--',
  'n' : '-.',
  'o' : '---',
  'p' : '.--.',
  'q' : '--.-',
  'r' : '.-.',
  's' : '...',
  't' : '-',
  'u' : '..-',
  'v' : '...-',
  'w' : '.--',
  'x' : '-..-',
  'y' : '-.--',
  'z' : '--..',
  '1' : '.----',
  '2' : '..---',
  '3' : '...--',
  '4' : '....-',
  '5' : '.....',
  '6' : '-....',
  '7' : '--...',
  '8' : '---..',
  '9' : '----.',
  '0' : '-----',
  // Symbolizes space betwen words
  '#' : morseSeparator
};
/**
 * Stores everything related to the map area
 * The map area will be separated into grids
 * The size of each grid is dependent of the map size
 * (which is set with coordinates) and max amount of X and Y grids
 */
var mapHelper = {
  leftLong : 15.1857261,
  rightLong : 15.2045467,
  topLat : 59.7609695,
  bottomLat : 59.7465301,
  xGridsMax : 24,
  yGridsMax : 36,
  xSize : 0,
  ySize : 0,
  xGrids : {},
  yGrids : {}
};
var commandFailText = { text : ['command not found'] };
var cmdHelper = {
  maxSteps : 0,
  onStep : 0,
  command : null,
  keyboardBlocked : false,
  data : null,
  hideInput : false
};
/**
 * Used by isScreenOff() to force reconnect when phone screen is off
 * for a longer period of time
 */
var lastScreenOff = (new Date()).getTime();
// Object containing all running intervals
var intervals = {
  tracking : null,
  printText : null,
  isScreenOff : null
};
var validCmds = {
  help : {
    func : function(phrases) {
      var cmdChars = commandChars;

      function capitalizeString(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
      }

      function getCommands(group) {
        var commands = validCmds;
        //TODO Change from Object.keys for compatibility with older Android
        var keys = Object.keys(commands).sort();
        var commandStrings = [];
        var i;
        var command;
        var commandAccessLevel;
        var msg;

        if (group !== undefined) {
          commandStrings.push(capitalizeString(group) + ' commands:');
        }

        for (i = 0; i < keys.length; i++) {
          msg = '  ';
          command = commands[keys[i]];
          commandAccessLevel = command.accessLevel;

          if ((isNaN(commandAccessLevel) || getAccessLevel() >= commandAccessLevel)
              && (group === undefined || command.category === group)) {
            msg += keys[i];

            commandStrings.push(msg);
          }
        }

        return commandStrings;
      }

      function getAll() {
        var loginCmds = getCommands('login');
        var basicCmds = getCommands('basic');
        var advancedCmds = getCommands('advanced');
        var hackingCmds = getCommands('hacking');
        var adminCmds = getCommands('admin');

        if (null === getUser()) {
          queueMessage({
            text : [
              '------------------------------------------------',
              'Use register to register a new user',
              'Use login to log in to an existing user',
              'You have to log in to access most of the system',
              '------------------------------------------------'
            ]
          });
          queueMessage({
            text : loginCmds
          });
        }

        if (1 < basicCmds.length) {
          queueMessage({
            text : basicCmds
          });
        }

        if (1 < advancedCmds.length) {
          queueMessage({
            text : advancedCmds
          });
        }

        if (1 < hackingCmds.length) {
          queueMessage({
            text : hackingCmds
          });
        }

        if (1 < adminCmds.length) {
          queueMessage({
            text : adminCmds
          });
        }
      }

      if (undefined === phrases || 0 === phrases.length) {
        queueMessage({
          text : [
            '--------',
            '  Help',
            '--------',
            'Instructions',
            '  Add -help after a command to get instructions on how to use it. Example: ' + cmdChars[0] +
            'uploadkey -help',
            'Shortcuts',
            '  Use page up/down to scroll the view',
            '  Press arrow up/down to go through your previous used commands',
            '  Pressing tab or space twice will auto-complete any command you have begun writing.',
            '  Example: "he" and a tab / double space will automatically turn into "help"'
          ]
        });
      }

      getAll();
    },
    help : [
      'Shows a list of available commands',
      'The set of commands shown is the basic set',
      'Add "all" to show all commands available to you. Example: ' +
      'help all'
    ],
    instructions : [
      ' Usage:',
      '  help *optional all*',
      ' Example:',
      '  help',
      '  help all'
    ],
    accessLevel : 1,
    category : 'basic'
  },
  clear : {
    func : function() {
      while (1 < mainFeed.childNodes.length) {
        mainFeed.removeChild(mainFeed.lastChild);
      }
    },
    help : ['Clears the terminal view'],
    clearAfterUse : true,
    accessLevel : 13,
    category : 'basic'
  },
  whoami : {
    func : function() {
      queueMessage({
        text : [
          '----------',
          '  Whoami',
          '----------',
          'User name: ' + getUser(),
          'Access level: ' + getAccessLevel(),
          'Device ID: ' + getLocalVal('deviceId')
        ]
      });
    },
    help : ['Shows the current user'],
    accessLevel : 13,
    category : 'basic'
  },
  msg : {
    func : function(phrases) {
      var writtenMsg;

      if (phrases && 0 < phrases.length) {
        writtenMsg = phrases.join(' ');

        socket.emit('chatMsg', {
          message : {
            text : [writtenMsg],
            userName : getUser(),
            roomName : getLocalVal('room')
          }
        });
      } else {
        queueMessage({
          text : ['You forgot to write the message!']
        });
      }
    },
    help : [
      'Sends a message to your current room',
      'The room you are in is written out to the left of the marker'
    ],
    instructions : [
      ' Usage:',
      '  msg *message*',
      ' Example:',
      '  msg Hello!'
    ],
    clearAfterUse : true,
    accessLevel : 13,
    category : 'advanced'
  },
  broadcast : {
    func : function() {
      var data = {};

      data.text = [];
      cmdHelper.data = data;

      queueMessage({
        text : [
          'Who is the broadcast from?',
          'You can also leave it empty and just press enter'
        ]
      });
      queueMessage({
        text : [
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"'
        ]
      });
      setInputStart('broadcast');
    },
    steps : [
      function(phrases) {
        var phrase;

        if (0 < phrases.length && '' !== phrases[0]) {
          phrase = phrases.join(' ');

          cmdHelper.data.text.push('--- BROADCAST FROM: ' + phrase + ' ---');
        } else {
          cmdHelper.data.text.push('--- BROADCAST ---');
        }

        queueMessage({
          text : [
            'Write a line and press enter',
            'Press enter without any input when you are done ' +
            'with the message'
          ]
        });
        cmdHelper.onStep++;
      },
      function(phrases) {
        var phrase;
        var dataText;

        if (0 < phrases.length && '' !== phrases[0]) {
          phrase = phrases.join(' ');

          cmdHelper.data.text.push(phrase);
        } else {
          cmdHelper.data.text.push('--- END BROADCAST ---');
          dataText = null !== cmdHelper.data.text ? JSON.parse(JSON.stringify(cmdHelper.data.text)) : '';

          cmdHelper.onStep++;

          queueMessage({
            text : ['Preview of the message:']
          });
          queueMessage({
            text : dataText
          });
          queueMessage({
            text : ['Is this OK? "yes" to accept the message']
          });
        }
      },
      function(phrases) {
        if (0 < phrases.length && 'yes' === phrases[0].toLowerCase()) {
          socket.emit('broadcastMsg', cmdHelper.data);
          resetCommand();
        } else {
          resetCommand(true);
        }
      }
    ],
    help : [
      'Sends a message to all users in all rooms',
      'It will prepend the message with "[ALL]"'
    ],
    instructions : [
      'Follow the on-screen instructions'
    ],
    accessLevel : 13,
    clearAfterUse : true,
    category : 'admin'
  },
  follow : {
    func : function(phrases) {
      var room = {};

      if (0 < phrases.length) {
        room.roomName = phrases[0].toLowerCase();
        room.password = phrases[1];

        socket.emit('follow', room);
      } else {
        queueMessage({
          text : [
            'You have to specify which room to follow and a' +
            'password (if it is protected)'
          ]
        });
      }
    },
    help : [
      'Follows a room and shows you all messages posted in it.',
      'You will get the messages from this room even if it isn\'t' +
      'your currently selected one'
    ],
    instructions : [
      ' Usage:',
      '  follow *room name* *optional password*',
      ' Example:',
      '  follow room1 banana'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  unfollow : {
    func : function(phrases) {
      var room = {};
      var roomName;

      if (0 < phrases.length) {
        roomName = phrases[0].toLowerCase();

        if (roomName === getLocalVal('room')) {
          room.exited = true;
        }

        room.roomName = roomName;

        socket.emit('unfollow', room);
      } else {
        queueMessage({
          text : ['You have to specify which room to unfollow']
        });
      }
    },
    help : ['Stops following a room.'],
    instructions : [
      ' Usage:',
      '  unfollow *room name*',
      ' Example:',
      '  unfollow roomname'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  list : {
    func : function(phrases) {
      var listOption;

      if (0 < phrases.length) {
        listOption = phrases[0].toLowerCase();

        if ('rooms' === listOption) {
          socket.emit('listRooms');
        } else if ('users' === listOption) {
          socket.emit('listUsers');
        } else if ('devices' === listOption) {
          socket.emit('listDevices');
        } else {
          queueMessage({
            text : [listOption + 'is not a valid option']
          });
        }
      } else {
        queueMessage({
          text : [
            'You have to input which option you want to list',
            'Available options: users, rooms, devices',
            'Example: list rooms'
          ]
        });
      }
    },
    help : [
      'Shows a list of users, rooms or devices which you are allowed to see',
      'You have to input which option you want to list'
    ],
    instructions : [
      ' Usage:',
      '  list *option*',
      ' Example',
      '  list rooms',
      '  list users',
      '  list devices'
    ],
    accessLevel : 13,
    category : 'basic'
  },
  mode : {
    func : function(phrases, verbose) {
      var newMode;
      var cmdChars = commandChars;

      if (0 < phrases.length) {
        newMode = phrases[0].toLowerCase();

        //TODO Refactoring. Lots of duplicate code
        if ('chat' === newMode) {
          setMode(newMode);

          if (verbose === undefined || verbose) {
            queueMessage({
              text : [
                '-----------------------',
                '  Chat mode activated',
                '-----------------------',
                'Prepend commands with "' + cmdChars.join('" or "') +
                '", e.g. ' + '"' + cmdChars[0] +
                'uploadkey"',
                'Everything else written and sent ' +
                'will be intepreted' +
                'as a chat message'
              ]
            });
          }

          socket.emit('updateMode', newMode);
        } else if ('cmd' === newMode) {
          setMode(newMode);

          if (verbose === undefined || verbose) {
            queueMessage({
              text : [
                '--------------------------',
                '  Command mode activated',
                '--------------------------',
                'Commands can be used without "' +
                cmdChars[0] + '"',
                'You have to use command "msg" ' +
                'to send messages'
              ]
            });
          }

          socket.emit('updateMode', newMode);
        } else {
          queueMessage({
            text : [newMode + 'is not a valid mode']
          });
        }
      } else {
        queueMessage({
          text : [
            'Current mode: ' + getMode()
          ]
        });
      }
    },
    help : [
      'Change the input mode. The options are chat or cmd',
      '--Chat mode--',
      'Everything written will be interpreted as chat messages',
      'All commands have to be prepended with "' +
      commandChars.join('" or "') + '" ' +
      'Example: ' + commandChars[0] + 'uploadkey',
      '--Cmd mode--',
      'Chat mode is the default mode',
      'Text written will not be automatically be intepreted as ' +
      'chat messages',
      'You have to use "msg" command to write messages ' +
      'Example: msg hello',
      'Commands do not have to be prepended with anything. ' +
      'Example: uploadkey'
    ],
    instructions : [
      ' Usage:',
      '  mode *mode*',
      ' Example:',
      '  mode chat',
      '  mode cmd'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  register : {
    func : function(phrases) {
      var data = {};
      var userName;

      if (null === getLocalVal('user')) {
        userName = phrases ? phrases[0] : undefined;

        if (userName && 3 <= userName.length && 6 >= userName.length && isTextAllowed(userName)) {
          data.userName = userName;
          data.registerDevice = getLocalVal('deviceId');
          cmdHelper.data = data;
          cmdHelper.hideInput = true;
          hideInput(true);
          socket.emit('userExists', cmdHelper.data);
        } else {
          resetCommand(true);
          queueMessage({
            text : [
              'Name has to be 3 to 6 characters long',
              'The name can only contain letters and numbers (a-z, 0-9)',
              'Don\'t use whitespace in your name!',
              'e.g. register myname'
            ]
          });
        }
      } else {
        resetCommand(true);
        queueMessage({
          text : [
            'You have already registered a user',
            getLocalVal('user') + ' is registered to this device'
          ]
        });
      }
    },
    steps : [
      function() {
        queueMessage({
          text : [
            'Input a password and press enter',
            'Your password won\'t appear on the screen as you type it',
            'Don\'t use whitespaces in your password!',
            'You can cancel out of the command by typing "exit" or "abort"'
          ]
        });
        setInputStart('password');
        cmdHelper.onStep++;
      },
      function(phrases) {
        var password = phrases ? phrases[0] : undefined;

        if (phrases && 3 <= password.length && isTextAllowed(password)) {
          cmdHelper.data.password = password;
          queueMessage({
            text : [
              'Repeat your password one more time'
            ]
          });
          cmdHelper.onStep++;
        } else {
          queueMessage({
            text : [
              'Password is too short!',
              'It has to be at least 3 characters (a-z, 0-9. Password can mix upper/lowercase)',
              'Please, input a password and press enter'
            ]
          });
        }
      },
      function(phrases) {
        var password = phrases ? phrases[0] : undefined;

        if (password === cmdHelper.data.password) {
          queueMessage({
            text : [
              'Congratulations, employee #' + Math.floor(Math.random() * 120503),
              'Welcome to the Organica Oracle department',
              'You may now login to the system',
              'Have a productive day!'
            ]
          });
          socket.emit('register', cmdHelper.data);
          validCmds[cmdHelper.command].abortFunc();
          resetCommand(false);
        } else {
          queueMessage({
            text : [
              'Passwords don\'t match. Please try again',
              'Input a password and press enter'
            ]
          });
          cmdHelper.onStep--;
        }
      }
    ],
    abortFunc : function() {
      hideInput(false);
    },
    help : [
      'Registers your user name on the server and connects it ' +
      'to your device',
      'This user name will be your identity in the system',
      'The name can only contain letters and numbers (a-z, 0-9)',
      'Don\'t use whitespaces in your name or password!'
    ],
    instructions : [
      ' Usage:',
      '  register *user name*',
      ' Example:',
      '  register myname'
    ],
    accessLevel : 0,
    category : 'login'
  },
  createroom : {
    func : function(phrases) {
      var roomName;
      var password;
      var room = {};
      var errorMsg = {
        text : [
          'Failed to create room.',
          'Room name has to be 1 to 6 characters long',
          'The room name and password can only contain letters and numbers ' +
          '(a-z, 0-9. Password can mix upper and lowercase)',
          'e.g. createroom myroom'
        ]
      };

      if (0 < phrases.length) {
        roomName = phrases[0].toLowerCase();
        password = phrases[1];

        if (0 < roomName.length && 6 >= roomName.length && isTextAllowed(roomName) && isTextAllowed(password)) {
          room.roomName = roomName;
          room.password = password;
          room.owner = getUser();

          socket.emit('createRoom', room);
        } else {
          queueMessage(errorMsg);
        }
      } else {
        queueMessage(errorMsg);
      }
    },
    help : [
      'Creates a chat room',
      'The rooms name has to be 1 to 6 characters long',
      'The password is optional, but if set it has to be 4 to 10 ' +
      'characters',
      'The name can only contain letters and numbers (a-z, 0-9)'
    ],
    instructions : [
      ' Usage:',
      '  createroom *room name* *optional password*',
      ' Example:',
      '  createroom myroom banana'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  myrooms : {
    func : function() {
      var data = {};

      data.userName = getUser();
      data.device = getLocalVal('deviceId');

      socket.emit('myRooms', data);
    },
    help : ['Shows a list of all rooms you are following'],
    accessLevel : 13,
    category : 'advanced'
  },
  login : {
    func : function(phrases) {
      var data = {};

      if (null !== getUser()) {
        queueMessage({
          text : [
            'You are already logged in',
            'You have to be logged out to log in'
          ]
        });
      } else if (0 < phrases.length) {
        data.userName = phrases[0].toLowerCase();
        cmdHelper.data = data;
        cmdHelper.hideInput = true;
        queueMessage({
          text : [
            'Input your password'
          ]
        });
        setInputStart('password');
        hideInput(true);
      } else {
        queueMessage({
          text : [
            'You need to input a user name',
            'Example: login bestname '
          ]
        });
      }
    },
    steps : [
      function(phrases) {
        cmdHelper.data.password = phrases[0].toLowerCase();
        socket.emit('login', cmdHelper.data);
        validCmds[cmdHelper.command].abortFunc();
        validCmds.clear.func();
        resetCommand();
      }
    ],
    abortFunc : function() {
      hideInput(false);
    },
    help : [
      'Logs in as a user on this device',
      'You have to be logged out to login as another user'
    ],
    instructions : [
      ' Usage:',
      '  login *user name*',
      ' Example:',
      '  login user11'
    ],
    clearAfterUse : true,
    accessLevel : 0,
    category : 'login'
  },
  time : {
    func : function() {
      socket.emit('time');
    },
    help : ['Shows the current time'],
    accessLevel : 13,
    category : 'basic'
  },
  locate : {
    func : function(phrases) {
      var userName;

      if (!isTracking) {
        queueMessage({
          text : [
            'Tracking not available',
            'You are not connected to the satellites'
          ]
        });
      } else if (0 < phrases.length) {
        userName = phrases[0].toLowerCase();

        socket.emit('locate', userName);
      } else {
        socket.emit('locate', getUser());
      }
    },
    help : [
      'Shows the last known location of the user',
      '* is a shortcut for all users. Example: locate *',
      'Just writing the command without a user name will show your ' +
      'current location. Example: locate',
      'You need to be connected to the satellites to access this command'
    ],
    instructions : [
      ' Usage:',
      '  locate *optional user name OR "*"*',
      ' Example:',
      '  locate user1',
      '  locate *',
      '  locate'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  uploadkey : {
    func : function() {
      var razLogoToPrint = null !== razLogo ? JSON.parse(JSON.stringify(razLogo)) : { text : ['']};

      // TODO: razLogo should be move to DB or other place
      queueMessage(razLogoToPrint);
      queueMessage({
        text : [
          'Razor proudly presents:',
          'Entity Hacking Access! (EHA)',
          'AAAB3NzaC1yc2EAAAADAQABAAABAQDHS//2a/B',
          'D6Rsc8OO/6wFUVDdpdAItvSCLCrc/dcJE/ybEV',
          'w3OtlVFnfNkOVAvhObuWO/6wFUVDdkr2YTaDEt',
          'i5mxEFD1zslvhObuWr6QKLvfZVczAxPFKLvfZV',
          'dK2zXrxGOmOFllxiCbpGOmOFlcJyiCbp0mA4ca',
          'MFvEEiKXrxGlxiCbp0miONA3EscgY/yujOMJHa',
          'Q1uy6yEZOmOFl/yujOMJHa881DVwWl6lsjHvSi',
          'wDDVwWl6el88/x1j5C+k/atg1lcvcz7Tdtve4q',
          'VTVz0HIhxv595Xqw2qrv6GrdX/FrhObuWr6QKL',
          ' ',
          'Please wait.......',
          'Command interception.........ACTIVATED',
          'Oracle defense systems........DISABLED',
          'Overriding locks..................DONE',
          'Connecting to entity database.....DONE',
          ' ',
          'You can cancel out of the command by typing "exit" or "abort"'
        ]
      });
      setInputStart('Enter encryption key');
      socket.emit('entities');
    },
    steps : [
      function(phrases) {
        var cmdObj = cmdHelper;
        var phrase = phrases.join(' ');

        socket.emit('verifyKey', phrase.toLowerCase());
        queueMessage({
          text : [
            'Verifying key. Please wait...'
          ]
        });
        cmdObj.keyboardBlocked = true;
        setInputStart('Verifying...');
      },
      function(data) {
        var cmdObj = cmdHelper;

        if (null !== data.keyData) {
          if (data.keyData.reusable || !data.keyData.used) {
            queueMessage({
              text : ['Key has been verified. Proceeding']
            });
            cmdObj.onStep++;
            cmdObj.data = data;
            validCmds[cmdObj.command].steps[cmdObj.onStep](socket);
          } else {
            queueMessage({
              text : ['Key has already been used. Aborting']
            });
            resetCommand(true);
          }
        } else {
          queueMessage({
            text : ['The key is invalid. Aborting']
          });
          resetCommand(true);
        }
      },
      function() {
        var cmdObj = cmdHelper;

        setInputStart('Enter entity name');
        cmdObj.keyboardBlocked = false;
        cmdObj.onStep++;
      },
      function(phrases) {
        var cmdObj = cmdHelper;
        var data = cmdObj.data;
        var phrase = phrases.join(' ');

        data.entityName = phrase.toLowerCase();
        data.userName = getUser();
        socket.emit('unlockEntity', data);
        queueMessage({
          text : [
            'Unlocking entity. Please wait...'
          ]
        });
        cmdObj.keyboardBlocked = true;
      },
      function(entity) {
        if (null !== entity) {
          queueMessage({
            text : [
              'Confirmed. Encryption key has been used on the entity',
              entity.entityName + ' now has ' + (entity.keys.length + 1) + ' unlocks',
              'Thank you for using EHA'
            ]
          });
        } else {
          queueMessage({
            text : [
              'Failed',
              'Encryption key could not be used on entity.',
              'Aborting'
            ]
          });
        }

        resetCommand(true);
      }
    ],
    help : [
      'ERROR. UNAUTHORIZED COMMAND...AUTHORIZATION OVERRIDDEN. PRINTING INSTRUCTIONS',
      'Allows you to input an encryption key and use it to unlock an entity',
      'You can cancel out of the command by typing "exit" or "abort"'
    ],
    instructions : [
      'Follow the on-screen instructions'
    ],
    clearBeforeUse : true,
    accessLevel : 13,
    category : 'basic'
  },
  history : {
    func : function(phrases) {
      var data = {};

      data.lines = phrases[0];
      data.device = getLocalVal('deviceId');

      socket.emit('history', data);
    },
    help : [
      'Clears the screen and retrieves chat messages from server',
      'The amount you send with the command is the amount of messages that will be returned from each room you follow'
    ],
    instructions : [
      ' Usage:',
      '  history *optional number*',
      ' Example:',
      '  history',
      '  history 25'
    ],
    clearAfterUse : true,
    clearBeforeUse : true,
    accessLevel : 1,
    category : 'advanced'
  },
  morse : {
    func : function(phrases, local) {
      var filteredText;
      var morseCodeText = '';
      var i;
      var j;
      var morseCode;

      if (phrases && 0 < phrases.length) {
        filteredText = phrases.join(' ').toLowerCase();

        filteredText = filteredText.replace(/[åä]/g, 'a');
        filteredText = filteredText.replace(/[ö]/g, 'o');
        filteredText = filteredText.replace(/\s/g, '#');
        filteredText = filteredText.replace(/[^a-z0-9#]/g, '');

        for (i = 0; i < filteredText.length; i++) {
          morseCode = morseCodes[filteredText.charAt(i)];

          for (j = 0; j < morseCode.length; j++) {
            morseCodeText += morseCode[j] + ' ';
          }

          morseCodeText += '   ';
        }

        if (0 < morseCodeText.length) {
          socket.emit('morse', {
            morseCode : morseCodeText,
            local : local
          });
        }
      }
    },
    help : [
      'Sends a morse encoded message (sound) to everyone in the room'
    ],
    instructions : [
      ' Usage:',
      '  morse *message*',
      ' Example:',
      '  morse sos'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  password : {
    func : function(phrases) {
      var data = {};

      if (phrases && 1 < phrases.length) {
        data.oldPassword = phrases[0];
        data.newPassword = phrases[1];
        data.userName = getUser();

        if (4 <= data.newPassword.length) {
          socket.emit('changePassword', data);
        } else {
          queueMessage({
            text : [
              'You have to input the old and new password of ' +
              'the user',
              'Example: password old1 new1'
            ]
          });
        }
      } else {
        queueMessage({
          text : [
            'You have to input the old and new password of the ' +
            'user',
            'Example: password old1 new1'
          ]
        });
      }
    },
    help : [
      'Allows you to change the user password',
      'Password has to be 4 to 10 characters',
      'Don\'t use whitespace in your name or password!'
    ],
    instructions : [
      ' Usage:',
      '  password *oldpassword* *newpassword*',
      ' Example:',
      '  password old1 new1'
    ],
    accessLevel : 13,
    category : 'basic'
  },
  logout : {
    func : function() {
      socket.emit('logout');
    },
    help : ['Logs out from the current user'],
    accessLevel : 13,
    category : 'basic',
    clearAfterUse : true
  },
  reboot : {
    func : function() {
      refreshApp();
    },
    help : ['Reboots terminal'],
    accessLevel : 1,
    category : 'basic'
  },
  verifyuser : {
    func : function(phrases) {
      var userName;

      if (0 < phrases.length) {
        userName = phrases[0].toLowerCase();

        if ('*' === userName) {
          socket.emit('verifyAllUsers');
        } else {
          socket.emit('verifyUser', userName);
        }
      } else {
        socket.emit('unverifiedUsers');
      }
    },
    help : [
      'Verifies a user and allows it to connect to the system',
      'verifyuser without any additional input will show a list of ' +
      'all unverified users',
      'Use "*" to verify everyone in the list'
    ],
    instructions : [
      ' Usage:',
      '  verifyuser',
      '  verifyuser *username*',
      '  verifyuser *',
      ' Example:',
      '  verifyuser',
      '  verifyuser appl1',
      '  verifyuser *'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  banuser : {
    func : function(phrases) {
      var userName;

      if (0 < phrases.length) {
        userName = phrases[0].toLowerCase();

        socket.emit('ban', userName);
      } else {
        socket.emit('bannedUsers');
      }
    },
    help : [
      'Bans a user and disconnects it from the system',
      'The user will not be able to log on again'
    ],
    instructions : [
      ' Usage:',
      '  banuser *username*',
      ' Example:',
      '  banuser evil1'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  unbanuser : {
    func : function(phrases) {
      var userName;

      if (0 < phrases.length) {
        userName = phrases[0].toLowerCase();

        socket.emit('unban', userName);
      } else {
        socket.emit('bannedUsers');
      }
    },
    help : [
      'Removes ban on user',
      'The user will be able to log on again',
      'ubanuser without any additional input will show a list of all ' +
      'banned users'
    ],
    instructions : [
      ' Usage:',
      '  unbanuser',
      '  unbanuser *username*',
      ' Example:',
      '  unbanuser',
      '  unbanuser evil1'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  whisper : {
    func : function(phrases) {
      var data = {};

      if (1 < phrases.length) {
        data.message = {};
        data.message.roomName = phrases[0].toLowerCase();
        data.message.text = [phrases.slice(1).join(' ')];
        data.message.userName = getUser();
        data.message.whisper = true;

        socket.emit('chatMsg', data);
      } else {
        queueMessage({
          text : ['You forgot to write the message!']
        });
      }
    },
    help : [
      'Send a private message to a specific user',
      'The first word that you write will be interpreted as a user name',
      'The rest of the input will be sent to only that user'
    ],
    instructions : [
      ' Usage:',
      '  whisper *user name* *message*',
      ' Example:',
      '  whisper adam hello, adam!',
      '  whisper user1 sounds good!'
    ],
    clearAfterUse : true,
    accessLevel : 13,
    category : 'basic'
  },
  hackroom : {
    func : function(phrases) {
      var data = {};
      var razLogoToPrint = null !== razLogo ? JSON.parse(JSON.stringify(razLogo)) : { text : ['']};
      var i;

      if (0 < phrases.length) {
        data.roomName = phrases[0].toLowerCase();
        data.timesCracked = 0;
        data.timesRequired = 3;
        data.randomizer = function(length) {
          var randomString = '23456789abcdefghijkmnpqrstuvwxyz';
          var randomLength = randomString.length;
          var code = '';
          var randomVal;

          for (i = 0; i < length; i++) {
            randomVal = Math.random() * (randomLength - 1);

            code += randomString[Math.round(randomVal)];
          }

          return code.toUpperCase();
        };
        cmdHelper.data = data;

        // TODO: razLogo should be moved to DB or other place
        queueMessage(razLogoToPrint);
        // TODO: Message about abort should be sent from a common
        // function for all commands
        queueMessage({
          text : [
            'Razor proudly presents:',
            'Room Access Hacking! (RAH)',
            '/8iybEVaC1yc2EAAAADAQABAAABAQDS//2ag4/',
            'D6Rsc8OO/6wFUVDdpdAItvSCLCrc/dcE/8iybE',
            'w3OtlVFnfNkOVAvhObuWO/6wFUVDdkr2yYTaDE',
            'i5mB3Nz1aC1yc2buWr6QKLvfZVczAxAHPKLvfZ',
            'dK2zXrxGOmOFllxiCbpGOmOFlcJy1/iCbpmA4c',
            'MFvEEiKXrxGlxiCbp0miONAAvhObuWO/6ujMJH',
            'JHa88/x1DVOFl/yujOMJHa88/x1DVwWl6lsjvS',
            'wDDVwWl6el88/x1j5C+k/aadtg1lcvcz7Tdtve',
            'k/aadtghxv595Xqw2qrvyp6GrdX/FrhObuWr6Q',
            ' ',
            'Please wait.......',
            'Command interception.........ACTIVATED',
            'Oracle defense systems.......DISABLED',
            'Overriding locks.............DONE',
            'Connecting to database ......DONE',
            ' ',
            'You can cancel out of the command by typing ' +
            '"exit" or "abort"',
            'Press enter to continue'
          ]
        });

        setInputStart('Start');
      } else {
        queueMessage({
          text : ['You forgot to input the room name!']
        });
        resetCommand(true);
      }
    },
    steps : [
      function() {
        queueMessage({
          text : ['Checking room access...']
        });
        socket.emit('roomHackable', cmdHelper.data.roomName);
      },
      function() {
        var cmdObj = cmdHelper;
        var timeout = 18000;
        var timerEnded = function() {
          queueMessage({
            text : [
              'Your hacking attempt has been detected',
              'Users of the room have been notified of your intrusion'
            ]
          });
          socket.emit('chatMsg', {
            message : {
              text : [
                'WARNING! Intrustion attempt detected!',
                'User ' + getUser() + ' tried breaking in'
              ],
              user : 'SYSTEM'
            },
            roomName : cmdObj.data.roomName,
            skipSelfMsg : true
          });
          resetCommand(true);
        };

        queueMessage({
          text : [
            'Activating cracking bot....',
            'Warning. Intrusion defense system activated',
            'Time until detection: ' + (timeout / 1000) + ' seconds',
            'You will need 3 successful sequences to succeed'
          ]
        });
        setInputStart('Verify seq');
        cmdObj.data.code = cmdObj.data.randomizer(10);
        cmdObj.data.timer = setTimeout(timerEnded, timeout);
        cmdObj.onStep++;
        queueMessage({
          text : ['Sequence: ' + cmdObj.data.code]
        });
      },
      function(phrases) {
        var cmdObj = cmdHelper;
        var phrase = phrases.join(' ').trim();
        var data;

        if (phrase.toUpperCase() === cmdObj.data.code) {
          queueMessage({ text : ['Sequence accepted'] });
          cmdObj.data.timesCracked++;
        } else {
          queueMessage({
            text : [
              'Incorrect sequence. Counter measures have been ' +
              'released'
            ]
          });
        }

        if (cmdObj.data.timesCracked < cmdObj.data.timesRequired) {
          cmdObj.data.code = cmdObj.data.randomizer(10);
          queueMessage({
            text : ['Sequence: ' + cmdObj.data.code]
          });
        } else {
          data = {
            userName : getUser(),
            roomName : cmdObj.data.roomName
          };

          clearTimeout(cmdObj.data.timer);
          socket.emit('hackRoom', data);
          queueMessage(({
            text : [
              'Cracking complete',
              'Intrusion defense system disabled',
              'Suppressing notification and following room',
              'Thank you for using RAH'
            ]
          }));
          resetCommand();
        }
      }
    ],
    abortFunc : function() {
      clearTimeout(cmdHelper.data.timer);
    },
    help : [
      'ERROR. UNAUTHORIZED COMMAND...AUTHORIZATION OVERRIDDEN. ' +
      'PRINTING INSTRUCTIONS',
      'This command lets you follow a room without knowing the password',
      'It will also supress the following notification',
      'Failing the hack will warn everyone in the room'
    ],
    instructions : [
      ' Usage:',
      '  hackroom *room name*',
      ' Example:',
      '  hackroom secret'
    ],
    clearBeforeUse : true,
    accessLevel : 13,
    category : 'hacking'
  },
  importantmsg : {
    func : function() {
      var data = {};

      data.text = [];
      cmdHelper.data = data;

      queueMessage({
        text : [
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"'
        ]
      });
      queueMessage({
        text : [
          'Do you want to send it to a specific device?',
          'Enter the device ID or alias to send it to a specific device',
          'Leave it empty and press enter if you want to send it to ' +
          'all users'
        ]
      });
      setInputStart('imprtntMsg');
    },
    steps : [
      function(phrases) {
        var device;

        if (0 < phrases.length) {
          device = phrases[0];

          if (0 < device.length) {
            cmdHelper.data.device = device;
            queueMessage({
              text : ['Searching for device...']
            });
            socket.emit('verifyDevice', cmdHelper.data);
          } else {
            cmdHelper.onStep++;
            validCmds[cmdHelper.command].steps[cmdHelper.onStep]();
          }
        }
      },
      function() {
        cmdHelper.onStep++;
        queueMessage({
          text : [
            'Write a line and press enter',
            'Press enter without any input when you are done ' +
            'with the message',
            'Try to keep the first line short if you want to send it as morse'
          ]
        });
      },
      function(phrases) {
        var phrase;
        var dataText;

        if (0 < phrases.length && '' !== phrases[0]) {
          phrase = phrases.join(' ');

          cmdHelper.data.text.push(phrase);
        } else {
          dataText = null !== cmdHelper.data.text ? JSON.parse(JSON.stringify(cmdHelper.data.text)) : '';

          cmdHelper.onStep++;

          queueMessage({
            text : ['Preview of the message:']
          });
          queueMessage({
            text : dataText,
            extraClass : 'importantMsg'
          });
          queueMessage({
            text : ['Is this OK? "yes" to accept the message']
          });
        }
      },
      function(phrases) {
        if (0 < phrases.length) {
          if ('yes' === phrases[0].toLowerCase()) {
            cmdHelper.onStep++;

            queueMessage({
              text : [
                'Do you want to send it as morse code too? ' +
                '"yes" to send it as morse too',
                'Note! Only the first line will be sent as morse'
              ]
            });
          } else {
            resetCommand(true);
          }
        }
      },
      function(phrases) {
        if (0 < phrases.length) {
          if ('yes' === phrases[0].toLowerCase()) {
            cmdHelper.data.morse = { local : true };
          }

          socket.emit('importantMsg', cmdHelper.data);
          resetCommand();
        }
      }
    ],
    help : [
      'Send an important message to a single device or all users'
    ],
    instructions : [
      'Follow the on-screen instructions',
      'Note! Only the first line can be sent as morse code (optional)'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  chipper : {
    func : function() {
      var data = {};

      data.randomizer = function(length) {
        var randomString = '01';
        var randomLength = randomString.length;
        var code = '';
        var i;
        var randomVal;

        for (i = 0; i < length; i++) {
          randomVal = Math.random() * (randomLength - 1);

          code += randomString[Math.round(randomVal)];
        }

        return code;
      };
      cmdHelper.data = data;

      queueMessage({
        text : [
          '--------------',
          '- DEACTIVATE -',
          '--------------'
        ],
        extraClass : 'importantMsg large'
      });
      queueMessage({
        text : [
          'CONTROL WORD SENT',
          'AWAITING CONFIRMATION'
        ],
        extraClass : 'importantMsg'
      });
      queueMessage({
        text : [
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"',
          'Press enter to continue'
        ]
      });
      setInputStart('Chipper');
    },
    steps : [
      function() {
        var cmdObj = cmdHelper;

        cmdObj.onStep++;
        queueMessage({
          text : [
            'Chipper has been activated',
            'Connecting to ECU.........'
          ]
        });
        setTimeout(
          validCmds[cmdObj.command].steps[cmdObj.onStep], 2000);
      },
      function() {
        var cmdObj = cmdHelper;
        var stopFunc = function() {
          queueMessage({
            text : [
              'WARNING',
              'CONTROL IS BEING RELEASED',
              'CHIPPER POWERING DOWN'
            ],
            extraClass : 'importantMsg'
          });

          validCmds[cmdObj.command].abortFunc();
        };

        if (cmdObj.data.timer === undefined) {
          cmdObj.data.timer = setTimeout(stopFunc, 300000, false);
        }

        queueMessage({
          text : [
            cmdObj.data.randomizer(36)
          ]
        });

        cmdObj.data.printTimer = setTimeout(validCmds[cmdObj.command].steps[cmdObj.onStep], 250);
      }
    ],
    abortFunc : function() {
      var cmdObj = cmdHelper;

      clearTimeout(cmdObj.data.printTimer);
      clearTimeout(cmdObj.data.timer);
      validCmds.clear.func();
      queueMessage({
        text : [
          'Chipper has powered down',
          'Control has been released'
        ]
      });
      resetCommand();
    },
    help : [
      'Activate chipper function',
      'Press enter when you have retrieved confirmation from the ECU'
    ],
    instructions : [
      'Follow the instructions on the screen',
      'The chipper will shutdown and release control after 5 minutes'
    ],
    accessLevel : 13,
    category : 'hacking',
    clearBeforeUse : true
  },
  room : {
    func : function(phrases) {
      var room = {};
      var roomName;

      if (0 < phrases.length) {
        roomName = phrases[0].toLowerCase();

        if (roomName) {
          room.roomName = roomName;

          /**
           * Flag that will be used in .on function locally to
           * show user they have entered
           */
          room.entered = true;

          socket.emit('switchRoom', room);
        }
      } else {
        queueMessage({
          text : ['You have to specify which room to switch to']
        });
      }
    },
    help : [
      'Switches your current room to another',
      'You have to already be following the room to switch to it'
    ],
    instructions : [
      ' Usage:',
      '  room *room you are following*',
      ' Example:',
      '  room room1'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  removeroom : {
    func : function(phrases) {
      var data = {};

      if (0 < phrases.length) {
        data.roomName = phrases[0].toLowerCase();
        cmdHelper.data = data;

        queueMessage({
          text : [
            'Do you really want to remove the room?',
            'Confirm by writing "yes"'
          ]
        });

        setInputStart('removeroom');
      } else {
        resetCommand(true);

        queueMessage({
          text : ['You forgot to input the room name']
        });
      }
    },
    steps : [
      function(phrases) {
        if ('yes' === phrases[0].toLowerCase()) {
          socket.emit('removeRoom', cmdHelper.data.roomName);
        }

        resetCommand();
      }
    ],
    help : [
      'Removes a room',
      'You have to be either the owner or an admin of the room to remove it'
    ],
    instructions : [
      ' Usage:',
      '  removeroom *room name*',
      '  *Follow the instructions*',
      ' Example:',
      '  removeroom room1',
      '  *Follow the instructions*'
    ],
    accessLevel : 13,
    category : 'advanced'
  },
  updateuser : {
    func : function(phrases) {
      var data = {};

      if (2 < phrases.length) {
        data.user = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateUser', data);
      } else {
        queueMessage({
          text : [
            'You need to write a user name, field name and value',
            'Example: updateuser user1 accesslevel 3'
          ]
        });
      }
    },
    help : [
      'Change fields on a user',
      'You can change visibility, accesslevel, password or add/remove a group',
      'Valid fields: visibility, accesslevel, addgroup, removegroup, password'
    ],
    instructions : [
      ' Usage:',
      '  updateuser *user name* *field name* *value*',
      ' Example:',
      '  updateuser user1 accesslevel 3',
      '  updateuser user1 group hackers'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  updatecommand : {
    func : function(phrases) {
      var data = {};

      if (2 < phrases.length) {
        data.cmdName = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateCommand', data);
      } else {
        queueMessage({
          text : [
            'You need to write a command name, field name and value',
            'Example: updatecommand help accesslevel 3'
          ]
        });
      }
    },
    help : [
      'Change fields on a command',
      'You can currently change visibility or accesslevel'
    ],
    instructions : [
      ' Usage:',
      '  updatecommand *command name* *field name* *value*',
      ' Example:',
      '  updatecommand help accesslevel 3',
      '  updatecommand help visibility 6'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  updateroom : {
    func : function(phrases) {
      var data = {};

      if (2 < phrases.length) {
        data.room = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateRoom', data);
      } else {
        queueMessage({
          text : [
            'You need to write a room name, field name and value',
            'Example: updateroom room1 accesslevel 3'
          ]
        });
      }
    },
    help : [
      'Change fields on a room',
      'You can change visibility, accesslevel',
      'Valid fields: visibility, accesslevel'
    ],
    instructions : [
      ' Usage:',
      '  updateroom *room name* *field name* *value*',
      ' Example:',
      '  updateroom user1 accesslevel 3'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  addencryptionkeys : {
    func : function() {
      var data = {};

      data.keys = [];
      cmdHelper.data = data;

      queueMessage({
        text : [
          '-----------------------',
          '  Add encryption keys',
          '-----------------------',
          'You can add more than one key',
          'Press enter without any input when you are done',
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"',
          'Input an encryption key:'
        ]
      });
      setInputStart('Input key');
    },
    steps : [
      function(phrases) {
        var keyObj = {};

        if (0 < phrases.length && '' !== phrases[0]) {
          keyObj.key = phrases[0];

          //TODO Remove hard coded reusable
          if (phrases[1] && 'reusable' === phrases[1].toLowerCase()) {
            keyObj.reusable = true;
          }

          cmdHelper.data.keys.push(keyObj);
        } else {
          queueMessage({
            text : [
              'Are you sure you want to add the keys?',
              'Write "yes" to accept'
            ]
          });
          cmdHelper.onStep++;
        }
      },
      function(phrases) {
        if ('yes' === phrases[0].toLowerCase()) {
          queueMessage({
            text : ['Uploading new keys...']
          });
          socket.emit('addKeys', cmdHelper.data.keys);
          resetCommand();
        } else {
          queueMessage({
            text : ['The keys will not be uploaded']
          });
          resetCommand(true);
        }
      }
    ],
    help : [
      'Add one or more encryption keys to the database'
    ],
    instructions : [
      ' Usage:',
      '  Follow the instructions'
    ],
    accessLevel : 13,
    category : 'admin',
    clearBeforeUse : true
  },
  addentities : {
    func : function() {
      var data = {};

      data.entities = [];
      cmdHelper.data = data;

      queueMessage({
        text : [
          '-----------------------',
          '  Add entities',
          '-----------------------',
          'You can add more than one entity',
          'Press enter without any input when you are done',
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"',
          'Input an entity:'
        ]
      });
      setInputStart('Input entity');
    },
    steps : [
      function(phrases) {
        var entityObj = {};

        if (0 < phrases.length && '' !== phrases[0]) {
          entityObj.entityName = phrases[0];

          cmdHelper.data.entities.push(entityObj);
        } else {
          queueMessage({
            text : [
              'Are you sure you want to add the entities?',
              'Write "yes" to accept'
            ]
          });
          cmdHelper.onStep++;
        }
      },
      function(phrases) {
        if ('yes' === phrases[0].toLowerCase()) {
          queueMessage({
            text : ['Uploading new entities...']
          });
          socket.emit('addEntities', cmdHelper.data.entities);
          resetCommand();
        } else {
          queueMessage({
            text : ['The entities will not be uploaded']
          });
          resetCommand(true);
        }
      }
    ],
    help : [
      'Add one or more entities to the database'
    ],
    instructions : [
      ' Usage:',
      '  Follow the instructions'
    ],
    accessLevel : 13,
    category : 'admin',
    clearBeforeUse : true
  },
  weather : {
    func : function() {
      socket.emit('weather');
    },
    accessLevel : 1,
    category : 'basic'
  },
  updatedevice : {
    func : function(phrases) {
      var data = {};

      if (2 < phrases.length) {
        data.deviceId = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateDevice', data);
      } else {
        queueMessage({
          text : [
            'You need to write a device Id, field name and value',
            'Example: updatedevice 11jfej433 id betteralias'
          ]
        });
      }
    },
    help : [
      'Change fields on a device',
      'You can currently change the alias',
      'Valid fields: alias'
    ],
    instructions : [
      ' Usage:',
      '  updatedevice *device ID* *field name* *value*',
      ' Example:',
      '  updatedevice 32r23rj alias betteralias'
    ],
    accessLevel : 13,
    category : 'admin'
  },
  moduleraid : {
    func : function() {
      var data = {};

      data.text = [];
      cmdHelper.data = data;

      queueMessage({
        text : [
          'Write a coordinate and press enter',
          'Press enter without any input when you are done ' +
          'with the message'
        ]
      });
      queueMessage({
        text : [
          'You can cancel out of the command by typing ' +
          '"exit" or "abort"'
        ]
      });
      setInputStart('moduleraid');
    },
    steps : [
      function(phrases) {
        var startText = [
          'Celestial activity detected!',
          'Satellite have visual confirmation of active modules',
          'Sending Organica retrieval squads to the following coordinates:'
        ];
        var phrase;
        var text = [];

        if (0 < phrases.length && '' !== phrases[0]) {
          phrase = phrases.join(' ');

          cmdHelper.data.text.push(phrase);
        } else {
          cmdHelper.data.text = text.concat(startText, cmdHelper.data.text);
          text = null !== cmdHelper.data.text ? JSON.parse(JSON.stringify(cmdHelper.data.text)) : [];

          cmdHelper.onStep++;

          queueMessage({
            text : ['Preview of the message:']
          });
          queueMessage({
            text : text,
            extraClass : 'importantMsg'
          });
          queueMessage({
            text : ['Is this OK? "yes" to accept the message']
          });
        }
      },
      function(phrases) {
        if (0 < phrases.length && 'yes' === phrases[0].toLowerCase()) {
          cmdHelper.data.morse = { local : true };
          socket.emit('importantMsg', cmdHelper.data);
          resetCommand();
        } else {
          resetCommand(true);
        }
      }
    ],
    help : [
      'Send a module raid message to all users',
      'It will look like an important message'
    ],
    instructions : [
      'Follow the on-screen instructions'
    ],
    accessLevel : 13,
    clearAfterUse : true,
    category : 'admin'
  },
  createteam : {
    func : function(phrases) {
      var teamName = phrases[0];
      var data = {};
      var team = {};

      if (teamName) {
        team.teamName = teamName;
        team.owner = getUser();
        data.team = team;

        socket.emit('createTeam', data);
      } else {
        queueMessage({
          text : ['You have to enter a name']
        });
      }
    },
    help : [],
    instructions : [

    ],
    accessLevel : 13,
    category : 'basic'
  },
  inviteteam : {
    func : function(phrases) {
      var data = {};
      var userName = phrases[0];

      if (userName) {
        data.userName = userName;
        socket.emit('inviteToTeam', data);
      } else {
        queueMessage({
          text : [
            'You are not allowed to invite members to the team or you are not in a team'
          ]
        });
      }
    },
    help : [],
    instructions : [

    ],
    accessLevel : 13,
    category : 'basic'
  }
};

function findOneAndReplace(text, find, replaceWith) {
  return text.replace(new RegExp(find), replaceWith);
}

function hideInput(hide) {
  var hideString = ' hide';

  if (hide) {
    leftText.className += hideString;
  } else {
    leftText.className = findOneAndReplace(leftText.className, hideString, '');
  }
}

function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

function getLocalVal(name) {
  return localStorage.getItem(name);
}

function removeLocalVal(name) {
  localStorage.removeItem(name);
}

function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

function queueMessage(message) {
  msgQueue.push(message);
}

function resetAllLocalVals() {
  removeLocalVal('cmdHistory');
  removeLocalVal('room');
  removeLocalVal('user');
  setAccessLevel(0);

  previousCommandPointer = 0;
  setInputStart('RAZCMD');
}

function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'));
}

function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
}

function getUser() {
  return getLocalVal('user');
}

function setUser(user) {
  setLocalVal('user', user);
}

function getTeam() {
  return getLocalVal('team');
}

function setTeam(team) {
  setLocalVal('team', team);
}

function setModeText(text) {
  modeField.textContent = '[' + text + ']';
}

function clearModeText() {
  modeField.textContent = '';
}

function getModeText() {
  return modeField.textContent; // String
}
function setMode(mode) {
  setLocalVal('mode', mode);
}

function getMode() {
  return getLocalVal('mode');
}

// TODO: Change name to setInputStartText or similar
function setInputStart(text) {
  inputStart.textContent = text;
}

function resetCommand(aborted) {
  var room = getLocalVal('room') ? getLocalVal('room') : 'RAZCMD';

  if (aborted) {
    queueMessage({
      text : ['Aborting command']
    });
  }

  cmdHelper.command = null;
  cmdHelper.onStep = 0;
  cmdHelper.maxSteps = 0;
  cmdHelper.keyboardBlocked = false;
  cmdHelper.data = null;
  cmdHelper.hideInput = false;
  setInputStart(room);
}

function refreshApp() {
  window.location.reload();
}

function queueCommand(command, data, cmdMsg) {
  cmdQueue.push({
    command : command,
    data : data,
    cmdMsg : cmdMsg
  });
}

function getCmdHistory() {
  var cmdHistory = getLocalVal('cmdHistory');

  return null !== cmdHistory ? JSON.parse(getLocalVal('cmdHistory')) : [];
}

function pushCmdHistory(cmd) {
  var cmdHistory = getCmdHistory();

  cmdHistory.push(cmd);
  setLocalVal('cmdHistory', JSON.stringify(cmdHistory));
}

function resetPrevCmdPointer() {
  var cmdHistory = getCmdHistory();

  previousCommandPointer = cmdHistory ? cmdHistory.length : 0;
}

// Needed for Android 2.1. trim() is not supported
function trimSpace(sentText) {
  return findOneAndReplace(sentText, /^\s+|\s+$/, '');
}

function setGain(value) {
  gainNode.gain.value = value;
}

function playMorse(morseCode) {
  var i;
  var duration;
  var shouldPlay;

  function finishSoundQueue(timeouts) {
    var cleanMorse = morseCode.replace(/#/g, '');

    soundQueue.splice(0, timeouts);
    queueMessage({
      text : ['Morse code message received:  ' + cleanMorse]
    });
  }

  if (0 === soundQueue.length) {
    soundTimeout = 0;
  }

  for (i = 0; i < morseCode.length; i++) {
    shouldPlay = false;
    duration = 0;

    //TODO Hard coded
    if (dot === morseCode[i]) {
      duration = 50;
      shouldPlay = true;
    } else if (dash === morseCode[i]) {
      duration = 150;
      shouldPlay = true;
    } else if (morseSeparator === morseCode[i]) {
      duration = 50;
    } else {
      duration = 75;
    }

    if (shouldPlay) {
      soundQueue.push(setTimeout(setGain, soundTimeout, 1));
      soundQueue.push(setTimeout(setGain, soundTimeout + duration, 0));
    }

    soundTimeout += duration;
  }

  setTimeout(finishSoundQueue, soundTimeout, (2 * morseCode.length),
    morseCode);
}

/*
 * Taken from http://stackoverflow.com/questions/639695/
 * how-to-convert-latitude-or-longitude-to-meters/11172685#11172685
 * generally used geo measurement function
 * @param {number} lat1 - Latitude for first coordinate
 * @param {number} lon1 - Longitude for first coordinate
 * @param {number} lat2 - Latitude for second coordinate
 * @param {number} lon2 - Longitude for second coordinate
 * @returns {number} Returns distances in meters between the coordinates
 */
//function measureDistance(lat1, lon1, lat2, lon2) {
//
//  // Radius of earth in KM
//  var R = 6378.137;
//  var dLat = (lat2 - lat1) * Math.PI / 180;
//  var dLon = (lon2 - lon1) * Math.PI / 180;
//  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//          Math.sin(dLon / 2) * Math.sin(dLon / 2);
//  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//  var d = R * c;
//  return d * 1000; // meters
//}

function generateMap() {
  var letter = 'A';
  var xGrid;
  var yGrid;
  var currentChar;

  mapHelper.xSize = (mapHelper.rightLong - mapHelper.leftLong) / parseFloat(mapHelper.xGridsMax);
  mapHelper.ySize = (mapHelper.topLat - mapHelper.bottomLat) / parseFloat(mapHelper.yGridsMax);

  for (xGrid = 0; xGrid < mapHelper.xGridsMax; xGrid++) {
    currentChar = String.fromCharCode(letter.charCodeAt(0) + xGrid);
    mapHelper.xGrids[currentChar] = mapHelper.leftLong + parseFloat(mapHelper.xSize * xGrid);
  }

  for (yGrid = 0; yGrid < mapHelper.yGridsMax; yGrid++) {
    mapHelper.yGrids[yGrid] = mapHelper.topLat - parseFloat(mapHelper.ySize * yGrid);
  }
}

function locateOnMap(latitude, longitude) {
  //TODO Change from Object.keys for compatibility with older Android
  var xKeys = Object.keys(mapHelper.xGrids);
  var yKeys = Object.keys(mapHelper.yGrids);
  var x;
  var y;
  var xGrid;
  var nextXGrid;
  var yGrid;
  var nextYGrid;

  if (longitude >= mapHelper.leftLong && longitude <= mapHelper.rightLong
      && latitude <= mapHelper.topLat && latitude >= mapHelper.bottomLat) {

    for (xGrid = 0; xGrid < xKeys.length; xGrid++) {
      nextXGrid = mapHelper.xGrids[xKeys[xGrid + 1]];

      if (longitude < nextXGrid) {
        x = xKeys[xGrid];
        break;
      } else if (longitude === (nextXGrid + parseFloat(mapHelper.xSize))) {
        x = xKeys[xGrid + 1];
        break;
      }
    }

    for (yGrid = 0; yGrid < yKeys.length; yGrid++) {
      nextYGrid = mapHelper.yGrids[yKeys[yGrid + 1]];

      if (latitude > nextYGrid) {
        y = yKeys[yGrid];
        break;
      } else if (latitude === (nextYGrid - parseFloat(mapHelper.ySize))) {
        y = yKeys[yGrid + 1];
        break;
      }
    }
  }

  if (x !== undefined && y !== undefined) {
    return x + '' + y;
  }

  return '---';
}

/**
 * Geolocation object is empty when sent through Socket.IO
 * This is a fix for that
 * @param {object} position . -
 * @returns {object} Returns position
 */
function preparePositionData(position) {
  var preparedPosition = {};

  preparedPosition.latitude = position.coords.latitude;
  preparedPosition.longitude = position.coords.longitude;
  preparedPosition.speed = position.coords.speed;
  preparedPosition.accuracy = position.coords.accuracy;
  preparedPosition.heading = position.coords.heading;
  preparedPosition.timestamp = position.timestamp;

  return preparedPosition; // geolocation
}

function sendLocationData() {
  var mostAccuratePos;
  var i;
  var position;
  var accuracy;

  function retrievePosition() {
    var clearingWatch = function() {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      intervals.tracking = setTimeout(sendLocationData, pausePositionTime);
    };

    watchId = navigator.geolocation.watchPosition(function() {
      if (position !== undefined) {
        positions.push(position);
      }
    }, function(err) {
      if (err.code === err.PERMISSION_DENIED) {
        isTracking = false;
        clearTimeout(intervals.tracking);
        queueMessage({
          text : [
            'Unable to connect to the tracking satellites',
            'Turning off tracking is a major offense',
            'Organica Re-Education Squads have been ' +
            'sent to scour the area'
          ], extraClass : 'importantMsg'
        });
      }
    }, { enableHighAccuracy : true });

    if (isTracking) {
      intervals.tracking = setTimeout(clearingWatch, watchPositionTime);
    }
  }

  if (null !== getUser() && 0 < positions.length) {
    mostAccuratePos = positions[positions.length - 1];

    for (i = positions.length - 2; 0 <= i; i--) {
      position = positions[i];
      accuracy = positions[i].coords.accuracy;

      if (mostAccuratePos.coords.accuracy > accuracy) {
        mostAccuratePos = position;
      }
    }

    positions = [];
    socket.emit('updateLocation', preparePositionData(mostAccuratePos));
  }

  retrievePosition();
}

/**
 * Some devices disable Javascript when screen is off (iOS)
 * They also fail to notice that they have been disconnected
 * We check the time between heartbeats and if the time i
 * over 10 seconds (e.g. when screen is turned off and then on)
 * we force them to reconnect
 * @returns {undefined} Returns nothing
 */
function isScreenOff() {
  var now = (new Date()).getTime();
  var diff = now - lastScreenOff;
  //TODO Hard coded
  var offBy = diff - 1000;

  lastScreenOff = now;

  //TODO Hard coded
  if (10000 < offBy) {
    onReconnect();
  }
}

/**
 * Set intervals at boot and recreate them when the window is focused
 * This is to make sure that nothing has been killed in the background
 * @returns {undefined} Returns nothing
 */
function setIntervals() {
  if (null !== intervals.printText) {
    clearInterval(intervals.printText);
  }

  if (null !== intervals.tracking) {
    clearTimeout(intervals.tracking);
  }

  if (null !== watchId) {
    navigator.geolocation.clearWatch(watchId);
  }

  // Prints messages from the queue
  intervals.printText = setInterval(consumeMsgQueue, printIntervalTime, msgQueue);

  if (isTracking) {
    // Gets new geolocation data
    sendLocationData();
  }

  // Should not be recreated on focus
  if (null === intervals.isScreenOff) {

    /**
     * Checks time between when JS stopped and started working again
     * This will be most frequently triggered when a user turns off the
     * screen on their phone and turns it back on
     */
    intervals.isScreenOff = setInterval(isScreenOff, screenOffIntervalTime);
  }
}

function startAudio() {
  // Not supported in Spartan nor IE11 or lower
  if (window.AudioContext || window.webkitAudioContext) {
    if (window.AudioContext) {
      audioCtx = new window.AudioContext();
    } else if (window.webkitAudioContext) {
      audioCtx = new window.webkitAudioContext();
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 0;
    oscillator.type = 'sine';
    oscillator.frequency.value = '440';
    // oscillator.type = 'square';
    // oscillator.frequency.value = '300';

    oscillator.start(0);
  }
}

function getLeftText() {
  return marker.parentElement.childNodes[0].textContent;
}

function getRightText() {
  return marker.parentElement.childNodes[2].textContent;
}

function getInputText() {
  return leftText.textContent + marker.value + rightText.textContent;
}

function setLeftText(text) {
  marker.parentElement.childNodes[0].textContent = text;
}

function appendToLeftText(text) {
  var textNode = document.createTextNode(text);

  document.createTextNode(marker.parentElement.childNodes[0].appendChild(textNode));
}

function setRightText(text) {
  marker.parentElement.childNodes[2].textContent = text;
}

function prependToRightText(sentText) {
  marker.parentElement.childNodes[2].textContent = sentText + marker.parentElement.childNodes[2].textContent;
}

function setMarkerText(text) {
  marker.value = text;
}

function getInputStart() {
  return inputStart.textContent;
}

function clearInput() {
  setLeftText('');
  setRightText('');
  // Fix for blinking marker
  setMarkerText(' ');
}

function triggerAutoComplete(text) {
  if (' ' === text.charAt(text.length - 1) && ' ' === text.charAt(text.length - 2)) {
    setLeftText(trimSpace(text));

    return true;
  }

  return false;
}

function setCommandUsed(used) {
  commandUsed = used;
}

function consumeCmdQueue() {
  var storedCmd;
  var command;
  var data;
  var cmdMsg;

  if (0 < cmdQueue.length) {
    storedCmd = cmdQueue.shift();
    command = storedCmd.command;
    data = storedCmd.data;
    cmdMsg = storedCmd.cmdMsg;

    if (cmdMsg !== undefined) {
      queueMessage(cmdMsg);
    }

    setCommandUsed(true);
    command(data);
    setTimeout(consumeCmdQueue, commandTime);
  } else {
    setCommandUsed(false);
  }
}

function startCmdQueue() {
  if (!commandUsed) {
    consumeCmdQueue();
  }
}

function autoComplete() {
  var phrases = trimSpace(getInputText().toLowerCase()).split(' ');
  var partialCommand = phrases[0];
  //TODO Change from Object.keys for compatibility with older Android
  var commands = Object.keys(validCmds);
  var matched = [];
  var sign = partialCommand.charAt(0);
  var cmdChars = commandChars;
  var i;
  var j;
  var matches;
  var commandAccessLevel;
  var newText = '';
  var cmdIndex;
  var msg = '';
  var cmdMatched;

  /**
   * Auto-complete should only trigger when one phrase is in the input
   * It will not auto-complete flags
   * If chat mode and the command is prepended or normal mode
   */
  if (1 === phrases.length && 0 < partialCommand.length
      && (0 <= cmdChars.indexOf(sign) || ('cmd' === getLocalVal('mode')) || null === getUser())) {
    // Removes prepend sign
    if (0 <= cmdChars.indexOf(sign)) {
      partialCommand = partialCommand.slice(1);
    }

    for (i = 0; i < commands.length; i++) {
      matches = false;

      for (j = 0; j < partialCommand.length; j++) {
        commandAccessLevel = validCmds[commands[i]].accessLevel;

        if ((isNaN(commandAccessLevel) || getAccessLevel() >= commandAccessLevel)
            && partialCommand.charAt(j) === commands[i].charAt(j)) {
          matches = true;
        } else {
          matches = false;

          break;
        }
      }

      if (matches) {
        matched.push(commands[i]);
      }
    }

    if (1 === matched.length) {
      cmdIndex = cmdChars.indexOf(sign);

      if (0 <= cmdIndex) {
        newText += cmdChars[cmdIndex];
      }

      newText += matched[0] + ' ';

      clearInput();
      setLeftText(newText);
    } else if (0 < matched.length) {
      matched.sort();

      for (cmdMatched = 0; cmdMatched < matched.length; cmdMatched++) {
        msg += matched[cmdMatched] + '\t';
      }

      queueMessage({ text : [msg] });
    }

    // No input? Show all available commands
  } else if (0 === partialCommand.length) {
    validCmds.help.func();
  }
}

function printHelpMsg(command) {
  var helpMsg = { text : [] };

  if (command.help) {
    helpMsg.text = helpMsg.text.concat(command.help);
  }

  if (command.instructions) {
    helpMsg.text = helpMsg.text.concat(command.instructions);
  }

  if (0 < helpMsg.text.length) {
    queueMessage(helpMsg);
  }
}

function printUsedCmd(clearAfterUse, inputText) {
  var cmdUsedMsg;

  /**
   * Print input if the command shouldn't clear
   * after use
   */
  if (!clearAfterUse) {
    cmdUsedMsg = {
      text : [
        getInputStart() + getModeText() + '$ ' + inputText
      ]
    };
  }

  return cmdUsedMsg;
}

// Needed for arrow and delete keys. They are not detected with keypress
function specialKeyPress(event) {
  var keyCode = 'number' === typeof event.which ? event.which : event.keyCode;
  var cmdHistory;
  var cmdObj = cmdHelper;
  var commands = validCmds;
  var inputText;
  var phrases;
  var command = null;
  var commandName;
  var user = getUser();
  var sign;

  if (!keyPressed) {
    switch (keyCode) {
      // Backspace
      case 8:
        // Remove character to the left of the marker
        if (getLeftText()) {
          setLeftText(getLeftText().slice(0, -1));
        }

        if (1 === getInputText().length) {
          clearModeText();
        } else {
          changeModeText();
        }

        event.preventDefault();

        break;

      // Tab
      case 9:
        keyPressed = true;

        if (!cmdHelper.keyboardBlocked && null === cmdHelper.command) {
          autoComplete();
        }

        changeModeText();

        event.preventDefault();

        break;
      // Enter
      case 13:
        keyPressed = true;

        if (!cmdObj.keyboardBlocked) {
          if (null !== cmdObj.command) {
            inputText = getInputText();
            phrases = trimSpace(inputText).split(' ');

            //TODO Hard coded
            if ('exit' === phrases[0] || 'abort' === phrases[0]) {
              if (commands[cmdObj.command].abortFunc) {
                commands[cmdObj.command].abortFunc();
              }

              resetCommand(true);
            } else {
              if (!cmdHelper.hideInput) {
                queueMessage({
                  text : [inputText]
                });
              }

              commands[cmdObj.command].steps[cmdObj.onStep](phrases, socket);
            }
          } else {
            inputText = getInputText();
            phrases = trimSpace(inputText).split(' ');

            if (0 < phrases[0].length) {
              sign = phrases[0].charAt(0);

              if (0 <= commandChars.indexOf(sign)) {
                commandName = phrases[0].slice(1).toLowerCase();
                command = commands[commandName];
              } else if ('cmd' === getLocalVal('mode') || null === user) {
                commandName = phrases[0].toLowerCase();
                command = commands[commandName];
              }

              if (command && (isNaN(command.accessLevel) || getAccessLevel() >= command.accessLevel)) {
                // Store the command for usage with up/down arrows
                pushCmdHistory(phrases.join(' '));

                /**
                 * Print the help and instruction parts of the command
                 */
                if ('-help' === phrases[1]) {
                  printHelpMsg(command);
                } else {
                  if (command.steps) {
                    cmdObj.command = commandName;
                    cmdObj.maxSteps = command.steps.length;
                  }

                  if (command.clearBeforeUse) {
                    validCmds.clear.func();
                  }

                  queueCommand(command.func, phrases.splice(1), printUsedCmd(command.clearAfterUse, inputText));
                  startCmdQueue();
                }
              /**
               * User is logged in and in chat mode
               */
              } else if (null !== user && 'chat' === getLocalVal('mode') && 0 < phrases[0].length) {
                if (0 > commandChars.indexOf(phrases[0].charAt(0))) {
                  queueCommand(commands.msg.func, phrases);
                  startCmdQueue();

                /**
                 * User input commandChar but didn't write
                 * a proper command
                 */
                } else {
                  queueMessage({
                    text : [phrases[0] + ': ' + commandFailText.text]
                  });
                }
              } else if (null === user) {
                queueMessage({ text : [phrases.toString()] });
                queueMessage({
                  text : [
                    'You must register a new user or login with an existing user to gain access to more commands',
                    'Use command register or login',
                    'e.g. register myname 1135',
                    'or login myname 1135'
                  ]
                });

                /**
                 * Sent command was not found.
                 * Print the failed input
                 */
              } else if (0 < commandName.length) {
                queueMessage({
                  text : ['- ' + phrases[0] + ': ' + commandFailText.text]
                });
              }
            }
          }
        }

        resetPrevCmdPointer();
        clearInput();
        clearModeText();

        event.preventDefault();

        break;
      // Delete
      case 46:
        // Remove character from marker and move it right
        if (getRightText()) {
          setMarkerText(getRightText()[0]);
          setRightText(getRightText().slice(1));
        } else {
          setMarkerText(' ');
        }

        if (0 === getInputText().length) {
          clearModeText();
        } else {
          changeModeText();
        }

        event.preventDefault();

        break;
      // Page up
      case 33:
        window.scrollBy(0, -window.innerHeight);

        event.preventDefault();

        break;
      //Page down
      case 34:
        window.scrollBy(0, window.innerHeight);

        event.preventDefault();

        break;
      // Left arrow
      case 37:

        // Moves the marker one step to the left
        if (getLeftText()) {
          prependToRightText(marker.value);
          setMarkerText(getLeftText().slice(-1));
          setLeftText(getLeftText().slice(0, -1));
        }

        event.preventDefault();

        break;
      // Right arrow
      case 39:

        // Moves marker one step to the right
        if (getRightText()) {
          appendToLeftText(marker.value);
          setMarkerText(getRightText()[0]);
          setRightText(getRightText().slice(1));
        }

        event.preventDefault();

        break;
      // Up arrow
      case 38:
        cmdHistory = getCmdHistory();

        keyPressed = true;

        if (!cmdHelper.keyboardBlocked && null === cmdHelper.command) {
          if (0 < previousCommandPointer) {
            clearInput();
            previousCommandPointer--;
            appendToLeftText(cmdHistory[previousCommandPointer]);
          }
        }

        event.preventDefault();

        break;
      // Down arrow
      case 40:
        cmdHistory = getCmdHistory();

        keyPressed = true;

        if (!cmdHelper.keyboardBlocked && null === cmdHelper.command) {
          if (previousCommandPointer < cmdHistory.length - 1) {
            clearInput();
            previousCommandPointer++;
            appendToLeftText(cmdHistory[previousCommandPointer]);
          } else if (previousCommandPointer === cmdHistory.length - 1) {
            clearInput();
            previousCommandPointer++;
          } else {
            clearInput();
          }
        }

        event.preventDefault();

        break;
      default:
        break;
    }
  } else {
    event.preventDefault();
  }
}

function keyPress(event) {
  var keyCode = 'number' === typeof event.which ? event.which : event.keyCode;
  var textChar = String.fromCharCode(keyCode);

  if (!keyPressed) {
    switch (keyCode) {
      default:
        if (textChar) {
          appendToLeftText(textChar);
          changeModeText();
        }

        if (triggerAutoComplete(getLeftText()) && null === cmdHelper.command) {
          autoComplete();
        }

        break;
    }
  }

  event.preventDefault();
}

function changeModeText() {
  var inputText = getInputText();
  var mode = getMode();

  if (getUser() && !cmdHelper.command) {
      //TODO msg command text in comparison should not be hard coded
      if (('chat' === mode && -1 < commandChars.indexOf(inputText.charAt(0)))
          || ('cmd' === mode && 'msg' !== trimSpace(inputText).split(' ')[0])) {
        setModeText('CMD');
      } else {
        setModeText('CHAT');
      }
  }
}

function setRoom(roomName) {
  setLocalVal('room', roomName);
  setInputStart(roomName);
  queueMessage({ text : ['Entered ' + roomName] });
}

function scrollView() {
  spacer.scrollIntoView(false);

  // Compatibility fix for Android 2.*
  //window.scrollTo(0, document.body.scrollHeight);
}

// Takes date and returns shorter readable time
function generateTimeStamp(date, full) {
  var newDate = new Date(date);
  var splitDate;
  var minutes;
  var hours;
  var month;
  var day;
  var timeStamp;

  // Splitting of date is a fix for NaN on Android 2.*
  if (isNaN(newDate.getMinutes)) {
    splitDate = date.split(/[-T:\.]+/);
    newDate = new Date(Date.UTC(splitDate[0], splitDate[1], splitDate[2], splitDate[3], splitDate[4], splitDate[5]));
  }

  minutes = beautifyNumber(newDate.getMinutes());
  hours = beautifyNumber(newDate.getHours());
  timeStamp = hours + ':' + minutes + ' ';

  if (full) {
    month = beautifyNumber(newDate.getMonth());
    day = beautifyNumber(newDate.getDate());

    timeStamp = day + '/' + month + ' ' + timeStamp;
  }

  return timeStamp;
}

// Adds time stamp and room name to a string from a message if they are set
function generateFullText(sentText, message) {
  var text = '';

  if (message.time && !message.skipTime) {
    text += generateTimeStamp(message.time);
  }

  if (message.roomName) {
    text += message.roomName !== getLocalVal('room') ? '[' + message.roomName + '] ' : '';
  }

  if (message.userName) {
    text += message.userName + ': ';
  }

  text += sentText;

  return text;
}

function consumeMsgShortQueue() {
  var message;

  if (0 < shortMsgQueue.length) {
    message = shortMsgQueue.shift();

    printRow(message);
  } else {
    printing = false;
  }
}

// Prints messages from the queue
function consumeMsgQueue(messageQueue) {
  if (!printing && 0 < messageQueue.length) {
    shortMsgQueue = messageQueue.splice(0, msgsPerQueue);
    printing = true;
    consumeMsgShortQueue();
  }
}

function printRow(message) {
  var text;
  var fullText;
  var row;
  var span;
  var textNode;

  if (0 < message.text.length) {
    text = message.text.shift();
    fullText = generateFullText(text, message);

    row = document.createElement('li');
    span = document.createElement('span');
    textNode = document.createTextNode(fullText);

    if (message.extraClass) {
      /**
       * classList doesn't work on older devices,
       * thus the usage of className
       */
      row.className += ' ' + message.extraClass;
    }

    span.appendChild(textNode);
    row.appendChild(span);
    mainFeed.appendChild(row);

    scrollView();

    setTimeout(printRow, rowTimeout, message);
  } else {
    consumeMsgShortQueue();
  }
}

//TODO Hard coded
function convertWhisperRoom(roomName) {
  var convertedRoom = 0 <= roomName.indexOf('-whisper') ? 'WHISPER' : roomName;

  return convertedRoom;
}

//TODO Hard coded
function convertDeviceRoom(roomName) {
  var convertedRoom = 0 <= roomName.indexOf('-device') ? 'DEVICE' : roomName;

  return convertedRoom;
}

//TODO Hard coded
function convertImportantRoom(roomName) {
  var convertedRoom = 'important' === roomName ? 'IMPRTNT' : roomName;

  return convertedRoom;
}

//TODO Hard coded
function convertBroadcastRoom(roomName) {
  var convertedRoom = 'broadcast' === roomName ? 'BRODCST' : roomName;

  return convertedRoom;
}

function printWelcomeMsg() {
  var logoToPrint = null !== logo ? JSON.parse(JSON.stringify(logo)) : { text : [''] };
  var razLogoToPrint = null !== razLogo ? JSON.parse(JSON.stringify(razLogo)) : { text : [''] };

  queueMessage(logoToPrint);
  queueMessage({
    text : [
      'Welcome, employee ' + getUser(),
      'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
      'Learn this valuable skill to increase your productivity!',
      'May you have a productive day',
      '## This terminal has been cracked by your friendly Razor team. Enjoy! ##'
    ]
  });
  queueMessage(razLogoToPrint);
  queueMessage({
    text : [
      '## This terminal has been cracked by your friendly Razor team. Enjoy! ##'
    ]
  });
}

function beautifyNumber(number) {
  return 9 < number ? number : '0' + number;
}

function onChatMsg(message) {
  if (message.roomName) {
    message.roomName = convertWhisperRoom(message.roomName);
  }

  queueMessage(message);
}

function onMessage(message) {
  if (message.roomName) {
    message.roomName = convertWhisperRoom(message.roomName);
  }

  queueMessage(message);
}

function onBroadcastMsg(message) {
  message.extraClass = 'bold';

  queueMessage(message);
}

function onImportantMsg(msg) {
  var message = msg;

  message.extraClass = 'importantMsg';
  message.skipTime = true;

  queueMessage(message);

  if (message.morse) {
    validCmds.morse.func(message.text.slice(0, 1), message.morse.local);
  }
}

function onMultiMsg(messages) {
  var message;
  var i;

  for (i = 0; i < messages.length; i++) {
    message = messages[i];

    if (message.roomName) {
      message.roomName = convertWhisperRoom(message.roomName);
      message.roomName = convertDeviceRoom(message.roomName);
      message.roomName = convertImportantRoom(message.roomName);
      message.roomName = convertBroadcastRoom(message.roomName);
    }

    queueMessage(message);
  }
}

/*
 * Triggers when the connection is lost and then re-established
 */
function onReconnect() {
  var user = getUser();

  if (!reconnecting) {
    reconnecting = true;

    socket.disconnect();
    socket.connect({ forceNew : true });

    socket.emit('updateId', { userName : user });
  }
}

function onDisconnect() {
  queueMessage({
    text : ['Lost connection'],
    extraClass : 'importantMsg'
  });
}

function onFollow(room) {
  if (room.entered) {
    setRoom(room.roomName);
  } else {
    queueMessage({
      text : ['Following ' + room.roomName]
    });
  }
}

function onUnfollow(room) {
  queueMessage({
    text : ['Stopped following ' + room.roomName]
  });

  if (room.exited) {
    setInputStart('public');
    setLocalVal('room', 'public');
    socket.emit('follow', { roomName : 'public', entered : true });
  }
}

function onLogin(user) {
  var mode = user.mode ? user.mode : 'cmd';

  validCmds.clear.func();
  setUser(user.userName);
  setAccessLevel(user.accessLevel);
  queueMessage({
    text : ['Successfully logged in as ' + user.userName]
  });
  printWelcomeMsg();
  validCmds.mode.func([mode]);

  socket.emit('updateDeviceSocketId', {
    deviceId : getLocalVal('deviceId'),
    socketId : socket.id,
    userName : getUser()
  });

  socket.emit('follow', { roomName : 'public', entered : true });
}

function onCommandSuccess(data) {
  if (!data.freezeStep) {
    cmdHelper.onStep++;
  }

  validCmds[cmdHelper.command].steps[cmdHelper.onStep](data, socket);
}

function onCommandFail() {
  validCmds[cmdHelper.command].abortFunc();
  resetCommand(true);
}

function onReconnectSuccess(data) {
  var mode;
  var room;

  if (!data.anonUser) {
    mode = data.user.mode ? data.user.mode : 'cmd';
    room = getLocalVal('room');

    validCmds.mode.func([mode], false);
    setAccessLevel(data.user.accessLevel);

    socket.emit('updateDeviceSocketId', {
      deviceId : getLocalVal('deviceId'),
      socketId : socket.id,
      user : getUser()
    });

    if (!data.firstConnection) {
      queueMessage({
        text : ['Re-established connection'],
        extraClass : 'importantMsg'
      });
    } else {
      printWelcomeMsg();

      if (room) {
        validCmds.room.func([room]);
      }
    }

    queueMessage({
      text : ['Retrieving missed messages (if any)']
    });
  } else {
    if (!data.firstConnection) {
      queueMessage({
        text : ['Re-established connection'],
        extraClass : 'importantMsg'
      });
    }
  }

  reconnecting = false;
}

function onDisconnectUser() {
  var currentUser = getLocalVal('user');

  // There is no saved local user. We don't need to print this
  if (null !== currentUser) {
    queueMessage({
      text : [
        'Didn\'t find user ' + getLocalVal('user') + ' in database',
        'Resetting local configuration'
      ]
    });
  }

  resetAllLocalVals();
}

function onMorse(morseCode) {
  playMorse(morseCode);
}

function onTime(time) {
  queueMessage({
    text : ['Time: ' + generateTimeStamp(time, true)]
  });
}

function onLocationMsg(locationData) {
  //TODO Change from Object.keys for compatibility with older Android
  var locationKeys = Object.keys(locationData);
  var i;
  var user;
  var userLoc;
  var latitude;
  var longitude;
  var heading;
  var accuracy;
  var text;
  var mapLoc;

  for (i = 0; i < locationKeys.length; i++) {
    text = '';
    user = locationKeys[i];

    if (locationData[user].coords) {
      userLoc = locationData[user];
      latitude = userLoc.coords.latitude.toFixed(6);
      longitude = userLoc.coords.longitude.toFixed(6);
      heading = null !== userLoc.coords.heading ? Math.round(userLoc.coords.heading) : null;
      accuracy = 1000 > userLoc.accuracy ? Math.ceil(userLoc.accuracy) : 'BAD';
      mapLoc = locateOnMap(latitude, longitude);

      text += 'User: ' + user + '\t';
      text += 'Time: ' + generateTimeStamp(userLoc.locTime, true) + '\t';
      text += 'Location: ' + mapLoc + '\t';

      if ('---' !== mapLoc) {
        text += 'Accuracy: ' + accuracy + ' meters\t';

        text += 'Coordinates: ' + latitude + ', ' + longitude + '\t';

        if (null !== heading) {
          text += 'Heading: ' + heading + ' deg.';
        }
      }

      queueMessage({ text : [text] });
    }
  }
}

function onBan() {
  queueMessage({
    text : [
      'You have been banned from the system',
      'Contact your nearest Organica IT Support ' +
      'Center for re-education',
      '## or your nearest friendly Razor member. ' +
      'Bring a huge bribe ##'
    ],
    extraClass : 'importantMsg'
  });
  resetAllLocalVals();
}

function onLogout() {
  validCmds.clear.func();
  resetAllLocalVals();
  socket.emit('followPublic');
  printStartMessage();
}

function onUpdateCommands(commands) {
  var i;
  var newCommand;
  var oldCommand;

  if (commands) {
    for (i = 0; i < commands.length; i++) {
      newCommand = commands[i];
      oldCommand = validCmds[newCommand.commandName];

      if (oldCommand) {
        oldCommand.accessLevel = newCommand.accessLevel;
        oldCommand.category = newCommand.category;
        oldCommand.visibility = newCommand.visibility;
        oldCommand.authGroup = newCommand.authGroup;
      }
    }
  }
}

function onWeather(report) {
  var weather = [];
  var weatherInst;
  var weatherString = '';
  var time;
  var hours;
  var day;
  var month;
  var precipType;
  var temperature;
  var windSpeed;
  var precip;
  var coverage;
  var i;

  for (i = 0; i < report.length; i++) {
    weatherInst = report[i];
    weatherString = '';
    time = new Date(weatherInst.time);
    hours = beautifyNumber(time.getHours());
    day = beautifyNumber(time.getDate());
    month = beautifyNumber(time.getMonth());
    temperature = Math.round(weatherInst.temperature);
    windSpeed = Math.round(weatherInst.gust);
    precip = 0 === weatherInst.precipitation ? '0.1< ' : weatherInst.precipitation + 'mm ';

    switch (weatherInst.precipType) {
      // No
      case 0:
        break;
      // Snow
      case 1:
        precipType = 'snow';
        break;
      // Snow + rain
      case 2:
        precipType = 'snow and rain';
        break;
      // Rain
      case 3:
        precipType = 'acid rain';
        break;
      // Drizzle
      case 4:
        precipType = 'drizzle';
        break;
      // Freezing rain
      case 5:
        precipType = 'freezing rain';
        break;
      // Freezing drizzle
      case 6:
        precipType = 'freezing drizzle';
        break;
      default:
        break;
    }

    switch (weatherInst.cloud) {
      case 0:
      case 1:
      case 2:
      case 3:
        coverage = 'Light';

        break;
      case 4:
      case 5:
      case 6:
        coverage = 'Moderate';

        break;
      case 7:
      case 8:
      case 9:
        coverage = 'High';

        break;
      default:
        break;
    }

    weatherString += day + '/' + month + ' ' + hours + ':00' + '\t';
    weatherString += 'Temperature: ' + temperature + '\xB0C\t';
    weatherString += 'Visibility: ' + weatherInst.visibility + 'km \t';
    weatherString += 'Wind direction: ' + weatherInst.windDirection + '\xB0\t';
    weatherString += 'Wind speed: ' + windSpeed + 'm/s\t';
    weatherString += 'Blowout risk: ' + weatherInst.thunder + '%\t';
    weatherString += 'Pollution coverage: ' + coverage + '\t';

    if (precipType) {
      weatherString += precip;
      weatherString += precipType;
    }

    weather.push(weatherString);
  }

  queueMessage({ text : weather });
}

function onUpdateDeviceId(newId) {
  setLocalVal('deviceId', newId);
}

function startSocketListeners() {
  if (socket) {
    socket.on('chatMsg', onChatMsg);
    socket.on('message', onMessage);
    socket.on('broadcastMsg', onBroadcastMsg);
    socket.on('importantMsg', onImportantMsg);
    socket.on('multiMsg', onMultiMsg);
    socket.on('reconnect', onReconnect);
    socket.on('disconnect', onDisconnect);
    socket.on('follow', onFollow);
    socket.on('unfollow', onUnfollow);
    socket.on('login', onLogin);
    socket.on('commandSuccess', onCommandSuccess);
    socket.on('commandFail', onCommandFail);
    socket.on('reconnectSuccess', onReconnectSuccess);
    socket.on('disconnectUser', onDisconnectUser);
    socket.on('morse', onMorse);
    socket.on('time', onTime);
    socket.on('locationMsg', onLocationMsg);
    socket.on('ban', onBan);
    socket.on('logout', onLogout);
    socket.on('updateCommands', onUpdateCommands);
    socket.on('weather', onWeather);
    socket.on('updateDeviceId', onUpdateDeviceId);
  }
}

function keyReleased() {
  keyPressed = false;
}

function isFullscreen() {
  return (!window.screenTop && !window.screenY);
}

/**
 * Goes into full screen with sent element
 * This is not supported in iOS Safari
 * @param {object} element - The element which should be maximized to full screen
 * @returns {undefined} Returns nothing
 */
function goFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

function fullscreenResize(keyboardShown) {
  var background = document.getElementById('background');

  /**
   * Used for Android when it shows/hides the keyboard
   * The soft keyboard will block part of the site without this fix
   */
  if (isFullscreen() && navigator.userAgent.match(/Android/i)) {
    if (keyboardShown) {
      background.classList.add('fullscreenKeyboardFix');
      background.classList.remove('fullscreenFix');
    } else {
      background.classList.remove('fullscreenKeyboardFix');
      background.classList.add('fullscreenFix');
    }

    scrollView();
  }
}

function generateDeviceId() {
  var randomString = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var randomLength = randomString.length;
  var deviceId = '';
  var i;
  var randomVal;

  for (i = 0; 15 > i; i++) {
    randomVal = Math.random() * (randomLength - 1);
    deviceId += randomString[Math.round(randomVal)];
  }

  return deviceId;
}

function printStartMessage() {
  var logoToPrint = null !== logo ? JSON.parse(JSON.stringify(logo)) : { text : ['']};
  queueMessage(logoToPrint);
  queueMessage({
    text : [
      '--------------------------------------------------',
      'Connecting....Could not establish connection to HQ'.toUpperCase(),
      'Rerouting....Secondary relay found'.toUpperCase(),
      'Connecting....Connection established'.toUpperCase(),
      '--------------------------------------------------',
      'Welcome to the Oracle of Organica',
      'Please login to start your productive day!',
      'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
      'You can also use it to show all available commands!',
      'Learn this valuable skill to increase your productivity!'
    ]
  });
}

// Sets everything relevant when a user enters the site
function startBoot() {
  socket.emit('getCommands');

  // TODO: Move this
  if (!getLocalVal('deviceId')) {
    setLocalVal('deviceId', generateDeviceId());
  }

  document.getElementById('background').addEventListener('click', function(event) {
    clicked = !clicked;

    if (clicked) {
      marker.focus();
    } else {
      marker.blur();
    }

    // Set whole document to full screen
    goFullScreen(document.documentElement);
    fullscreenResize(clicked);

    event.preventDefault();
  });

  startSocketListeners();
  addEventListener('keypress', keyPress);

  // Needed for some special keys. They are not detected with keypress
  addEventListener('keydown', specialKeyPress);
  addEventListener('keyup', keyReleased);
  window.addEventListener('focus', setIntervals);

  resetPrevCmdPointer();
  generateMap();
  setIntervals();
  startAudio();

  // TODO: Move this
  if (!getAccessLevel()) {
    setAccessLevel(0);
  }

  if (!getUser()) {
    printStartMessage();
    setInputStart('RAZCMD');
    socket.emit('updateDeviceSocketId', {
      deviceId : getLocalVal('deviceId'),
      socketId : socket.id,
      user : 'NO_USER_LOGGED_IN'
    });
  }

  socket.emit('updateId', {
    userName : getUser(),
    firstConnection : true,
    device : getLocalVal('deviceId')
  });
}

startBoot();
