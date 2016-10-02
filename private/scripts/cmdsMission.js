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

/** @module */

// const storage = require('./storage');
// const labels = require('./labels');
// const socketHandler = require('./socketHandler');
// const textTools = require('./textTools');
// const messenger = require('./messenger');
// const commandHandler = require('./commandHandler');
// const domManipulator = require('./domManipulator');

const commands = {};

commands.createmission = {
  func: () => {

  },
  steps: [],
  accessLevel: 1,
  visibility: 13,
  category: 'basic',
  commandName: 'createmission',
};

commands.mission = {
  func: () => {

  },
  accessLevel: 1,
  visibility: 1,
  category: 'basic',
  commandName: 'mission',
  options: {
    complete: { description: 'Mark a misison as done. You can only mark missions that you have created as done' },
    list: { description: 'Show all active missions',
      next: {
        all: { description: 'Show all missions, including completed ones' },
      },
    },
  },
};

module.exports = commands;
