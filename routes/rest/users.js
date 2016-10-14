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
const appConfig = require('../../config/defaults/config').app;
const jwt = require('jsonwebtoken');
const objectValidator = require('../../utils/objectValidator');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const dbUser = require('../../db/connectors/user');
const manager = require('../../socketHelpers/manager');

const router = new express.Router();

/**
 * @returns {Object} Router
 */
function handle() {
  router.get('/', (req, res) => {
    // noinspection JSUnresolvedVariable
    jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr || !decoded) {
        res.status(400).json({
          errors: [{
            status: 400,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });
      } else {
        dbUser.getAllUsers(decoded.data, (userErr, users) => {
          if (userErr || users === null) {
            res.status(400).json({
              errors: [{
                status: 400,
                title: 'Failed to retrieve users',
                detail: 'Unable to retrieve users',
              }],
            });
          } else {
            res.json({
              data: {
                users: users.map((user) => {
                  const userObj = {
                    userName: user.userName,
                    team: user.team,
                  };

                  return userObj;
                }),
              },
            });
          }
        });
      }
    });
  });

  router.post('/', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { user: { userName: true, password: true } } })) {
      res.status(400).json({
        errors: [{
          status: 400,
          title: 'Missing data',
          detail: 'Unable to parse data',
        }],
      });
    } else {
      // noinspection JSUnresolvedVariable
      jwt.verify(req.headers.authorization || '', appConfig.jsonKey, (jwtErr, decoded) => {
        if (jwtErr || !decoded) {
          res.status(400).json({
            errors: [{
              status: 400,
              title: 'Unauthorized',
              detail: 'Invalid token',
            }],
          });
        } else {
          // TODO Duplicate code with register
          const newUser = {
            userName: req.body.data.user.userName.toLowerCase(),
            password: req.body.data.user.password,
            registerDevice: 'RESTAPI',
            mode: appConfig.defaultMode,
            verified: false,
            rooms: [
              databasePopulation.rooms.public.roomName,
              databasePopulation.rooms.important.roomName,
              databasePopulation.rooms.bcast.roomName,
              databasePopulation.rooms.morse.roomName,
            ],
          };

          dbUser.createUser(newUser, (userErr, user) => {
            if (userErr) {
              res.status(400).json({
                errors: [{
                  status: 400,
                  title: 'Failed to create user',
                  detail: 'Unable to create user',
                }],
              });
            } else if (user === null) {
              res.status(400).json({
                errors: [{
                  status: 400,
                  title: 'User already exists',
                  detail: `User with user name ${newUser.userName} already exists`,
                }],
              });
            } else {
              const whisperRoom = {
                roomName: user.userName + appConfig.whisperAppend,
                visibility: 12,
                accessLevel: 12,
              };

              manager.createRoom(whisperRoom, user, () => {
              });

              res.json({
                data: { users: [user] },
              });
            }
          });
        }
      });
    }
  });

  return router;
}

module.exports = handle;
