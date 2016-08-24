const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const archiveSchema = new mongoose.Schema({
  visibility: { type: Number, default: 0 },
  public: { type: Boolean, default: true },
  text: [String],
  archiveId: { type: String, unique: true },
  title: String,
  creator: { type: String, default: 'SYSTEM' },
}, { collection: 'archives' });

const Archive = mongoose.model('Archive', archiveSchema);

function getArchive(archiveId, accessLevel, callback) {
  const query = {
    $and: [
      { visibility: { $lte: accessLevel } },
      { archiveId },
    ],
  };

  console.log(archiveId, accessLevel);

  Archive.findOne(query).lean().exec((err, archive) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: [`Failed to get archive with id ${archiveId}`],
        err,
      });
    }

    callback(err, archive);
  });
}

function getArchives(accessLevel, callback) {
  const query = { accessLevel: { $lte: accessLevel } };

  Archive.find(query).lean().exec((err, archives) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get archives'],
        err,
      });
    }

    callback(err, archives);
  });
}

function getArchivesList(accessLevel, callback) {
  const query = {
    $and: [
      { visibility: { $lte: accessLevel } },
      { public: true },
    ],
  };

  Archive.find(query).lean().exec((err, archives) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get archives list'],
        err,
      });
    }

    callback(err, archives);
  });
}

exports.getArchive = getArchive;
exports.getArchives = getArchives;
exports.getArchivesList = getArchivesList;
