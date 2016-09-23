'use strict';

// const mongoose = require('mongoose');
// const logger = require('../../utils/logger');
// const databaseConnector = require('../databaseConnector');
// const ObjectId = require('mongodb').ObjectID;
//
// const missionSchema = new mongoose.Schema({
//   timeCreated: Date,
//   completed: { type: Boolean, default: false },
//   reward: String,
//   title: String,
//   description: String,
//   requirement: String,
//   creator: String,
//   agent: String,
//   applicationRequired: { type: Boolean, default: false },
//   missionType: String,
//   visibility: Number,
//   accessLevel: Number,
// }, { collection: 'missions' });
//
// const Mission = mongoose.model('Mission', missionSchema);
//
// function updateMissionValue(missionId, update, callback) {
//   const query = { _id: missionId };
//
//   Mission.findOneAndUpdate(query, update).lean().exec((err, mission) => {
//     if (err) {
//       logger.sendErrorMsg({
//         code: logger.ErrorCodes.db,
//         text: ['Failed to update mission'],
//         err,
//       });
//     }
//
//     callback(err, mission);
//   });
// }
//
// function createMission(sentMission, callback) {
//   const newMission = new Mission(sentMission);
//
//   databaseConnector.saveObject(newMission, 'mission', callback);
// }
//
// function updateMissionCompleted(missionIdString, value, callback) {
//   const update = { completed: value };
//
//   updateMissionValue(new ObjectId(missionIdString), update, callback);
// }
//
// function updateMissionReward(missionIdString, value, callback) {
//   const update = { reward: value };
//
//   updateMissionValue(new ObjectId(missionIdString), update, callback);
// }
//
// function updateMissionAgent(missionIdString, value, callback) {
//   const update = { agent: value };
//
//   updateMissionValue(new ObjectId(missionIdString), update, callback);
// }
//
// function getActiveMissions(callback) {
//   const query = { completed: false };
//   const filter = { _id: 0 };
//
//   Mission.find(query, filter).lean().exec((err, missions) => {
//     if (err) {
//       logger.sendErrorMsg({
//         code: logger.ErrorCodes.db,
//         text: ['Failed to get active missions'],
//         err,
//       });
//     }
//
//     callback(err, missions);
//   });
// }
//
// function getAllMissions(callback) {
//   const query = { };
//   const filter = { _id: 0 };
//
//   Mission.find(query, filter).lean().exec((err, missions) => {
//     if (err) {
//       logger.sendErrorMsg({
//         code: logger.ErrorCodes.db,
//         text: ['Failed to get all missions'],
//         err,
//       });
//     }
//
//     callback(err, missions);
//   });
// }
//
// exports.createMission = createMission;
// exports.getActiveMissions = getActiveMissions;
// exports.getAllMissions = getAllMissions;
// exports.updateMissionCompleted = updateMissionCompleted;
// exports.updateMissionReward = updateMissionReward;
// exports.updateMissionAgent = updateMissionAgent;
