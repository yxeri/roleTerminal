'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const databaseConnector = require('../databaseConnector');
const deviceConnector = require('./device');
const locationConnector = require('./location');

// Access levels: Lowest / Lower / Middle / Higher / Highest / God
// 1 / 3 / 5 / 7 / 9 / 11

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  socketId: String,
  accessLevel: { type: Number, default: 1 },
  visibility: { type: Number, default: 1 },
  rooms: [{ type: String, unique: true }],
  lastOnline: Date,
  verified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  registerDevice: String,
  team: String,
  authGroups: [{ type: String, unique: true }],
  mode: String,
  isTracked: Boolean,
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

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

function updateUserIsTracked(userName, value, callback) {
  const update = { $set: { isTracked: value } };

  updateUserValue(userName, update, callback);
}

function updateUserTeam(userName, value, callback) {
  const update = { $set: { team: value } };

  updateUserValue(userName, update, callback);
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

function getUserByDevice(deviceCode, callback) {
  deviceConnector.getDevice(deviceCode, (err, device) => {
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
      databaseConnector.saveObject(newUser, 'user', callback);
    } else {
      callback(err, null);
    }
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

function updateUserMode(userName, mode, callback) {
  const update = { mode };

  updateUserValue(userName, update, callback);
}

function verifyUser(sentUserName, callback) {
  const query = { userName: sentUserName };

  databaseConnector.verifyObject(query, User, 'user', callback);
}

function verifyAllUsers(callback) {
  const query = { verified: false };

  databaseConnector.verifyAllObjects(query, User, 'users', callback);
}

/**
 * Gets all user
 * @param {Object} sentUser - User that is checking for all users
 * @param {Function} callback - Function to be called on completion
 */
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

function getAllUserPositions(sentUser, callback) {
  const query = { visibility: { $lte: sentUser.accessLevel } };
  const sort = { userName: 1 };
  const filter = { _id: 0, userName: 1 };

  User.find(query, filter).sort(sort).lean().exec((err, users) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all users and positions'],
        err,
      });
    } else if (users !== null) {
      const userNames = users.map(user => user.userName);

      locationConnector.getPositions(userNames, (mapErr, userPositions) => {
        if (mapErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get all user positions'],
            err,
          });
        }

        callback(err, userPositions);
      });
    } else {
      callback(err, null);
    }
  });
}

function getUserPositions(sentUser, sentUserName, callback) {
  const query = {
    $and: [
      { visibility: { $lte: sentUser.accessLevel } },
      { userName: sentUserName },
    ],
  };
  const filter = { _id: 0 };

  User.findOne(query, filter).lean().exec((err, user) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get user and positions'],
        err,
      });
    } else if (user !== null) {
      locationConnector.getPosition(sentUserName, (mapErr, mapPosition) => {
        if (mapErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.db,
            text: ['Failed to get user positions'],
            err,
          });
        }

        callback(mapErr, mapPosition);
      });
    } else {
      callback(err, null);
    }
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

function matchPartialUser(partialName, user, callback) {
  const filter = { _id: 0, userName: 1 };
  const sort = { userName: 1 };

  databaseConnector.matchPartial({
    filter,
    sort,
    partialName,
    user,
    queryType: User,
    callback,
  });
}

exports.getUserById = getUserById;
exports.authUser = authUser;
exports.createUser = createUser;
exports.updateUserSocketId = updateUserSocketId;
exports.getAllUsers = getAllUsers;
exports.getAllUserPositions = getAllUserPositions;
exports.getUserPosition = getUserPositions;
exports.addRoomToUser = addRoomToUser;
exports.removeRoomFromUser = removeRoomFromUser;
exports.setUserLastOnline = setUserLastOnline;
exports.updateUserPassword = updateUserPassword;
exports.verifyUser = verifyUser;
exports.getUnverifiedUsers = getUnverifiedUsers;
exports.verifyAllUsers = verifyAllUsers;
exports.banUser = banUser;
exports.unbanUser = unbanUser;
exports.getBannedUsers = getBannedUsers;
exports.populateDbUsers = populateDbUsers;
exports.updateUserVisibility = updateUserVisibility;
exports.updateUserAccessLevel = updateUserAccessLevel;
exports.updateRoomVisibility = updateRoomVisibility;
exports.updateRoomAccessLevel = updateRoomAccessLevel;
exports.addGroupToUser = addGroupToUser;
exports.updateUserOnline = updateUserOnline;
exports.getUserByDevice = getUserByDevice;
exports.updateUserMode = updateUserMode;
exports.getUser = getUser;
exports.updateUserTeam = updateUserTeam;
exports.matchPartialUser = matchPartialUser;
exports.getUsersFollowingRoom = getUsersFollowingRoom;
exports.removeRoomFromAllUsers = removeRoomFromAllUsers;
exports.updateUserIsTracked = updateUserIsTracked;
