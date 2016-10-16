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
const objectValidator = require('../../utils/objectValidator');
const appConfig = require('../../config/defaults/config').app;
const dbUser = require('../../db/connectors/user');
const jwt = require('jsonwebtoken');
const dbLocation = require('../../db/connectors/location');

const router = new express.Router();

/**
 * @param {object} io - Socket.IO
 * @returns {Object} Router
 */
function handle(io) {
  router.get('/users', (req, res) => {
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

      dbUser.getAllUserPositions(decoded.data, (posErr, positions) => {
        if (posErr) {
          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        res.json({ data: { positions } });
      });
    });
  });

  router.get('/users/:id', (req, res) => {
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

      dbUser.getUserPosition(decoded.data, req.params.id, (posErr, position) => {
        if (posErr) {
          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        res.json({ data: { positions: [position] } });
      });
    });
  });

  router.post('/users', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { position: { position: { longitude: true, latitude: true } } } })) {
      res.status(400).json({
        errors: [{
          status: 400,
          title: 'Missing data',
          detail: 'Unable to parse data',
        }],
      });

      return;
    }

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

      dbLocation.updatePosition({
        positionName: decoded.data.userName,
        position: req.body.data.position.position,
        type: 'user',
        // TODO group: user.team
        callback: (posErr, position) => {
          if (posErr) {
            res.status(500).json({
              errors: [{
                status: 500,
                title: 'Internal Server Error',
                detail: 'Internal Server Error',
              }],
            });

            return;
          }

          // TODO Only to users that have tracking on?
          io.emit('mapPositions', {
            positions: [position],
            currentTime: (new Date()),
          });

          res.json({ data: { position } });
        },
      });
    });
  });

  return router;
}

module.exports = handle;
