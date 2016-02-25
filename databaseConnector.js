'use strict';

const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const appConfig = require('rolehaven-config').app;
const logger = require('./logger');
const dbPath = 'mongodb://' +
               appConfig.dbHost + ':' +
               appConfig.dbPort + '/' +
               appConfig.dbName;

mongoose.connect(dbPath, function(err) {
  if (err) {
    logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to connect to database', err);
  } else {
    logger.sendInfoMsg('Connection established to database');
  }
});

// Access levels: Lowest / Lower / Middle / Higher / Highest / God
// 1 / 3 / 5 / 7 / 9 / 11

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  socketId: String,
  accessLevel: { type: Number, default: 1 },
  visibility: { type: Number, default: 1 },
  rooms: [{ type: String, unique: true }],
  position: {},
  lastOnline: Date,
  verified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  registerDevice: String,
  team: String,
  authGroups: [{ type: String, unique: true }],
  mode: String,
}, { collection: 'users' });
const roomSchema = new mongoose.Schema({
  roomName: { type: String, unique: true },
  password: { type: String, default: '' },
  accessLevel: { type: Number, default: 1 },
  visibility: { type: Number, default: 1 },
  commands: [{
    commandName: String,
    accessLevel: Number,
    requireAdmin: Boolean,
  }],
  admins: [{ type: String, unique: true }],
  bannedUsers: [{ type: String, unique: true }],
  owner: String,
  team: String,
}, { collection: 'rooms' });
const historySchema = new mongoose.Schema({
  roomName: { type: String, unique: true },
  messages: [{
    text: [String],
    time: Date,
    userName: String,
    roomName: String,
    extraClass: String,
    customSender: String,
    morseCode: String,
  }],
}, { collection: 'histories' });
const commandSchema = new mongoose.Schema({
  commandName: String,
  accessLevel: Number,
  visibility: Number,
  authGroup: String,
  category: String,
}, { collection: 'commands' });
const scheduledEventSchema = new mongoose.Schema({
  receiverName: String,
  func: {},
  createdAt: Date,
  endAt: Date,
}, { collection: 'events' });
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, unique: true },
  socketId: String,
  deviceAlias: { type: String, unique: true },
  lastUser: String,
}, { collection: 'devices' });
const teamSchema = new mongoose.Schema({
  teamName: String,
  owner: String,
  admins: [{ type: String, unique: true }],
}, { collection: 'teams' });
const weatherSchema = new mongoose.Schema({
  time: { type: Date, unique: true },
  temperature: Number,
  windSpeed: Number,
  precipitation: Number,
  precipType: Number,
  coverage: Number,
  viewDistance: Number,
  windDirection: Number,
  thunderRisk: Number,
}, { collection: 'weather' });
const missionSchema = new mongoose.Schema({
  timeCreated: Date,
  completed: { type: Boolean, default: false },
  reward: String,
  title: String,
  description: String,
  requirement: String,
  creator: String,
  agent: String,
  applicationRequired: { type: Boolean, default: false },
  missionType: String,
  visibility: Number,
  accessLevel: Number,
}, { collection: 'missions' });
const invitationListSchema = new mongoose.Schema({
  userName: { type: String, unique: true, index: true },
  invitations: [{
    invitationType: String,
    itemName: String,
    sender: String,
    time: Date,
  }],
}, { collection: 'invitationLists' });

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const History = mongoose.model('History', historySchema);
const Command = mongoose.model('Command', commandSchema);
const ScheduledEvent = mongoose.model('ScheduledEvent', scheduledEventSchema);
const Device = mongoose.model('Device', deviceSchema);
const Team = mongoose.model('Team', teamSchema);
const Weather = mongoose.model('Weather', weatherSchema);
const Mission = mongoose.model('Mission', missionSchema);
const InvitationList = mongoose.model('InvitationList', invitationListSchema);

function updateUserValue(userName, update, callback) {
  const query = { userName: userName };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function updateMissionValue(missionId, update, callback) {
  const query = { _id: missionId };

  Mission.findOneAndUpdate(query, update).lean().exec(function(err, mission) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update mission'],
        err: err,
      });
    }

    callback(err, mission);
  });
}

