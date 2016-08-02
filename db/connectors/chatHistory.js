const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const chatHistorySchema = new mongoose.Schema({
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
}, { collection: 'chatHistories' });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

function addMsgToHistory(sentRoomName, sentMessage, callback) {
  const query = { roomName: sentRoomName };
  const update = { $push: { messages: sentMessage } };
  const options = { upsert: true, new: true };

  ChatHistory.findOneAndUpdate(query, update, options).lean().exec((err, history) => {
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

  ChatHistory.find(query, filter).lean().exec((err, history) => {
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

  ChatHistory.find(query, filter).lean().exec((err, history) => {
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

function createHistory(roomName, callback) {
  const query = { roomName };

  // Checks if history for room already exists
  ChatHistory.findOne(query).lean().exec((histErr, history) => {
    if (histErr) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to find if history for ${roomName} already exists`],
        err: histErr,
      });

      callback(histErr, history);
      // History doesn't exist in the collection, so let's add it and the room!
    } else if (history === null) {
      const newHistory = new ChatHistory({ roomName });

      newHistory.save(callback);
    } else {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`History for room ${roomName} already exists`],
        err: histErr,
      });

      callback(histErr, history);
    }
  });
}

function removeHistory(sentRoomName, callback) {
  ChatHistory.findOneAndRemove({ roomName: sentRoomName }).lean().exec(callback);
}

exports.addMsgToHistory = addMsgToHistory;
exports.getHistoryFromRoom = getHistoryFromRoom;
exports.getHistoryFromRooms = getHistoryFromRooms;
exports.createHistory = createHistory;
exports.removeHistory = removeHistory;
