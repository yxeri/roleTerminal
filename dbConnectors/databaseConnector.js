'use strict';

const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const appConfig = require('./../config/defaults/config').app;
const logger = require('./../utils/logger');
const objectValidator = require('./../utils/objectValidator');
const dbPath = `mongodb://${appConfig.dbHost}:${appConfig.dbPort}/${appConfig.dbName}`;

mongoose.connect(dbPath, (err) => {
  if (err) {
    logger.sendErrorMsg({
      code: logger.ErrorCodes.db,
      text: ['Failed to connect to database'],
      err,
    });
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
  verified: Boolean,
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
  const query = { userName };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err,
      });
    }

    callback(err, user);
  });
}

function updateMissionValue(missionId, update, callback) {
  const query = { _id: missionId };

  Mission.findOneAndUpdate(query, update).lean().exec((err, mission) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update mission'],
        err,
      });
    }

    callback(err, mission);
  });
}

function saveObject(object, objectName, callback) {
  object.save((saveErr, savedObj) => {
    if (saveErr) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to save ${objectName}`],
        err: saveErr,
      });
    }

    callback(saveErr, savedObj);
  });
}

function verifyObject(query, object, objectName, callback) {
  const update = { $set: { verified: true } };

  object.findOneAndUpdate(query, update).lean().exec((err, verified) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to verify ${objectName}`],
        err,
      });
    }

    callback(err, verified);
  });
}