function saveObject(object, objectName, callback) {
  object.save(function(saveErr, savedObj) {
    if (saveErr) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to save ' + objectName],
        err: saveErr,
      });
    }

    callback(saveErr, savedObj);
  });
}

function addMission(sentMission, callback) {
  const newMission = new Mission(sentMission);

  saveObject(newMission, 'mission', callback);
}

function updateMissionCompleted(missionIdString, value, callback) {
  const update = { completed: value };

  updateMissionValue(new ObjectId(missionIdString), update, callback);
}

function updateMissionReward(missionIdString, value, callback) {
  const update = { reward: value };

  updateMissionValue(new ObjectId(missionIdString), update, callback);
}

function getActiveMissions(callback) {
  const query = { completed: false };
  const filter = { _id: 0 };

  Mission.find(query, filter).lean().exec(function(err, missions) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get active missions'],
        err: err,
      });
    }

    callback(err, missions);
  });
}

function getAllMissions(callback) {
  const query = { };
  const filter = { _id: 0 };

  Mission.find(query, filter).lean().exec(function(err, missions) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all missions'],
        err: err,
      });
    }

    callback(err, missions);
  });
}

function addWeather(sentWeather, callback) {
  const newWeather = new Weather(sentWeather);

  saveObject(newWeather, 'weather', callback);
}

function getWeather(sentTime, callback) {
  const query = { time: { $gte: sentTime } };
  const filter = { _id: 0 };

  Weather.findOne(query, filter).lean().exec(function(err, foundWeather) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get weather'],
        err: err,
      });
    }

    callback(err, foundWeather);
  });
}

function updateUserTeam(userName, value, callback) {
  const update = { team: value };

  updateUserValue(userName, update, callback);
}

function addTeam(team, callback) {
  const newTeam = new Team(team);
  const query = { teamName: team.teamName };

  Team.findOne(query).lean().exec(function(err, foundTeam) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if team already exists'],
        err: err,
      });
    } else if (foundTeam === null) {
      saveObject(newTeam, 'team', callback);
    } else {
      callback(err, null);
    }
  });
}

function updateDeviceAlias(deviceId, value, callback) {
  const query = { deviceId: deviceId };
  const update = { $set: { deviceAlias: value } };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    function(err, device) {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device Id'],
          err: err,
        });
      }

      callback(err, device);
    }
  );
}

function updateDeviceSocketId(deviceId, socketId, user, callback) {
  const query = { deviceId: deviceId };
  const update = {
    $set: {
      socketId: socketId,
      lastUser: user,
    },
  };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    function(err, device) {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device socket Id'],
          err: err,
        });
        callback(err, null);
      } else if (device === null) {
        const newDevice = new Device({
          deviceId: deviceId,
          socketId: socketId,
          lastUser: user,
          deviceAlias: deviceId,
        });

        saveObject(newDevice, 'device', callback);
      } else {
        callback(err, device);
      }
    }
  );
}

function updateCommandVisibility(cmdName, value, callback) {
  const query = { commandName: cmdName };
  const update = { $set: { visibility: value } };
  const options = { new: true };

  Command.findOneAndUpdate(query, update, options).lean().exec(
    function(err, cmd) {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command visibility'],
          err: err,
        });
      }

      callback(err, cmd);
    }
  );
}

function updateCommandAccessLevel(cmdName, value, callback) {
  const query = { commandName: cmdName };
  const update = { $set: { accessLevel: value } };
  const options = { new: true };

  Command.findOneAndUpdate(query, update, options).lean().exec(
    function(err, cmd) {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command access level'],
          err: err,
        });
      }

      callback(err, cmd);
    }
  );
}

function addGroupToUser(userName, group, callback) {
  const query = { userName: userName };
  const update = { $push: { group: group } };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function getAllCommands(callback) {
  const filter = { _id: 0 };

  Command.find({}, filter).lean().exec(function(err, commands) {
    if (err || commands === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all command'],
        err: err,
      });
    }

    callback(err, commands);
  });
}

