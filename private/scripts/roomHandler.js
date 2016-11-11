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

const storage = require('./storage');
const domManipulator = require('./domManipulator');
const messenger = require('./messenger');
const socketHandler = require('./socketHandler');

/**
 * Sets room as the new default room
 * @param {string} roomName - Name of the new room
 */
function enterRoom(roomName) {
  storage.setRoom(roomName);

  if (!storage.getStaticInputStart()) {
    domManipulator.setInputStart(roomName);
  }

  messenger.queueMessage({
    text: [`Entered ${roomName}`],
    text_se: [`Gick in i ${roomName}`],
  });
}

/**
 * Called on follow emit
 * @param {Object} room - Room
 */
function onFollow({ room = {} }) {
  console.log('onFollow', room);

  if (room.entered) {
    enterRoom(room.roomName);
  } else {
    messenger.queueMessage({
      text: [`Following ${room.roomName}`],
      text_se: [`Följer ${room.roomName}`],
    });
  }
}

/**
 * Called on unfollow emit
 * @param {Object} room - Room
 * @param {string} room.roomName - Name of the room that was unfollowed
 * @param {boolean} [silent] - Should the room notification be surpressed?
 */
function onUnfollow({ room = { roomName: '' }, silent }) {
  if (!silent) {
    messenger.queueMessage({
      text: [`Stopped following ${room.roomName}`],
      text_se: [`Slutade följa ${room.roomName}`],
    });
  }

  if (room.roomName === storage.getRoom()) {
    socketHandler.emit('follow', {
      room: {
        roomName: 'public',
        entered: true,
      },
    });
  }
}

exports.onFollow = onFollow;
exports.onUnfollow = onUnfollow;