function verifyAllObjects(query, object, objectName, callback) {
  const update = { $set: { verified: true } };
  const options = { multi: true };

  object.update(query, update, options).lean().exec((err, verified) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to verify all ${objectName}`],
        err,
      });
    }

    callback(err, verified);
  });
}

function createMission(sentMission, callback) {
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

  Mission.find(query, filter).lean().exec((err, missions) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get active missions'],
        err,
      });
    }

    callback(err, missions);
  });
}

function getAllMissions(callback) {
  const query = { };
  const filter = { _id: 0 };

  Mission.find(query, filter).lean().exec((err, missions) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all missions'],
        err,
      });
    }

    callback(err, missions);
  });
}

function createWeather(sentWeather, callback) {
  const newWeather = new Weather(sentWeather);

  saveObject(newWeather, 'weather', callback);
}

function getWeather(sentTime, callback) {
  const query = { time: { $gte: sentTime } };
  const filter = { _id: 0 };

  Weather.findOne(query, filter).lean().exec((err, foundWeather) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get weather'],
        err,
      });
    }

    callback(err, foundWeather);
  });
}

function updateUserTeam(userName, value, callback) {
  const update = { team: value };

  updateUserValue(userName, update, callback);
}

function createTeam(team, callback) {
  const newTeam = new Team(team);
  const query = { teamName: team.teamName };

  Team.findOne(query).lean().exec((err, foundTeam) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if team already exists'],
        err,
      });
    } else if (foundTeam === null) {
      saveObject(newTeam, 'team', callback);
    } else {
      callback(err, null);
    }
  });
}

function updateDeviceAlias(deviceId, value, callback) {
  const query = { deviceId };
  const update = { $set: { deviceAlias: value } };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    (err, device) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device Id'],
          err,
        });
      }

      callback(err, device);
    }
  );
}

function updateDeviceSocketId(deviceId, socketId, user, callback) {
  const query = { deviceId };
  const update = {
    $set: {
      socketId,
      lastUser: user,
    },
  };
  const options = { new: true };

  Device.findOneAndUpdate(query, update, options).lean().exec(
    (err, device) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update device socket Id'],
          err,
        });
        callback(err, null);
      } else if (device === null) {
        const newDevice = new Device({
          deviceId,
          socketId,
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
    (err, cmd) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command visibility'],
          err,
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
    (err, cmd) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command access level'],
          err,
        });
      }

      callback(err, cmd);
    }
  );
}

function addGroupToUser(userName, group, callback) {
  const query = { userName };
  const update = { $push: { group } };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err,
      });
    }

    callback(err, user);
  });
}

function getAllCommands(callback) {
  const filter = { _id: 0 };

  Command.find({}, filter).lean().exec((err, commands) => {
    if (err || commands === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all command'],
        err,
      });
    }

    callback(err, commands);
  });
}

function getUserByDevice(deviceCode, callback) {
  const query = { $or: [{ deviceId: deviceCode }, { deviceAlias: deviceCode }] };

  Device.findOne(query).lean().exec((err, device) => {
    if (err || device === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get device'],
        err,
      });
      callback(err, null);
    } else {
      const userQuery = { socketId: device.socketId };

      User.findOne(userQuery).lean().exec((userErr, user) => {
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

  Device.findOne(query).lean().exec((err, device) => {
    if (err || device === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get device'],
        err,
      });
    }

    callback(err, device);
  });
}

function getUserById(sentSocketId, callback) {
  const query = { socketId: sentSocketId };
  const filter = { _id: 0 };

  User.findOne(query, filter).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get user'],
        err,
      });
    }

    callback(err, user);
  });
}

function authUser(sentUserName, sentPassword, callback) {
  const query = {
    $and: [{ userName: sentUserName }, { password: sentPassword }],
  };

  User.findOne(query).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to login'],
        err,
      });
    }

    callback(err, user);
  });
}

function getTeam(teamName, callback) {
  const query = { teamName };
  const filter = { _id: 0 };

  Team.findOne(query, filter).lean().exec((err, team) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get team'],
        err,
      });
    }

    callback(err, team);
  });
}

function getUser(userName, callback) {
  const query = { userName };
  const filter = { _id: 0, password: 0 };

  User.findOne(query, filter).lean().exec((err, foundUser) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to find user'],
        err,
      });
    }

    callback(err, foundUser);
  });
}

function createUser(user, callback) {
  const newUser = new User(user);

  getUser(user.userName, (err, foundUser) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if user exists'],
        err,
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

  History.findOneAndUpdate(query, update, options).lean().exec((err, history) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add message to history'],
        err,
      });
    }

    callback(err, history);
  });
}

function getHistoryFromRoom(roomName, callback) {
  const query = { roomName };
  const filter = { 'messages._id': 0, _id: 0 };

  History.find(query, filter).lean().exec((err, history) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get history'],
        err,
      });
    }

    callback(err, history);
  });
}

function getHistoryFromRooms(rooms, callback) {
  const query = { roomName: { $in: rooms } };
  const filter = { 'messages._id': 0, _id: 0 };

  History.find(query, filter).lean().exec((err, history) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to retrieve all history from rooms'],
        err,
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
  const update = { mode };

  updateUserValue(userName, update, callback);
}

function verifyUser(sentUserName, callback) {
  const query = { userName: sentUserName };

  verifyObject(query, User, 'user', callback);
}

function verifyAllUsers(callback) {
  const query = { verified: false };

  verifyAllObjects(query, User, 'users', callback);
}

function verifyTeam(teamName, callback) {
  const query = { teamName };
  verifyObject(query, Team, 'team', callback);
}

function verifyAllTeams(callback) {
  const query = { verified: false };

  verifyAllObjects(query, Team, 'teams', callback);
}

function getAllDevices(callback) {
  const query = {};
  const filter = { _id: 0 };

  Device.find(query, filter).lean().exec((err, devices) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all devices'],
        err,
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

  Room.findOne(query).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check auth against room'],
        err,
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
  Room.findOne(query).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to find if room already exists'],
        err,
      });
      // Room doesn't exist in the collection, so let's add it!
    } else if (room === null) {
      // Checks if history for room already exists
      History.findOne(query).lean().exec((histErr, history) => {
        if (histErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to find if history already exists'],
            err: histErr,
          });
          // History doesn't exist in the collection, so let's add it and the room!
        } else if (history === null) {
          newHistory.save((saveErr, saveHistory) => {
            if (saveErr || saveHistory === null) {
              logger.sendErrorMsg({
                code: logger.ErrorCodes.db,
                text: ['Failed to save history'],
                err: saveErr,
              });
            } else {
              newRoom.save((roomSaveErr, saveRoom) => {
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

  User.find(query, filter).sort(sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to list users'],
        err,
      });
    }

    callback(err, users);
  });
}

function getRoom(sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const filter = { _id: 0 };

  Room.findOne(query, filter).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to get room ${sentRoomName}`],
        err,
      });
    }

    callback(err, room);
  });
}

function getOwnedRooms(sentUser, callback) {
  const query = { owner: sentUser.userName };
  const sort = { roomName: 1 };
  const filter = { _id: 0 };

  Room.find(query, filter).sort(sort).lean().exec((err, rooms) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get owned rooms'],
        err,
      });
    }

    callback(err, rooms);
  });
}

function getAllRooms(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { roomName: 1 };
  const filter = { _id: 0 };

  Room.find(query, filter).sort(sort).lean().exec((err, rooms) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to list rooms'],
        err,
      });
    }

    callback(err, rooms);
  });
}