function getUserByDevice(deviceCode, callback) {
  const query = { $or: [{ deviceId: deviceCode }, { deviceAlias: deviceCode }] };

  Device.findOne(query).lean().exec(function(err, device) {
    if (err || device === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get device'],
        err: err,
      });
      callback(err, null);
    } else {
      const userQuery = { socketId: device.socketId };

      User.findOne(userQuery).lean().exec(function(userErr, user) {
        if (userErr || user === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get user by device'],
            err: userErr,
          });
        }

        callback(userErr, user);
      });
    }
  });
}

function getDevice(deviceCode, callback) {
  const query = { $or: [{ deviceId: deviceCode }, { deviceAlias: deviceCode }] };

  Device.findOne(query).lean().exec(function(err, device) {
    if (err || device === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get device'],
        err: err,
      });
    }

    callback(err, device);
  });
}

function getUserById(sentSocketId, callback) {
  const query = { socketId: sentSocketId };
  const filter = { _id: 0 };

  User.findOne(query, filter).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function authUser(sentUserName, sentPassword, callback) {
  const query = {
    $and: [{ userName: sentUserName }, { password: sentPassword }],
  };

  User.findOne(query).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to login'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function getTeam(teamName, callback) {
  const query = { teamName: teamName };
  const filter = { _id: 0 };

  Team.findOne(query, filter).lean().exec(function(err, team) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get team'],
        err: err,
      });
    }

    callback(err, team);
  });
}

function getUser(userName, callback) {
  const query = { userName: userName };
  const filter = { userName: 1, team: 1 };

  User.findOne(query, filter).lean().exec(function(err, foundUser) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to find user'],
        err: err,
      });
    }

    callback(err, foundUser);
  });
}

function addUser(user, callback) {
  const newUser = new User(user);

  getUser(user.userName, function(err, foundUser) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if user exists'],
        err: err,
      });
    } else if (foundUser === null) {
      saveObject(newUser, 'user', callback);
    } else {
      callback(err, null);
    }
  });
}

function addMsgToHistory(sentRoomName, sentMessage, callback) {
  const query = { roomName: sentRoomName };
  const update = { $push: { messages: sentMessage } };
  const options = { upsert: true, new: true };

  History.findOneAndUpdate(query, update, options).lean().exec(function(err, history) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add message to history'],
        err: err,
      });
    }

    callback(err, history);
  });
}

function getHistoryFromRoom(roomName, callback) {
  const query = { roomName: roomName };
  const filter = { 'messages._id': 0, _id: 0 };

  History.find(query, filter).lean().exec(function(err, history) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get history'],
        err: err,
      });
    }

    callback(err, history);
  });
}

function getHistoryFromRooms(rooms, callback) {
  const query = { roomName: { $in: rooms } };
  const filter = { 'messages._id': 0, _id: 0 };

  History.find(query, filter).lean().exec(function(err, history) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to retrieve all history from rooms'],
        err: err,
      });
    }

    callback(err, history);
  });
}

function updateUserSocketId(userName, value, callback) {
  const update = { socketId: value, online: true };

  updateUserValue(userName, update, callback);
}

function updateUserOnline(userName, value, callback) {
  const update = { online: value };

  updateUserValue(userName, update, callback);
}

function updateUserLocation(userName, sentPosition, callback) {
  const update = { position: sentPosition };

  updateUserValue(userName, update, callback);
}

function updateUserMode(userName, mode, callback) {
  const update = { mode: mode };

  updateUserValue(userName, update, callback);
}

function verifyUser(sentUserName, callback) {
  const query = { userName: sentUserName };
  const newVarupdate = { verified: true };

  User.findOneAndUpdate(query, newVarupdate).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to verify user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function verifyAllUsers(callback) {
  const query = { verified: false };
  const update = { $set: { verified: true } };
  const options = { multi: true };

  User.update(query, update, options).lean().exec(function(err) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to verify all user'],
        err: err,
      });
    }

    callback(err);
  });
}

