'use strict';

const dbConnector = require('../../databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;
const manager = require('../../manager');
const logger = require('../../logger');
const appConfig = require('rolehaven-config').app;
const messenger = require('../../messenger');
const objectValidator = require('../../objectValidator');

function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

function handle(socket, io) {
  socket.on('userExists', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.register.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !data || !data.user || !isTextAllowed(data.user.userName)) {
        socket.emit('commandFail');

        return;
      }

      dbConnector.getUser(data.user.userName, function(err, foundUser) {
        if (err) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to check if user exists', err);
          socket.emit('commandFail');

          return;
        } else if (foundUser !== null) {
          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['User with that name already exists'],
              text_se: ['En användare med det namnet existerar redan'],
            },
          });
          socket.emit('commandFail');

          return;
        }

        socket.emit('commandSuccess', { freezeStep: true });
      });
    });
  });

  socket.on('register', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.register.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !data || !data.user || !isTextAllowed(data.user.userName)) {
        return;
      }

      const userName = data.user.userName.toLowerCase();
      const userObj = {
        userName: userName,
        socketId: '',
        password: data.user.password,
        registerDevice: data.user.registerDevice,
        mode: appConfig.modes.command,
        verified: !appConfig.userVerify ? true : false,
        rooms: [databasePopulation.rooms.public.roomName],
      };

      // TODO Refactor the inner code
      dbConnector.addUser(userObj, function(err, user) {
        if (err) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to register user', err);

          return;
        } else if (user === null) {
          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: [userName + ' already exists'],
              text_se: [userName + ' existerar redan'],
            },
          });

          return;
        }

        const message = {};
        const newRoom = {};

        message.time = new Date();
        message.roomName = databasePopulation.rooms.admin.roomName;

        newRoom.roomName = user.userName + appConfig.whisperAppend;
        newRoom.visibility = 12;
        newRoom.accessLevel = 12;

        manager.createRoom(newRoom, user, function(createErr, roomName) {
          if (createErr) {
            return;
          }
        });

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: [user.userName + ' has been registered'],
            text_se: [user.UserName + ' har blivit registerad'],
          },
        });

        if (appConfig.userVerify) {
          messenger.sendMsg({
            socket: socket,
            message: {
              text: ['User ' + user.userName + ' needs to be verified'],
              text_se: ['Användaren ' + user.userName + ' måste bli verifierad'],
            },
            sendTo: message.roomName,
          });

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['You will need to be verified before you can login'],
              text_se: ['Ni måste bli verifierad innan ni kan logga in'],
            },
          });
        }
      });
    });
  });

  // TODO Rename to reflect the function
  socket.on('updateId', function(data) {
    if (data.user.userName === null) {
      const publicRoom = databasePopulation.rooms.public.roomName;

      socket.join(publicRoom);
      socket.emit('reconnectSuccess', { anonUser: true, firstConnection: data.firstConnection });

      if (data.firstConnection) {
        socket.emit('startup', { storedMessages: require('rolehaven-config').messages });
      }
    } else {
      manager.updateUserSocketId(socket.id, data.user.userName, function(idErr, user) {
        if (idErr) {
          return;
        } else if (user === null) {
          socket.emit('disconnectUser');
          socket.join(databasePopulation.rooms.public.roomName);

          return;
        }

        const allRooms = user.rooms;

        manager.joinRooms(allRooms, socket, data.device.deviceId);
        socket.emit('reconnectSuccess', {
          firstConnection: data.firstConnection,
          user: user,
        });
        manager.getHistory(allRooms, Infinity, true, user.lastOnline, function(histErr, missedMessages) {
          if (histErr) {
            return;
          }

          while (missedMessages.length) {
            messenger.sendSelfMsgs({
              socket: socket,
              messages: missedMessages.splice(0, appConfig.chunkLength),
            });
          }
        });
      });
    }
  });

  socket.on('updateLocation', function(data) {
    dbConnector.getUserById(socket.id, function(err, user) {
      if (err || user === null) {
        logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to update location', err);

        return;
      }

      dbConnector.updateUserLocation(user.userName, data.position, function(userErr) {
        if (userErr) {
          logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to update location', userErr);
        }
      });
    });
  });

  socket.on('login', function(data) {
    const user = data.user;

    manager.userAllowedCommand(socket.id, databasePopulation.commands.login.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !user.userName || !user.password) {
        return;
      }

      const userName = user.userName.toLowerCase();

      dbConnector.authUser(userName, user.password, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to login', err);

          return;
        } else if (!authUser.verified || authUser.banned) {
          let errMsg;

          if (!authUser.verified) {
            errMsg = 'The user has not yet been verified. Failed to login';
          } else {
            errMsg = 'The user has been banned. Failed to login';
          }

          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, errMsg);

          return;
        }

        const oldSocket = io.sockets.connected[authUser.socketId];

        manager.updateUserSocketId(socket.id, userName, function(idErr) {
          if (idErr) {
            return;
          }

          const rooms = authUser.rooms;

          if (oldSocket) {
            const oldRooms = Object.keys(oldSocket.rooms);

            for (let i = 1; i < oldRooms.length; i++) {
              if (oldRooms[i].indexOf(appConfig.deviceAppend) < 0) {
                oldSocket.leave(oldRooms[i]);
              }
            }

            oldSocket.emit('logout');
            messenger.sendSelfMsg({
              socket: oldSocket,
              message: {
                text: [
                  'Your user has been logged in on another device',
                  'You have been logged out',
                ],
                text_se: [
                  'Din användare har loggat in på en annan enhet',
                  'Ni har blivit urloggade',
                ],
              },
            });
          }

          manager.joinRooms(rooms, socket);
          socket.emit('login', { user: authUser });
        });

        dbConnector.setUserLastOnline(user.userName, new Date(), function(userOnlineErr, settedUser) {
          if (userOnlineErr || settedUser === null) {
            console.log('Failed to set last online');

            return;
          }
        });
      });
    });
  });

  socket.on('checkPassword', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.password.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.authUser(user.userName, data.oldPassword, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Incorrect password', err);
          socket.emit('commandFail');

          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Enter your new password'],
            text_se: ['Skriv in ert nya lösenord'],
          },
        });
      });
    });
  });

  socket.on('changePassword', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.password.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      } else if (!data.newPassword) {
        logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to update password. No new password sent');

        return;
      }

      dbConnector.authUser(user.userName, data.oldPassword, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to update password', err);

          return;
        }

        dbConnector.updateUserPassword(authUser.userName, data.newPassword, function(userErr, updatedUser) {
          if (userErr || updatedUser === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to update password', userErr);

            return;
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['Password has been successfully changed!'],
              text_se: ['Lösenordet har ändrats!'],
            },
          });
        });
      });
    });
  });

  socket.on('logout', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.logout.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !user) {
        return;
      }

      const userName = user.userName;

      dbConnector.updateUserSocketId(userName, '', function(err, socketUser) {
        if (err || socketUser === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to reset user socket ID', err);

          return;
        }

        dbConnector.updateUserOnline(userName, false, function(userErr, updatedUser) {
          if (userErr || updatedUser === null) {
            logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to reset socket id', userErr);

            return;
          }

          const rooms = Object.keys(socket.rooms);

          for (let i = 1; i < rooms.length; i++) {
            if (rooms[i].indexOf(appConfig.deviceAppend) < 0) {
              socket.leave(rooms[i]);
            }
          }

          socket.emit('logout');
          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['You have been logged out'],
              text_se: ['Ni har blivit urloggade'],
            },
          });
        });
      });
    });
  });

  socket.on('verifyUser', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.verifyuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      if (userNameLower !== undefined) {
        dbConnector.verifyUser(userNameLower, function(err, user) {
          if (err || user === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to verify user', err);
            return;
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['User ' + user.userName + ' has been verified'],
              text_se: ['Användaren ' + user.userName + ' har blivit verifierad'],
            },
          });
        });
      }
    });
  });

  socket.on('verifyAllUsers', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.verifyuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getUnverifiedUsers(function(err, users) {
        if (err || users === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to verify all user', err);

          return;
        }

        dbConnector.verifyAllUsers(function(verifyErr) {
          if (verifyErr) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to verify all user', verifyErr);

            return;
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['Users have been verified'],
              text_se: ['Användarna har blivit verifierade'],
            },
          });
          // TODO Send message to verified user
        });
      });
    });
  });

  socket.on('unverifiedUsers', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.verifyuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getUnverifiedUsers(function(err, users) {
        if (err || users === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to unverified users', err);

          return;
        }

        let usersString = '';

        for (let i = 0; i < users.length; i++) {
          usersString += users[i].userName;

          if (i !== users.length - 1) {
            usersString += ' | ';
          }
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: [usersString],
          },
        });
      });
    });
  });

  socket.on('ban', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.banuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      dbConnector.banUser(userNameLower, function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to ban user');

          return;
        }

        const bannedSocketId = user.socketId;

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['User ' + userNameLower + ' has been banned'],
            text_se: ['Användaren ' + userNameLower + ' har blivit bannad'],
          },
        });

        dbConnector.updateUserSocketId(userNameLower, '', function(userErr, updatedUser) {
          if (userErr || updatedUser === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to disconnect user ' + userNameLower, userErr);

            return;
          }

          const rooms = Object.keys(socket.rooms);

          socket.to(bannedSocketId).emit('ban');

          for (let i = 1; i < rooms.length; i++) {
            socket.leave(rooms[i]);
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['User ' + userNameLower + ' has been disconnected'],
              text_se: ['Användaren ' + userNameLower + ' har blivit urloggad'],
            },
          });
        });
      });
    });
  });

  socket.on('unban', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.unbanuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      dbConnector.unbanUser(userNameLower, function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to unban user', err);

          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Ban on user ' + userNameLower + ' has been removed'],
            text_se: ['Ban på användaren ' + userNameLower + ' har blivit borttaget'],
          },
        });
      });
    });
  });

  socket.on('bannedUsers', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.unbanuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getBannedUsers(function(err, users) {
        if (err || users === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to get all banned users', err);

          return;
        }

        let usersString = '';

        for (let i = 0; i < users.length; i++) {
          usersString += users[i].userName;

          if (i !== users.length - 1) {
            usersString += ' | ';
          }
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: [usersString],
          },
        });
      });
    });
  });

  socket.on('updateUserTeam', function() {

  });

  socket.on('updateUser', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.updateuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userName = data.user.userName;
      const field = data.field;
      const value = data.value;
      const callback = function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to update user', err);

          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['User has been updated'],
            text_se: ['Användaren har blivit uppdaterad'],
          },
        });
      };

      switch (field) {
      case 'visibility':
        dbConnector.updateUserVisibility(userName, value, callback);

        break;
      case 'accesslevel':
        dbConnector.updateUserAccessLevel(userName, value, callback);

        break;
      case 'addgroup':

        break;
      case 'removegroup':

        break;
      case 'password':
        dbConnector.updateUserPassword(userName, value, callback);

        break;
      default:
        logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Invalid field. User doesn\'t have ' + field);
        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Invalid field. User doesn\'t have ' + field],
            text_se: ['Inkorrekt fält. Användare har inte fältet ' + field],
          },
        });

        break;
      }
    });
  });

  socket.on('updateMode', function(data) {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.mode.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      const userName = user.userName;
      const value = data.mode;

      dbConnector.updateUserMode(userName, value, function(err) {
        if (err) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.general, 'Failed to store new user mode', err);
          return;
        }
      });
    });
  });

  socket.on('whoAmI', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.whoami.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      const data = {
        user: {
          userName: user.userName,
          accessLevel: user.accessLevel,
          team: user.team,
        },
      };

      socket.emit('whoAmI', data);
    });
  });

  socket.on('matchPartialuser', function(data) {
    if (!objectValidator.isValidData(data, { partialName: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, function(allowErr, allowed, user) {
      dbConnector.matchPartialUser(data.partialName, user, function(err, users) {
        if (err) {
          return;
        }

        const itemList = [];
        const userKeys = Object.keys(users);

        for (let i = 0; i < userKeys.length; i++) {
          itemList.push(users[userKeys[i]].userName);
        }

        if (itemList.length === 1) {
          socket.emit('matchFound', { matchedName: itemList[0] });
        } else {
          socket.emit('list', {
            itemList: {
              itemList: itemList,
              keepInput: false,
              replacePhrase: true,
            },
          });
        }
      });
    });
  });
}

exports.handle = handle;