function getAllUserLocations(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { userName: 1 };
  const filter = { _id: 0, userName: 1, position: 1 };

  User.find(query, filter).sort(sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all user locations'],
        err,
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

  User.findOne(query, filter).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all user locations'],
        err,
      });
    }

    callback(err, user);
  });
}

function getUsersFollowingRoom(roomName, callback) {
  const query = { rooms: { $in: [roomName] } };
  const filter = { rooms: 1, socketId: 1 };

  User.find(query, filter).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to get users following room ${roomName}`],
        err,
      });
    }

    callback(err, users);
  });
}

function addRoomToUser(sentUserName, sentRoomName, callback) {
  const query = { userName: sentUserName };
  const update = { $addToSet: { rooms: sentRoomName } };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err || user === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to add room to user'],
        err,
      });
    }

    callback(err, user);
  });
}

function removeRoomFromUser(sentUserName, sentRoomName, callback) {
  const query = { userName: sentUserName };
  const update = { $pull: { rooms: sentRoomName } };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to remove room ${sentRoomName} from user`],
        err,
      });
    }

    callback(err, user);
  });
}

function removeRoomFromAllUsers(roomName, callback) {
  const query = { rooms: { $in: [roomName] } };
  const update = { $pull: { rooms: roomName } };
  const options = { multi: true };

  User.update(query, update, options).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to remove room ${roomName} from all users`],
        err,
      });
    }

    callback(err, users);
  });
}

function getInvitations(userName, callback) {
  const query = { userName };

  InvitationList.findOne(query).lean().exec((err, list) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to get invitations for ${userName}`],
        err,
      });
    }

    callback(err, list);
  });
}

function addInvitationToList(userName, invitation, callback) {
  const query = {
    $and: [
      { userName },
      { 'invitations.itemName': invitation.itemName },
      { 'invitations.invitationType': invitation.invitationType },
    ],
  };

  InvitationList.findOne(query).lean().exec((invErr, invitationList) => {
    if (invErr || invitationList) {
      if (invErr && (!invErr.code || invErr.code !== 11000)) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: [`Failed to find invitation list to add invitation to user ${userName}`],
          err: invErr,
        });
      }

      callback(invErr, invitationList);
    } else {
      const update = { $push: { invitations: invitation } };
      const options = { new: true, upsert: true };

      InvitationList.update({ userName }, update, options).lean().exec((updErr) => {
        if (updErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: [`Failed to add invitation to user ${userName} list`],
            err: invErr,
          });
        }

        callback(updErr, invitationList);
      });
    }
  });
}

function removeInvitationFromList(userName, itemName, invitationType, callback) {
  const query = { userName };
  const update = { $pull: { invitations: { itemName, invitationType } } };

  InvitationList.findOneAndUpdate(query, update).lean().exec((err, invitationList) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to remove invitation from ${itemName} of type ${invitationType} to ${userName}`],
        err,
      });
    }

    callback(err, invitationList);
  });
}

function removeInvitationTypeFromList(userName, invitationType, callback) {
  const query = { userName };
  const update = { $pull: { invitations: { invitationType } } };
  const options = { multi: true };

  InvitationList.update(query, update, options).lean().exec((err, invitationList) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to remove invitations of type ${invitationType}`],
        err,
      });
    }

    callback(err, invitationList);
  });
}

function setUserLastOnline(sentUserName, sentDate, callback) {
  const query = { userName: sentUserName };
  const update = { lastOnline: sentDate };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to update last online on ${sentUserName}`],
        err,
      });
    }

    callback(err, user);
  });
}

function getUnverifiedUsers(callback) {
  const query = { verified: false };
  const filter = { _id: 0 };
  const sort = { userName: 1 };

  User.find(query, filter).sort(sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get unverified users'],
        err,
      });
    }

    callback(err, users);
  });
}

function getUnverifiedTeams(callback) {
  const query = { verified: false };
  const filter = { _id: 0 };
  const sort = { teamName: 1 };

  Team.find(query, filter).sort(sort).lean().exec((err, teams) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get unverified teams'],
        err,
      });
    }

    callback(err, teams);
  });
}

function banUser(sentUserName, callback) {
  const query = { userName: sentUserName };
  const update = { banned: true, socketId: '' };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to ban user'],
        err,
      });
    }

    callback(err, user);
  });
}

function banUserFromRoom(sentUserName, sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const update = { $addToSet: { bannedUsers: sentUserName } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to ban user ${sentUserName} from room ${sentRoomName}`],
        err,
      });
    }

    callback(err, room);
  });
}