function getAllDevices(callback) {
  const query = {};
  const filter = { _id: 0 };

  Device.find(query, filter).lean().exec(function(err, devices) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all devices'],
        err: err,
      });
    }

    callback(err, devices);
  });
}

function authUserToRoom(sentUser, sentRoomName, sentPassword, callback) {
  const query = {
    $and: [
      { accessLevel: { $lte: sentUser.accessLevel } },
      { roomName: sentRoomName },
      { password: sentPassword },
    ],
  };

  Room.findOne(query).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check auth against room'],
        err: err,
      });
    }

    callback(err, room);
  });
}

// TODO Move findOne for user to outside of the database function
function createRoom(sentRoom, sentUser, callback) {
  const newRoom = new Room(sentRoom);
  const newHistory = new History({ roomName: sentRoom.roomName });
  let query;

  if (sentUser && sentUser.accessLevel < 11) {
    query = {
      $or: [
        { roomName: sentRoom.roomName },
        { owner: sentRoom.owner },
      ],
    };
  } else {
    query = { roomName: sentRoom.roomName };
  }

  // Checks if room already exists
  Room.findOne(query).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to find if room already exists'],
        err: err,
      });
      // Room doesn't exist in the collection, so let's add it!
    } else if (room === null) {
      // Checks if history for room already exists
      History.findOne(query).lean().exec(function(histErr, history) {
        if (histErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to find if history already exists'],
            err: histErr,
          });
          // History doesn't exist in the collection, so let's add it and the room!
        } else if (history === null) {
          newHistory.save(function(saveErr, saveHistory) {
            if (saveErr || saveHistory === null) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.db,
                text: ['Failed to save history'],
                err: saveErr,
              });
            } else {
              newRoom.save(function(roomSaveErr, saveRoom) {
                if (roomSaveErr) {
                  logger.sendErrorMsg({
                    code: logger.ErrorCodes.db,
                    text: ['Failed to save room'],
                    err: roomSaveErr,
                  });
                }

                callback(roomSaveErr, saveRoom);
              });
            }
          });
        }
      });
    } else {
      callback(err, null);
    }
  });
}

function getAllUsers(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { userName: 1 };
  const filter = { _id: 0 };

  User.find(query, filter).sort(sort).lean().exec(function(err, users) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to list users'],
        err: err,
      });
    }

    callback(err, users);
  });
}

function getRoom(sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const filter = { _id: 0 };

  Room.findOne(query, filter).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get room ' + sentRoomName],
        err: err,
      });
    }

    callback(err, room);
  });
}

function getOwnedRooms(sentUser, callback) {
  const query = { owner: sentUser.userName };
  const sort = { roomName: 1 };
  const filter = { _id: 0 };

  Room.find(query, filter).sort(sort).lean().exec(function(err, rooms) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get owned rooms'],
        err: err,
      });
    }

    callback(err, rooms);
  });
}

function getAllRooms(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { roomName: 1 };
  const filter = { _id: 0 };

  Room.find(query, filter).sort(sort).lean().exec(function(err, rooms) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to list rooms'],
        err: err,
      });
    }

    callback(err, rooms);
  });
}

function getAllUserLocations(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { userName: 1 };
  const filter = { _id: 0, userName: 1, position: 1 };

  User.find(query, filter).sort(sort).lean().exec(function(err, users) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all user locations'],
        err: err,
      });
    }

    callback(err, users);
  });
}

function getUserLocation(sentUser, sentUserName, callback) {
  const query = {
    $and: [
      { visibility: { $lte: sentUser.accessLevel } },
      { userName: sentUserName },
    ],
  };
  const filter = { _id: 0, userName: 1, position: 1 };

  User.findOne(query, filter).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all user locations'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function addRoomToUser(sentUserName, sentRoomName, callback) {
  const query = { userName: sentUserName };
  const update = { $addToSet: { rooms: sentRoomName } };

  User.findOneAndUpdate(query, update).lean().exec(function(err) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add room to user'],
        err: err,
      });
    }

    callback(err);
  });
}

