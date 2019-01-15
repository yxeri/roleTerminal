/*
 Copyright 2018 Carmilla Mina Jankovic

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

const ViewWrapper = require('../ViewWrapper');
const ForumList = require('../lists/ForumList');
const ForumPage = require('./pages/ForumPage');
const UserList = require('../lists/UserList');

class ForumView extends ViewWrapper {
  constructor({
    classes = [],
    elementId = `fView-${Date.now()}`,
  }) {
    const forumList = new ForumList({});
    const forumPage = new ForumPage({});
    const userList = new UserList({
      title: 'Users',
    });

    super({
      elementId,
      columns: [
        {
          components: [
            { component: forumList },
            { component: userList },
          ],
          classes: ['columnList'],
        },
        { components: [{ component: forumPage }] },
      ],
      classes: classes.concat(['forumView']),
    });
  }
}

module.exports = ForumView;