function unbanUserFromRoom(sentUserName, sentRoomName, callback) {
  const query = { roomName: sentRoomName };
  const update = { $pull: { bannedUsers: sentUserName } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to unban user ${sentUserName} from room ${sentRoomName}`],
        err,
      });
    }

    callback(err, room);
  });
}

function unbanUser(sentUserName, callback) {
  const query = { userName: sentUserName };
  const update = { banned: false };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to unban user'],
        err,
      });
    }

    callback(err, user);
  });
}

function getBannedUsers(callback) {
  const query = { banned: true };
  const filter = { userName: 1, _id: 0 };
  const sort = { userName: 1 };

  User.find(query, filter).sort(sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get banned users'],
        err,
      });
    }

    callback(err, users);
  });
}

function createEvent(sentReceiverName, sentEndAt, callback) {
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

  ScheduledEvent.find(query, filter).lean().exec((err, events) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to trigger events'],
        err,
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

  Room.findOneAndRemove(query).lean().exec((err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to remove room'],
        err,
      });
    } else if (room !== null) {
      History.findOneAndRemove({ roomName: sentRoomName }).lean().exec((histErr, history) => {
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
  const roomCallback = (err, room) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to create room'],
        err,
      });
    } else if (room !== null) {
      logger.sendInfoMsg(`PopulateDb: [success] Created room ${room.roomName}`);
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
  User.count({}).exec((err, userCount) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to count users'],
        err,
      });
    } else if (userCount < 1) {
      const userKeys = Object.keys(sentUsers);
      const callback = (userErr, user) => {
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

        createUser(user, callback);
      }
    } else {
      logger.sendInfoMsg('PopulateDb: [success] DB has at least one user');
    }
  });
}

function populateDbCommands(sentCommands) {
  const cmdKeys = Object.keys(sentCommands);
  const callback = (err) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to update command'],
        err,
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
  const query = { userName };
  const update = { accessLevel: value };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update user'],
        err,
      });
    }

    callback(err, user);
  });
}

function updateRoomVisibility(roomName, value, callback) {
  const query = { roomName };
  const update = { visibility: value };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update room'],
        err,
      });
    }

    callback(err, user);
  });
}

function updateRoomAccessLevel(roomName, value, callback) {
  const query = { roomName };
  const update = { accessLevel: value };

  User.findOneAndUpdate(query, update).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to update room'],
        err,
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
  const query = { commandName };

  Command.findOne(query).lean().exec((err, command) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get command'],
        err,
      });
    }

    callback(err, command);
  });
}

function matchPartial(params) {
  if (!objectValidator.isValidData(params, { filter: true, sort: true, user: true, queryType: true, callback: true })) {
    if (params.callback) {
      params.callback(null, null);
    }

    return;
  }

  let query;

  if (params.partialName) {
    query = {
      $and: [
        { userName: { $regex: `^${params.partialName}.*` } },
        { visibility: { $lte: params.user.accessLevel } },
      ],
    };
  } else {
    query = { visibility: { $lte: params.user.accessLevel } };
  }

  params.queryType.find(query, params.filter).sort(params.sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['matchPartial'],
        err,
      });
    }

    params.callback(err, users);
  });
}

function matchPartialUser(partialName, user, callback) {
  const filter = { _id: 0, userName: 1 };
  const sort = { userName: 1 };

  matchPartial({
    filter,
    sort,
    partialName,
    user,
    queryType: User,
    callback,
  });
}

function matchPartialRoom(partialName, user, callback) {
  const filter = { _id: 0, roomName: 1 };
  const sort = { roomName: 1 };

  matchPartial({
    filter,
    sort,
    partialName,
    user,
    queryType: Room,
    callback,
  });
}

exports.getCommand = getCommand;
exports.getUserById = getUserById;
exports.authUser = authUser;
exports.createUser = createUser;
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
exports.createEvent = createEvent;
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
exports.createTeam = createTeam;
exports.getTeam = getTeam;
exports.createWeather = createWeather;
exports.getWeather = getWeather;
exports.createMission = createMission;
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
exports.verifyTeam = verifyTeam;
exports.verifyAllTeams = verifyAllTeams;
exports.getUnverifiedTeams = getUnverifiedTeams;
exports.getUsersFollowingRoom = getUsersFollowingRoom;
exports.removeRoomFromAllUsers = removeRoomFromAllUsers;