function removeRoomFromUser(sentUserName, sentRoomName, callback) {
  const query = { userName: sentUserName };
  const update = { $pull: { rooms: sentRoomName } };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to remove room from user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function getInvitations(userName, callback) {
  const query = { userName: userName};

  InvitationList.findOne(query).lean().exec(function(err, list) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get invitations for ' + userName],
        err: err,
      });
    }

    callback(err, list);
  });
}

function addInvitationToList(userName, invitation, callback) {
  const query = {
    $and: [
      { userName: userName },
      { 'invitations.itemName': invitation.itemName },
      { 'invitations.invitationType': invitation.invitationType },
    ],
  };

  InvitationList.findOne(query).lean().exec(function(invErr, invitationList) {
    if (invErr || invitationList) {
      if (invErr && (!invErr.code || invErr.code !== 11000)) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to find invitation list to add invitation to user ' + userName],
          err: invErr,
        });
      }

      callback(invErr, invitationList);
    } else {
      const update = { $push: { invitations: invitation } };
      const options = { new: true, upsert: true };

      InvitationList.update({ userName: userName }, update, options).lean().exec(function(updErr) {
        if (updErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to add invitation to user ' + userName + ' list'],
            err: invErr,
          });
        }

        callback(updErr, invitationList);
      });
    }
  });
}

function removeInvitationFromList(userName, itemName, invitationType, callback) {
  const query = { userName: userName };
  const update = { $pull: { invitations: { itemName: itemName, type: invitationType } } };

  InvitationList.findOneAndUpdate(query, update).lean().exec(function(err, invitationList) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to remove invitation from ' + itemName + ' of type ' + invitationType + ' to ' + userName],
        err: err,
      });
    }

    callback(err, invitationList);
  });
}

function removeInvitationTypeFromList(userName, invitationType, callback) {
  const query = { userName: userName };
  const update = { $pull: { invitations: { type: invitationType } } };
  const options = { multi: true };

  InvitationList.update(query, update, options).lean().exec(function(err, invitationList) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to remove invitations of type ' + invitationType],
        err: err,
      });
    }

    callback(err, invitationList);
  });
}

function setUserLastOnline(sentUserName, sentDate, callback) {
  const query = { userName: sentUserName };
  const update = { lastOnline: sentDate };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update last online on ' + sentUserName],
        err: err,
      });
    }

    callback(err, user);
  });
}

function getUnverifiedUsers(callback) {
  const query = { verified: false };
  const filter = { _id: 0 };
  const sort = { userName: 1 };

  User.find(query, filter).sort(sort).lean().exec(function(err, users) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get unverified users'],
        err: err,
      });
    }

    callback(err, users);
  });
}

function banUser(sentUserName, callback) {
  const query = { userName: sentUserName };
  const update = { banned: true, socketId: '' };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to ban user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function banUserFromRoom(sentUserName, sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const update = { $addToSet: { bannedUsers: sentUserName } };

  Room.findOneAndUpdate(query, update).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to ban user ' + sentUserName + ' from room ' + sentRoomName],
        err: err,
      });
    }

    callback(err, room);
  });
}

function unbanUserFromRoom(sentUserName, sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const update = { $pull: { bannedUsers: sentUserName } };

  Room.findOneAndUpdate(query, update).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to unban user ' + sentUserName, + ' from room ' + sentRoomName],
        err: err,
      });
    }

    callback(err, room);
  });
}

function unbanUser(sentUserName, callback) {
  const query = { userName: sentUserName };
  const update = { banned: false };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to unban user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function getBannedUsers(callback) {
  const query = { banned: true };
  const filter = { userName: 1, _id: 0 };
  const sort = { userName: 1 };

  User.find(query, filter).sort(sort).lean().exec(function(err, users) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get banned users'],
        err: err,
      });
    }

    callback(err, users);
  });
}

function addEvent(sentReceiverName, sentEndAt, callback) {
  const now = new Date();
  const query = {
    receiverName: sentReceiverName,
    createdAt: now,
    endAt: sentEndAt,
  };
  const newEvent = new ScheduledEvent(query);

  saveObject(newEvent, 'event', callback);
}

