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
const dbUser = require('../../db/connectors/user');
const jwt = require('jsonwebtoken');

const router = new express.Router();

/**
 * @returns {Object} Router
 */
function handle() {
  router.get('/', (req, res) => {
    // noinspection JSUnresolvedVariable
    jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      dbUser.getUser(decoded.data.userName, (userErr, user) => {
        if (userErr) {
          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        manager.getHistory({
          rooms: user.rooms,
          callback: (historyErr, messages) => {
            if (historyErr) {
              res.status(500).json({
                errors: [{
                  status: 500,
                  title: 'Internal Server Error',
                  detail: 'Internal Server Error',
                }],
              });

              return;
            }

            res.json({ data: { timeZoneOffset: new Date().getTimezoneOffset(), messages } });
          },
        });
      });
    });
  });

  router.get('/:id', (req, res) => {
    // noinspection JSUnresolvedVariable
    jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      const roomName = req.params.id;

      dbUser.getUser(decoded.data.userName, (userErr, user) => {
        if (userErr) {
          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        } else if (user.rooms.indexOf(roomName) === -1) {
          res.status(400).json({
            errors: [{
              status: 400,
              title: 'User is not following room',
              detail: 'The user has to follow the room to be able to retrieve history from it',
            }],
          });

          return;
        }

        manager.getHistory({
          rooms: [roomName],
          lines: appConfig.historyLines,
          missedMsgs: false,
          lastOnline: new Date(),
          callback: (histErr, messages = []) => {
            if (histErr) {
              res.status(500).json({
                errors: [{
                  status: 500,
                  title: 'Internal Server Error',
                  detail: 'Internal Server Error',
                }],
              });

              return;
            }

            res.json({ data: { timeZoneOffset: new Date().getTimezoneOffset(), messages } });
          },
        });
      });
    });
  });

  return router;
}

module.exports = handle;
