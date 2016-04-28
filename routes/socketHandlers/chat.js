'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const appConfig = require('../../config/defaults/config').app;
const logger = require('../../logger');
const messenger = require('../../messenger');
const objectValidator = require('../../objectValidator');

function followRoom(params) {
  const socket = params.socket;
  const newRoom = params.newRoom;
  const newRoomName = newRoom.roomName;

  if (Object.keys(socket.rooms).indexOf(newRoomName) < 0) {
    messenger.sendMsg({
      socket,
      message: {
        text: [`${params.userName} is following ${newRoomName}`],
        text_se: [`${params.username} följer ${newRoomName}`],
        roomName: newRoomName,
      },
      sendTo: newRoomName,
    });
  }

  socket.join(newRoomName);
  socket.emit('follow', { room: newRoom });
  socket.emit('commandSuccess', { noStepCall: true });
}

function shouldBeHidden(room, socketId) {
  const hiddenRooms = [
    socketId,
    databasePopulation.rooms.important.roomName,
    databasePopulation.rooms.broadcast.roomName,
    databasePopulation.rooms.morse.roomName,
  ];

  return hiddenRooms.indexOf(room) >= 0 || room.indexOf(appConfig.whisperAppend) >= 0 || room.indexOf(appConfig.deviceAppend) >= 0 || room.indexOf(appConfig.teamAppend) >= 0;
}

