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

import List from './List';

import {
  forums,
  forumPosts,
  forumThreads,
  users,
  teams,
} from '../../data/DataHandler';
import eventCentral from '../../EventCentral';
import storageManager from '../../StorageManager';

export default class ForumList extends List {
  constructor({
    effect,
    classes = [],
    elementId = `fList-${Date.now()}`,
  }) {
    super({
      elementId,
      effect,
      listItemFields: [
        { paramName: 'title' },
      ],
      classes: classes.concat(['forumList']),
      shouldFocusOnClick: true,
      focusedId: storageManager.getCurrentForum(),
      dependencies: [
        forumPosts,
        forumThreads,
        users,
        teams,
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          eventCentral.emitEvent({
            event: eventCentral.Events.SWITCH_FORUM,
            params: { forum: { objectId } },
          });
        },
      },
      collector: forums,
    });
  }
}
