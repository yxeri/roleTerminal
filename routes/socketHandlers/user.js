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
    if (!objectValidator.isValidData(data, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.register.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed || !data || !data.user || !isTextAllowed(data.user.userName)) {
        socket.emit('commandFail');

        return;
      }

      dbConnector.getUser(data.user.userName, function(err, foundUser) {
        if (err) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to check if user exists'],
            text_se: ['Misslyckades med att försöka hitta användaren'],
            err: err,
          });
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
    if (!objectValidator.isValidData(data, { user: { userName: true, password: true, registerDevice: true } })) {
      return;
    }

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
        mode: appConfig.defaultMode,
        verified: false,
        rooms: [databasePopulation.rooms.public.roomName],
      };

      // TODO Refactor the inner code
      dbConnector.createUser(userObj, function(err, user) {
        if (err) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to register user'],
            text_se: ['Misslyckades med att registrera användare'],
            err: err,
          });

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


        const newRoom = {};
        newRoom.roomName = user.userName + appConfig.whisperAppend;
        newRoom.visibility = 12;
        newRoom.accessLevel = 12;

        manager.createRoom(newRoom, user, function(createErr) {
          if (createErr) {
            return;
          }
        });

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: [user.userName + ' has been registered'],
            text_se: [user.userName + ' har blivit registerad'],
          },
        });

        if (appConfig.userVerify) {
          const message = {};
          message.time = new Date();
          message.roomName = databasePopulation.rooms.admin.roomName;

          messenger.sendMsg({
            socket: socket,
            message: {
              userName: 'SYSTEM',
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
    if (!objectValidator.isValidData(data, { user: true })) {
      return;
    }

    if (data.user.userName === null) {
      const publicRoom = databasePopulation.rooms.public.roomName;

      socket.join(publicRoom);
      socket.emit('reconnectSuccess', {
        anonUser: true,
        firstConnection: data.firstConnection,
      });
      socket.emit('startup', {
        defaultLanguage: appConfig.defaultLanguage,
        forceFullscreen: appConfig.forceFullscreen,
        gpsTracking: appConfig.gpsTracking,
      });
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
        socket.emit('startup', {
          defaultLanguage: appConfig.defaultLanguage,
          forceFullscreen: appConfig.forceFullscreen,
          gpsTracking: appConfig.gpsTracking,
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
    if (!objectValidator.isValidData(data, { position: true })) {
      return;
    }

    dbConnector.getUserById(socket.id, function(err, user) {
      if (err || user === null) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update location'],
          err: err,
        });

        return;
      }

      dbConnector.updateUserLocation(user.userName, data.position, function(userErr) {
        if (userErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to update location'],
            err: userErr,
          });
        }
      });
    });
  });

  socket.on('login', function(data) {
    if (!objectValidator.isValidData(data, { user: { userName: true, password: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.login.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const user = data.user;
      const userName = user.userName.toLowerCase();

      dbConnector.authUser(userName, user.password, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to login'],
            text_se: ['Misslyckades med att logga in'],
            err: err,
          });

          return;
        } else if (appConfig.userVerify && !authUser.verified) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['The user has not yet been verified. Failed to login'],
            text_se: ['Användaren har ännu inte blivit verifierad. Inloggningen misslyckades'],
          });

          return;
        } else if (authUser.banned) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['The user has been banned. Failed to login'],
            text_se: ['Användaren är bannad. Inloggningen misslyckades'],
          });

          return;
        }

        manager.updateUserSocketId(socket.id, userName, function(idErr) {
          if (idErr) {
            return;
          }

          const oldSocket = io.sockets.connected[authUser.socketId];
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
    if (!objectValidator.isValidData(data, { oldPassword: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.password.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.authUser(user.userName, data.oldPassword, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Incorrect password'],
            text_se: ['Felaktigt lösenord'],
            err: err,
          });
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
    if (!objectValidator.isValidData(data, { oldPassword: true, newPassword: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.password.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      } else if (!data.newPassword) {
        logger.sendSocketErrorMsg({
          socket: socket,
          code: logger.ErrorCodes.general,
          text: ['Failed to update password. No new password sent'],
          text_se: ['Misslyckades med att uppdatera lösenordet. Inget nytt lösenord skickades'],
        });

        return;
      }

      dbConnector.authUser(user.userName, data.oldPassword, function(err, authUser) {
        if (err || authUser === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to update password'],
            text_se: ['Misslyckades med att uppdatera lösenordet'],
            err: err,
          });

          return;
        }

        dbConnector.updateUserPassword(authUser.userName, data.newPassword, function(userErr, updatedUser) {
          if (userErr || updatedUser === null) {
            logger.sendSocketErrorMsg({
              socket: socket,
              code: logger.ErrorCodes.general,
              text: ['Failed to update password'],
              text_se: ['Misslyckades med att uppdatera lösenordet'],
              err: userErr,
            });

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
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: ['Failed to reset user socket ID'],
            err: err,
          });

          return;
        }

        dbConnector.updateUserOnline(userName, false, function(userErr, updatedUser) {
          if (userErr || updatedUser === null) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.general,
              text: ['Failed to reset socket id'],
              err: userErr,
            });

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
    if (!objectValidator.isValidData(data, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.verifyuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      if (userNameLower !== undefined) {
        dbConnector.verifyUser(userNameLower, function(err, user) {
          if (err || user === null) {
            logger.sendSocketErrorMsg({
              socket: socket,
              code: logger.ErrorCodes.general,
              text: ['Failed to verify user'],
              text_se: ['Misslyckades med att verifiera användaren'],
              err: err,
            });

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
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to verify all user'],
            text_se: ['Misslyckades med att verifiera alla användare'],
            err: err,
          });

          return;
        }

        dbConnector.verifyAllUsers(function(verifyErr) {
          if (verifyErr) {
            logger.sendSocketErrorMsg({
              socket: socket,
              code: logger.ErrorCodes.general,
              text: ['Failed to verify all user'],
              text_se: ['Misslyckades med att verifiera alla användare'],
              err: verifyErr,
            });

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
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get unverified users'],
            text_se: ['Misslyckades med hämtningen av icke-verifierade användare'],
            err: err,
          });

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
    if (!objectValidator.isValidData(data, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.banuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      dbConnector.banUser(userNameLower, function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to ban user'],
            text_se: ['Misslyckades med att banna användaren'],
          });

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
            logger.sendSocketErrorMsg({
              socket: socket,
              code: logger.ErrorCodes.general,
              text: ['Failed to disconnect user ' + userNameLower],
              text_se: ['Misslyckades med att koppla från användaren ' + userNameLower],
              err: userErr,
            });

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
    if (!objectValidator.isValidData(data, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.unbanuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userNameLower = data.user.userName.toLowerCase();

      dbConnector.unbanUser(userNameLower, function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to unban user'],
            text_se: ['Misslyckades med att unbanna användaren'],
            err: err,
          });

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
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to get all banned users'],
            text_se: ['Misslyckades med att hämta en lista över alla bannade användare'],
            err: err,
          });

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
    if (!objectValidator.isValidData(data, { user: { userName: true }, field: true, value: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.updateuser.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const userName = data.user.userName;
      const field = data.field;
      const value = data.value;
      const callback = function(err, user) {
        if (err || user === null) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to update user'],
            text_se: ['Misslyckades med att uppdatera användaren'],
            err: err,
          });

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
        logger.sendSocketErrorMsg({
          socket: socket,
          code: logger.ErrorCodes.general,
          text: ['Invalid field. User doesn\'t have ' + field],
          text_se: ['Inkorrekt fält. Användare har inte fältet ' + field],
        });
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
    if (!objectValidator.isValidData(data, { user: { userName: true }, mode: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.mode.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed) {
        return;
      }

      const userName = user.userName;
      const value = data.mode;

      dbConnector.updateUserMode(userName, value, function(err) {
        if (err) {
          logger.sendSocketErrorMsg({
            socket: socket,
            code: logger.ErrorCodes.general,
            text: ['Failed to store new user mode'],
            text_se: ['Misslyckades med att lagra nya användarläget'],
            err: err,
          });

          return;
        }
      });
    });
  });

  socket.on('whoAmI', function() {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.whoami.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !user) {
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

  socket.on('matchPartialUser', function(data) {
    // data.partialName is not checked if it set, to allow the retrieval of all users on no input

    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, function(allowErr, allowed, user) {
      if (allowErr || !allowed || !user) {
        return;
      }

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
