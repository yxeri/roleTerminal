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
const dbRoom = require('../../db/connectors/room');
const appConfig = require('../../config/defaults/config').app;
const jwt = require('jsonwebtoken');
const manager = require('../../socketHelpers/manager');
const objectValidator = require('../../utils/objectValidator');

const router = new express.Router();
const roomErrors = [{
  status: 400,
  title: 'Unable to retrieve rooms',
  detail: 'Unable to retrieve rooms',
}];

/**
 * @returns {Object} Router
 */
function handle() {
  router.get('/', (req, res) => {
    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization;

    jwt.verify(auth || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if ((jwtErr || !decoded) && auth) {
        res.status(400).json({
          errors: [{
            status: 400,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });
      } else {
        const user = auth ? decoded.data : { accessLevel: 0 };

        dbRoom.getAllRooms(user, (roomErr, rooms) => {
          if (roomErr) {
            res.status(400).json({ errors: roomErrors });
          } else {
            res.json({ rooms: rooms.map(room => room.roomName) });
          }
        });
      }
    });
  });

  router.get('/:id', (req, res) => {
    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization;

    jwt.verify(auth || '', appConfig.jsonKey, (jwtErr, decoded) => {
      if ((jwtErr || !decoded) && auth) {
        res.status(400).json({
          errors: [{
            status: 400,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });
      } else {
        const user = auth ? decoded.data : { accessLevel: 0 };

        dbRoom.getRoom(req.params.id, user, (roomErr, room) => {
          if (roomErr) {
            res.status(400).json({ errors: roomErrors });
          } else {
            res.json({ data: { rooms: [room] } });
          }
        });
      }
    });
  });

  router.post('/', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { room: { roomName: true } } })) {
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
          const newRoom = req.body.data.room;
          newRoom.roomName = newRoom.toLowerCase();
          newRoom.owner = decoded.data.userName.toLowerCase();

          manager.createRoom(newRoom, decoded.data, (errRoom, room) => {
            if (errRoom || room === null) {
              res.status(400).json({
                errors: [{
                  status: 400,
                  title: 'Failed to create room',
                  detail: 'Failed to create room',
                }],
              });
            } else {
              res.json({ data: { room } });
            }
          });
        }
      });
    }

    router.post('/:id', (req, res) => {
      // Follow room
    });
  });

  return router;
}

module.exports = handle;
