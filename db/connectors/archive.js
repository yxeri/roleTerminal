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

/**
 * Get archive by archive ID and user access level
 * @param {string} archiveId - ID of archive
 * @param {number} accessLevel - User access level
 * @param {Function} callback - Callback
 */
function getArchive(archiveId, accessLevel, callback) {
  const query = {
    $and: [
      { visibility: { $lte: accessLevel } },
      { archiveId },
    ],
  };

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

/**
 * Get all archives based on user access level
 * @param {number} accessLevel - User access level
 * @param {Function} callback - Callback
 */
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

/**
 * Get list of archives, based on user access level and if archive is public
 * @param {number} accessLevel - User access level
 * @param {Function} callback - Callback
 */
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