function getPassedEvents(callback) {
  const now = new Date();
  const query = { endAt: { $lte: now } };
  const filter = { _id: 0 };

  ScheduledEvent.find(query, filter).lean().exec(function(err, events) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to trigger events'],
        err: err,
      });
    }

    callback(err, events);
  });
}

function removeRoom(sentRoomName, sentUser, callback) {
  let query;

  if (sentUser.accessLevel >= 11) {
    query = { roomName: sentRoomName };
  } else {
    query = {
      $and: [
        { owner: sentUser.userName },
        { roomName: sentRoomName },
      ],
    };
  }

  Room.findOneAndRemove(query).lean().exec(function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to remove room'],
        err: err,
      });
    } else if (room !== null) {
      History.findOneAndRemove({ roomName: sentRoomName }).lean().exec(function(histErr, history) {
        if (histErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to remove history'],
            err: histErr,
          });
        } else if (history !== null) {
          callback(histErr, history);
        } else {
          callback(histErr, null);
        }
      });
    } else {
      callback(err, null);
    }
  });
}

function populateDbRooms(sentRooms, user) {
  const roomCallback = function(err, room) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to create room'],
        err: err,
      });
    } else if (room !== null) {
      logger.sendInfoMsg('PopulateDb: [success] Created room ' + room.roomName);
    }
  };

  const roomKeys = Object.keys(sentRooms);

  logger.sendInfoMsg('PopulateDb: Creating rooms from defaults, if needed');

  for (let i = 0; i < roomKeys.length; i++) {
    const room = sentRooms[roomKeys[i]];

    createRoom(room, user, roomCallback);
  }
}

function populateDbUsers(sentUsers) {
  User.count({}).exec(function(err, userCount) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to count users'],
        err: err,
      });
    } else if (userCount < 1) {
      const userKeys = Object.keys(sentUsers);
      const callback = function(userErr, user) {
        if (userErr || user === null) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['PopulateDb: [failure] Failed to create user'],
            err: userErr,
          });
        } else {
          logger.sendInfoMsg('PopulateDb: [success] Created user', user.userName, user.password);
        }
      };

      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] There are no users'],
      });
      logger.sendInfoMsg('PopulateDb: Creating users from defaults');

      for (let i = 0; i < userKeys.length; i++) {
        const user = sentUsers[userKeys[i]];

        addUser(user, callback);
      }
    } else {
      logger.sendInfoMsg('PopulateDb: [success] DB has at least one user');
    }
  });
}

function populateDbCommands(sentCommands) {
  const cmdKeys = Object.keys(sentCommands);
  const callback = function(err) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to update command'],
        err: err,
      });
    }
  };

  for (let i = 0; i < cmdKeys.length; i++) {
    const command = sentCommands[cmdKeys[i]];
    const query = { commandName: command.commandName };
    const options = { upsert: true };

    Command.findOneAndUpdate(query, command, options).lean().exec(callback);
  }
}

function updateUserVisibility(userName, value, callback) {
  const update = { visibility: value };

  updateUserValue(userName, update, callback);
}

function updateUserAccessLevel(userName, value, callback) {
  const query = { userName: userName };
  const update = { accessLevel: value };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function updateRoomVisibility(roomName, value, callback) {
  const query = { roomName: roomName };
  const update = { visibility: value };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update room'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function updateRoomAccessLevel(roomName, value, callback) {
  const query = { roomName: roomName };
  const update = { accessLevel: value };

  User.findOneAndUpdate(query, update).lean().exec(function(err, user) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update room'],
        err: err,
      });
    }

    callback(err, user);
  });
}

function updateUserPassword(userName, value, callback) {
  const update = { password: value };

  updateUserValue(userName, update, callback);
}

function getCommand(commandName, callback) {
  const query = { commandName: commandName };

  Command.findOne(query).lean().exec(function(err, command) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get command'],
        err: err,
      });
    }

    callback(err, command);
  });
}

