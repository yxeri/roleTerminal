'use strict';

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

const scheduledEventSchema = new mongoose.Schema({
  receiverName: String,
  func: {},
  createdAt: Date,
  endAt: Date,
}, { collection: 'events' });
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
const invitationListSchema = new mongoose.Schema({
  userName: { type: String, unique: true, index: true },
  invitations: [{
    invitationType: String,
    itemName: String,
    sender: String,
    time: Date,
  }],
}, { collection: 'invitationLists' });
const gameUserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
}, { collection: 'gameUsers' });
const gamePasswordSchema = new mongoose.Schema({
  password: { type: String, unique: true },
}, { collection: 'gamePasswords' });

const ScheduledEvent = mongoose.model('ScheduledEvent', scheduledEventSchema);
const Team = mongoose.model('Team', teamSchema);
const Weather = mongoose.model('Weather', weatherSchema);
const InvitationList = mongoose.model('InvitationList', invitationListSchema);
const GameUser = mongoose.model('GameUser', gameUserSchema);
const GamePassword = mongoose.model('GamePassword', gamePasswordSchema);

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

function createGameUser(gameUser, callback) {
  const newGameUser = new GameUser(gameUser);
  const query = { userName: gameUser.userName };

  GameUser.findOne(query).lean().exec((err, foundGameUser) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if game user already exists'],
        err,
      });
    } else if (foundGameUser === null) {
      saveObject(newGameUser, 'gameUser', callback);
    } else {
      callback(err, null);
    }
  });
}

function getGameUser(userName, callback) {
  const query = { userName };

  GameUser.findOne(query).lean().exec((err, foundGameUser) => {
    if (err || foundGameUser === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get game user'],
        err,
      });
    }

    callback(err, foundGameUser);
  });
}

function getAllGameUsers(callback) {
  GameUser.find().lean().exec((err, gameUsers) => {
    if (err || gameUsers === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get game users'],
        err,
      });
    }

    callback(err, gameUsers);
  });
}

function createGamePassword(gamePassword, callback) {
  const newGamePassword = new GamePassword(gamePassword);
  const query = { password: gamePassword.password };

  GamePassword.findOne(query).lean().exec((err, foundGamePassword) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to check if game password already exists'],
        err,
      });
    } else if (foundGamePassword === null) {
      saveObject(newGamePassword, 'gamePassword', callback);
    } else {
      callback(err, null);
    }
  });
}

function getAllGamePasswords(callback) {
  GamePassword.find().lean().exec((err, gamePasswords) => {
    if (err || gamePasswords === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get game passwords'],
        err,
      });
    }

    callback(err, gamePasswords);
  });
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

function verifyTeam(teamName, callback) {
  const query = { teamName };
  verifyObject(query, Team, 'team', callback);
}

function verifyAllTeams(callback) {
  const query = { verified: false };

  verifyAllObjects(query, Team, 'teams', callback);
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

exports.createEvent = createEvent;
exports.getPassedEvents = getPassedEvents;
exports.createTeam = createTeam;
exports.getTeam = getTeam;
exports.createWeather = createWeather;
exports.getWeather = getWeather;
exports.addInvitationToList = addInvitationToList;
exports.removeInvitationFromList = removeInvitationFromList;
exports.getInvitations = getInvitations;
exports.removeInvitationTypeFromList = removeInvitationTypeFromList;
exports.verifyTeam = verifyTeam;
exports.verifyAllTeams = verifyAllTeams;
exports.getUnverifiedTeams = getUnverifiedTeams;
exports.createGameUser = createGameUser;
exports.getGameUser = getGameUser;
exports.createGamePassword = createGamePassword;
exports.getAllGamePasswords = getAllGamePasswords;
exports.getAllGameUsers = getAllGameUsers;
exports.matchPartial = matchPartial;
exports.saveObject = saveObject;
