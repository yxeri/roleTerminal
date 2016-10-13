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
const jwt = require('jsonwebtoken');
const dbUser = require('../../db/connectors/user');
const appConfig = require('../../config/defaults/config').app;

const router = new express.Router();

/**
 * @returns {Object} Router
 */
function handle() {
  router.post('/', (req, res) => {
    if (!req.body || !req.body.data) {
      res.json({
        errors: [{
          status: 400,
          title: 'Missing data',
          detail: 'Unable to parse data',
        }],
      });
    } else {
      const { userName, password } = req.body.data;

      dbUser.authUser(userName, password, (err, authUser) => {
        if (err || authUser === null) {
          res.json({
            errors: [{
              status: 400,
              title: 'Unauthorized user',
              detail: 'Incorrect user name and/or password',
            }],
          });
        } else {
          res.json({
            data: { token: jwt.sign({ data: authUser }, appConfig.jsonKey, { expiresIn: '7d' }) },
          });
        }
      });
    }
  });

  return router;
}

module.exports = handle;
