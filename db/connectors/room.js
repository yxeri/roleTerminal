'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const databaseConnector = require('../databaseConnector');
const chatHistoryConnector = require('./chatHistory');

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

const Room = mongoose.model('Room', roomSchema);

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
      chatHistoryConnector.createHistory(sentRoom.roomName, (saveErr, saveHistory) => {
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
    } else {
      callback(err, null);
    }
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
      chatHistoryConnector.removeHistory(sentRoomName, (histErr, history) => {
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

function matchPartialRoom(partialName, user, callback) {
  const filter = { _id: 0, roomName: 1 };
  const sort = { roomName: 1 };

  databaseConnector.matchPartial({
    filter,
    sort,
    partialName,
    user,
    queryType: Room,
    callback,
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

exports.authUserToRoom = authUserToRoom;
exports.createRoom = createRoom;
exports.getAllRooms = getAllRooms;
exports.getRoom = getRoom;
exports.banUserFromRoom = banUserFromRoom;
exports.unbanUserFromRoom = unbanUserFromRoom;
exports.getOwnedRooms = getOwnedRooms;
exports.removeRoom = removeRoom;
exports.matchPartialRoom = matchPartialRoom;
exports.populateDbRooms = populateDbRooms;