function handle(socket, io) {
  socket.on('chatMsg', (params) => {
    if (!objectValidator.isValidData(params, { message: { text: true, roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.msg.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const message = params.message;
      message.userName = user.userName;

      if (message.roomName === 'team') {
        message.roomName = user.team + appConfig.teamAppend;
      }

      messenger.sendChatMsg({ socket, message });
    });
  });

  socket.on('whisperMsg', (params) => {
    if (!objectValidator.isValidData(params, { message: { text: true, roomName: true, whisper: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.whisper.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const message = params.message;

      message.userName = user.userName;

      messenger.sendWhisperMsg({ socket, message });
    });
  });

  socket.on('broadcastMsg', (params) => {
    if (!objectValidator.isValidData(params, { message: { text: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.broadcast.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const message = params.message;

      message.userName = user.userName;

      messenger.sendBroadcastMsg({ socket, message });
    });
  });

  socket.on('createRoom', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true, owner: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.createroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      manager.createRoom(params.room, user, (createErr, roomName) => {
        if (createErr) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to create room'],
            text_se: ['Lyckades inte skapa rummet'],
            err: createErr,
          });

          return;
        } else if (!roomName) {
          messenger.sendSelfMsg({
            socket,
            message: {
              text: ['Failed to create room. A room with that name already exists'],
              text_se: ['Lyckades inte skapa rummet. Ett rum med det namnet existerar redan'],
            },
          });

          return;
        }

        const room = {};
        room.roomName = roomName;

        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Room has been created'],
            text_se: ['Rummet har skapats'],
          },
        });
        followRoom({ socket, userName: user.userName, newRoom: room });
      });
    });
  });

  socket.on('follow', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      socket.emit('commandFail');

      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.follow.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        socket.emit('commandFail');

        return;
      }

      const room = params.room;
      room.roomName = params.room.roomName.toLowerCase();

      if (params.room.password === undefined) {
        room.password = '';
      }

      dbConnector.authUserToRoom(user, room.roomName, room.password, (err, authRoom) => {
        if (err || authRoom === null) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: [`You are not authorized to join ${room.roomName}`],
            text_se: [`Ni har inte tillåtelse att gå in i rummet ${room.roomName}`],
            err,
          });
          socket.emit('commandFail');

          return;
        }

        dbConnector.addRoomToUser(user.userName, room.roomName, (roomErr) => {
          if (roomErr) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.db,
              text: [`Failed to follow ${room.roomName}`],
              err: roomErr,
            });
            socket.emit('commandFail');

            return;
          }

          room.entered = params.room.entered;

          followRoom({ socket, userName: user.userName, newRoom: room });
        });
      });
    });
  });

  socket.on('switchRoom', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.switchroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const room = params.room;
      let roomName = params.room.roomName.toLowerCase();

      if (user.team && roomName === 'team') {
        roomName = user.team + appConfig.teamAppend;
        room.roomName = 'team';
      }

      if (Object.keys(socket.rooms).indexOf(roomName) > 0) {
        socket.emit('follow', { room: params.room });
      } else {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: [`You are not following room ${roomName}`],
            text_se: [`Ni följer inte rummet ${roomName}`],
          },
        });
      }
    });
  });

  socket.on('unfollow', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.unfollow.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      // TODO Move toLowerCase to class
      const roomName = params.room.roomName.toLowerCase();

      if (Object.keys(socket.rooms).indexOf(roomName) > -1) {
        const userName = user.userName;

        /*
         * User should not be able to unfollow its own room
         * That room is for private messaging between users
         */
        if (roomName !== userName) {
          dbConnector.removeRoomFromUser(userName, roomName, (err, removedUser) => {
            if (err || removedUser === null) {
              logger.sendSocketErrorMsg({
                socket,
                code: logger.ErrorCodes.db,
                text: ['Failed to unfollow room'],
                text_se: ['Misslyckades med att följa rummet'],
                err,
              });

              return;
            }

            messenger.sendMsg({
              socket,
              message: {
                text: [`${userName} left ${roomName}`],
                text_se: [`${userName} lämnade ${roomName}`],
                roomName,
              },
              sendTo: roomName,
            });
            socket.leave(roomName);
            socket.emit('unfollow', { room: params.room });
          });
        }
      } else {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: [`You are not following ${roomName}`],
            text_se: [`Ni följer inte ${roomName}`],
          },
        });
      }
    });
  });

  // Shows all available rooms
  socket.on('listRooms', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      dbConnector.getAllRooms(user, (roomErr, rooms) => {
        if (roomErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get all room names'],
            err: roomErr,
          });

          return;
        }

        if (rooms.length > 0) {
          const roomNames = [];

          for (let i = 0; i < rooms.length; i++) {
            roomNames.push(rooms[i].roomName);
          }

          messenger.sendList({
            socket,
            itemList: {
              listTitle: 'List rooms',
              itemList: roomNames,
            },
          });
        }
      });
    });
  });

  socket.on('listUsers', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      dbConnector.getAllUsers(user, (userErr, users) => {
        if (userErr || users === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get all users'],
            err: userErr,
          });

          return;
        }

        if (users.length > 0) {
          const offlineUsers = [];
          const onlineUsers = [];

          for (let i = 0; i < users.length; i++) {
            const currentUser = users[i];

            if ((!appConfig.userVerify || currentUser.verified) && !currentUser.banned) {
              if (currentUser.online) {
                onlineUsers.push(currentUser.userName);
              } else {
                offlineUsers.push(currentUser.userName);
              }
            }
          }

          messenger.sendList({
            socket,
            itemList: {
              listTitle: 'Online users',
              itemList: onlineUsers,
            },
          });
          messenger.sendList({
            socket,
            itemList: {
              listTitle: 'Other users',
              itemList: offlineUsers,
            },
          });
        }
      });
    });
  });

  // TODO Data structure. data.user.userName?
  socket.on('myRooms', (params) => {
    if (!objectValidator.isValidData(params, { user: { userName: true }, device: { deviceId: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.myrooms.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const rooms = [];
      const socketRooms = Object.keys(socket.rooms);

      if (user.team) {
        rooms.push('team');
      }

      for (let i = 0; i < socketRooms.length; i++) {
        const room = socketRooms[i];

        if (!shouldBeHidden(room, socket.id)) {
          rooms.push(room);
        }
      }

      messenger.sendList({
        socket,
        itemList: {
          listTitle: 'My rooms',
          itemList: rooms,
        },
      });

      dbConnector.getOwnedRooms(user, (err, ownedRooms) => {
        if (err || !ownedRooms || ownedRooms === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get owned rooms'],
            err,
          });

          return;
        }

        if (ownedRooms.length > 0) {
          const roomNames = [];

          for (let i = 0; i < ownedRooms.length; i++) {
            roomNames.push(ownedRooms[i].roomName);
          }

          messenger.sendList({
            socket,
            itemList: {
              listTitle: 'You are owner of the rooms:',
              itemList: roomNames,
            },
          });
        }
      });
    });
  });

  socket.on('history', (params) => {
    if (!objectValidator.isValidData(params, {})) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.history.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      } else if (params.room && Object.keys(socket.rooms).indexOf(params.room.roomName) < 0) {
        logger.sendSocketErrorMsg({
          socket,
          code: logger.ErrorCodes.general,
          text: [`${user.userName} is not following room ${params.room.roomName}. Unable to retrieve history`],
          text_se: [`${user.userName} följer inte rummet ${params.room.roomName}. Misslyckades med hämtningen av historik`],
        });

        return;
      }

      const allRooms = params.room ? [params.room.roomName] : Object.keys(socket.rooms);
      const startDate = params.startDate || new Date();

      manager.getHistory(allRooms, params.lines, false, startDate, (histErr, historyMessages) => {
        if (histErr) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.general,
            text: ['Unable to retrieve history'],
            text_se: ['Misslyckades med hämtningen av historik'],
            err: histErr,
          });

          return;
        }

        while (historyMessages.length > 0) {
          messenger.sendSelfMsgs({ socket, messages: historyMessages.splice(0, appConfig.chunkLength) });
        }
      });
    });
  });

  socket.on('morse', (params) => {
    if (!objectValidator.isValidData(params, { morseCode: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.morse.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      messenger.sendMorse({
        socket,
        local: params.local,
        message: {
          morseCode: params.morseCode,
        },
        silent: params.silent,
      });
    });
  });

  socket.on('removeRoom', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.removeroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed || !user) {
        return;
      }

      const roomNameLower = params.room.roomName.toLowerCase();

      dbConnector.removeRoom(roomNameLower, user, (err, room) => {
        if (err || room === null) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to remove the room'],
            text_se: ['Misslyckades med att ta bort rummet'],
            err,
          });

          return;
        }

        dbConnector.removeRoomFromAllUsers(roomNameLower, (roomErr) => {
          if (roomErr) {
            logger.sendSocketErrorMsg({
              socket,
              code: logger.ErrorCodes.db,
              text: ['Failed to remove room from all users'],
              text_se: ['Misslyckades med att ta bort rummet från alla användare'],
              err: roomErr,
            });
          }

          const connectedIds = io.sockets.adapter.rooms[roomNameLower].sockets;
          const allSockets = io.sockets.connected;

          for (let i = 0; i < connectedIds.length; i++) {
            const userSocket = allSockets[connectedIds[i]];

            userSocket.leave(roomNameLower);
          }

          socket.broadcast.to(roomNameLower).emit('unfollow', { room: params.room });
        });

        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Removed the room'],
            text_se: ['Rummet borttaget'],
          },
        });
        messenger.sendMsg({
          socket,
          message: {
            text: [`Room ${roomNameLower} has been removed by the room administrator`],
            text_se: [`Rummet ${roomNameLower} har blivit borttaget av en administratör för rummet`],
          },
          sendTo: roomNameLower,
        });
      });
    });
  });

  socket.on('importantMsg', (params) => {
    if (!objectValidator.isValidData(params, { message: { text: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.importantmsg.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      const morseToSend = {};

      const importantMsg = {
        socket,
        message: params.message,
      };

      if (params.morse) {
        morseToSend.socket = socket;
        morseToSend.local = params.morse.local;
        morseToSend.message = {
          morseCode: params.morse.morseCode,
        };
      }

      if (params.device) {
        dbConnector.getDevice(params.device.deviceId, (err, device) => {
          if (err || device === null) {
            logger.sendSocketErrorMsg({
              socket,
              code: logger.ErrorCodes.db,
              text: ['Failed to send the message to the device'],
              text_se: ['Misslyckades med att skicka meddelande till enheten'],
              err,
            });

            return;
          }

          importantMsg.toOneDevice = true;

          if (params.morse) {
            morseToSend.message.roomName = device.deviceId + appConfig.deviceAppend;
          }
        });
      }

      messenger.sendImportantMsg(importantMsg);

      if (params.morse) {
        messenger.sendMorse(morseToSend);
      }
    });
  });

  // TODO Change this, quick fix implementation
  socket.on('followPublic', () => {
    socket.join(databasePopulation.rooms.public.roomName);
  });

  socket.on('updateRoom', (params) => {
    if (!objectValidator.isValidData(params, { room: { roomName: true }, field: true, value: true })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.updateroom.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      const roomName = params.room.roomName;
      const field = params.field;
      const value = params.value;
      const callback = (err, room) => {
        if (err || room === null) {
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: ['Failed to update room'],
            text_se: ['Misslyckades med att uppdatera rummet'],
            err,
          });

          return;
        }

        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Room has been updated'],
            text_se: ['Rummet har uppdaterats'],
          },
        });
      };

      switch (field) {
        case 'visibility':
          dbConnector.updateRoomVisibility(roomName, value, callback);

          break;
        case 'accesslevel':
          dbConnector.updateRoomAccessLevel(roomName, value, callback);

          break;
        default:
          logger.sendSocketErrorMsg({
            socket,
            code: logger.ErrorCodes.db,
            text: [`Invalid field. Room doesn't have ${field}`],
            text_se: [`Felaktigt fält. Rum har inte fältet ${field}`],
          });

          break;
      }
    });
  });

  socket.on('matchPartialMyRoom', (params) => {
    // params.partialName is not checked if it set, to allow the retrieval of all rooms on no input

    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const itemList = [];
      const rooms = user.rooms;
      const partialName = params.partialName;

      if (user.team) {
        rooms.push('team');
      }

      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];

        if (!shouldBeHidden(room, socket.id) && (!params.partialName || room.indexOf(partialName) === 0)) {
          itemList.push(room);
        }
      }

      if (itemList.length === 1) {
        socket.emit('matchFound', { matchedName: itemList[0] });
      } else {
        socket.emit('list', {
          itemList: {
            itemList,
            keepInput: false,
            replacePhrase: true,
          },
        });
      }
    });
  });

  socket.on('matchPartialRoom', (params) => {
    // params.partialName is not checked if it set, to allow the retrieval of all rooms on no input

    manager.userAllowedCommand(socket.id, databasePopulation.commands.list.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.matchPartialRoom(params.partialName, user, (err, rooms) => {
        if (err) {
          return;
        }

        const itemList = [];
        const roomKeys = Object.keys(rooms);

        for (let i = 0; i < roomKeys.length; i++) {
          itemList.push(rooms[roomKeys[i]].roomName);
        }

        if (itemList.length === 1) {
          socket.emit('matchFound', { matchedName: itemList[0] });
        } else {
          socket.emit('list', {
            itemList: {
              itemList,
              keepInput: false,
              replacePhrase: true,
            },
          });
        }
      });
    });
  });

  socket.on('inviteToRoom', (params) => {
    if (!objectValidator.isValidData(params, { user: { userName: true }, room: { roomName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.inviteroom.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const userName = params.user.userName;
      const roomName = params.room.roomName;

      dbConnector.getUser(userName, (userErr, invitedUser) => {
        if (userErr || invitedUser === null) {
          return;
        } else if (invitedUser.rooms.indexOf(roomName) > -1) {
          messenger.sendSelfMsg({
            socket,
            message: {
              text: ['The user is already following the room'],
              text_se: ['Användaren följer redan rummet'],
            },
          });

          return;
        }

        const invitation = {
          itemName: roomName,
          time: new Date(),
          invitationType: 'room',
          sender: user.userName,
        };

        dbConnector.addInvitationToList(userName, invitation, (invErr, list) => {
          if (invErr || list !== null) {
            if (list || invErr && invErr.code === 11000) {
              messenger.sendSelfMsg({
                socket,
                message: {
                  text: ['You have already sent an invite to the user'],
                  text_se: ['Ni har redan skickat en inbjudan till användaren'],
                },
              });
            } else if (invErr) {
              logger.sendSocketErrorMsg({
                socket,
                code: logger.ErrorCodes.general,
                text: ['Failed to send the invite'],
                text_se: ['Misslyckades med att skicka inbjudan'],
                err: invErr,
              });
            }

            return;
          }

          messenger.sendSelfMsg({
            socket,
            message: {
              text: ['Sent an invitation to the user'],
              text_se: ['Skickade en inbjudan till användaren'],
            },
          });
        });
      });
    });
  });

  socket.on('roomAnswer', (params) => {
    if (!objectValidator.isValidData(params, { accepted: true, invitation: { itemName: true, sender: true, invitationType: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.invitations.commandName, (allowErr, allowed, allowedUser) => {
      if (allowErr || !allowed) {
        return;
      }

      const invitation = params.invitation;
      const userName = allowedUser.userName;
      const roomName = invitation.itemName;
      invitation.time = new Date();

      if (params.accepted) {
        dbConnector.addRoomToUser(userName, roomName, (roomErr) => {
          if (roomErr) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.db,
              text: [`Failed to follow ${roomName}`],
              err: roomErr,
            });

            return;
          }

          followRoom({
            socket,
            userName,
            newRoom: { roomName },
          });
          dbConnector.removeInvitationFromList(userName, roomName, invitation.invitationType, (remErr) => {
            if (remErr) {
              return;
            }
          });
        });
      } else {
        dbConnector.removeInvitationFromList(userName, invitation.itemName, invitation.invitationType, (err, list) => {
          if (err || list === null) {
            messenger.sendSelfMsg({
              socket,
              message: {
                text: ['Failed to decline invitation'],
                text_se: ['Misslyckades med att avböja inbjudan'],
              },
            });

            return;
          }

          messenger.sendSelfMsg({
            socket,
            message: {
              text: ['Successfully declined invitation'],
              text_se: ['Lyckades avböja inbjudan'],
            },
          });
        });
      }
    });
  });
}

exports.handle = handle;
