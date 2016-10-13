/*
 Copyright 2015 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

const express = require('express');
const manager = require('../../socketHelpers/manager');
const appConfig = require('../../config/defaults/config').app;
const dbRoom = require('../../db/connectors/room');
const jwt = require('jsonwebtoken');

const router = new express.Router();
const historyErrors = [{
  status: 400,
  title: 'Unable to retrieve history',
  detail: 'Unable to retrieve history',
}];

/**
 * @returns {Object} Router
 */
function handle() {
  router.get('/', (req, res) => {
    // noinspection JSUnresolvedVariable
    jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr || !decoded) {
        res.json({
          errors: [{
            status: 400,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });
      } else {
        dbRoom.getAllRooms(decoded.data, (roomErr, rooms) => {
          if (roomErr) {
            res.json({ errors: historyErrors });
          } else {
            manager.getHistory({
              rooms: rooms.map(room => room.roomName),
              callback: (historyErr, messages) => {
                if (historyErr) {
                  res.json({ errors: historyErrors });
                } else {
                  res.json({ data: { timeZoneOffset: new Date().getTimezoneOffset(), messages } });
                }
              },
            });
          }
        });
      }
    });
  });

  router.get('/:id', (req, res) => {
    // noinspection JSUnresolvedVariable
    jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decodedUser) => {
      if (jwtErr || !decodedUser) {
        res.json({
          errors: [{
            status: 400,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });
      } else {
        manager.getHistory({
          rooms: [req.params.id],
          lines: appConfig.historyLines,
          missedMsgs: false,
          lastOnline: new Date(),
          callback: (histErr, messages = []) => {
            if (histErr) {
              res.json({ errors: historyErrors });
            } else {
              res.json({ data: { timeZoneOffset: new Date().getTimezoneOffset(), messages } });
            }
          },
        });
      }
    });
  });

  return router;
}

module.exports = handle;