function matchPartial(filter, sort, itemName, user, queryType, callback) {
  let query;

  if (itemName) {
    query = {
      $and: [
        { userName: { $regex: '^' + itemName + '.*' } },
        { visibility: { $lte: user.accessLevel } },
      ],
    };
  } else {
    query = { visibility: { $lte: user.accessLevel } };
  }

  queryType.find(query, filter).sort(sort).lean().exec(function(err, users) {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['matchPartial'],
        err: err,
      });
    }

    callback(err, users);
  });
}

function matchPartialUser(partialUserName, user, callback) {
  const filter = { _id: 0, userName: 1 };
  const sort = { userName: 1 };

  matchPartial(filter, sort, partialUserName, user, User, callback);
}

function matchPartialRoom(partialRoomName, user, callback) {
  const filter = { _id: 0, roomName: 1 };
  const sort = { roomName: 1 };

  matchPartial(filter, sort, partialRoomName, user, Room, callback);
}

exports.getCommand = getCommand;
exports.getUserById = getUserById;
exports.authUser = authUser;
exports.addUser = addUser;
exports.updateUserSocketId = updateUserSocketId;
exports.updateUserLocation = updateUserLocation;
exports.authUserToRoom = authUserToRoom;
exports.createRoom = createRoom;
exports.getAllUsers = getAllUsers;
exports.getAllRooms = getAllRooms;
exports.getAllUserLocations = getAllUserLocations;
exports.getUserLocation = getUserLocation;
exports.addRoomToUser = addRoomToUser;
exports.removeRoomFromUser = removeRoomFromUser;
exports.addMsgToHistory = addMsgToHistory;
exports.getHistoryFromRoom = getHistoryFromRoom;
exports.setUserLastOnline = setUserLastOnline;
exports.getHistoryFromRooms = getHistoryFromRooms;
exports.updateUserPassword = updateUserPassword;
exports.verifyUser = verifyUser;
exports.getUnverifiedUsers = getUnverifiedUsers;
exports.verifyAllUsers = verifyAllUsers;
exports.banUser = banUser;
exports.unbanUser = unbanUser;
exports.getBannedUsers = getBannedUsers;
exports.addEvent = addEvent;
exports.getPassedEvents = getPassedEvents;
exports.getRoom = getRoom;
exports.banUserFromRoom = banUserFromRoom;
exports.unbanUserFromRoom = unbanUserFromRoom;
exports.getOwnedRooms = getOwnedRooms;
exports.removeRoom = removeRoom;
exports.populateDbUsers = populateDbUsers;
exports.populateDbRooms = populateDbRooms;
exports.updateUserVisibility = updateUserVisibility;
exports.updateUserAccessLevel = updateUserAccessLevel;
exports.updateRoomVisibility = updateRoomVisibility;
exports.updateRoomAccessLevel = updateRoomAccessLevel;
exports.updateCommandVisibility = updateCommandVisibility;
exports.updateCommandAccessLevel = updateCommandAccessLevel;
exports.addGroupToUser = addGroupToUser;
exports.getAllCommands = getAllCommands;
exports.populateDbCommands = populateDbCommands;
exports.updateDeviceAlias = updateDeviceAlias;
exports.updateDeviceSocketId = updateDeviceSocketId;
exports.updateUserOnline = updateUserOnline;
exports.getUserByDevice = getUserByDevice;
exports.getDevice = getDevice;
exports.getAllDevices = getAllDevices;
exports.updateUserMode = updateUserMode;
exports.getUser = getUser;
exports.updateUserTeam = updateUserTeam;
exports.addTeam = addTeam;
exports.getTeam = getTeam;
exports.addWeather = addWeather;
exports.getWeather = getWeather;
exports.addMission = addMission;
exports.getActiveMissions = getActiveMissions;
exports.getAllMissions = getAllMissions;
exports.updateMissionCompleted = updateMissionCompleted;
exports.updateMissionReward = updateMissionReward;
exports.matchPartialUser = matchPartialUser;
exports.matchPartialRoom = matchPartialRoom;
exports.addInvitationToList = addInvitationToList;
exports.removeInvitationFromList = removeInvitationFromList;
exports.getInvitations = getInvitations;
exports.removeInvitationTypeFromList = removeInvitationTypeFromList;
