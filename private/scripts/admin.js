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

require('../library/polyfills');

const MenuBar = require('../library/components/views/MenuBar');
const ViewWrapper = require('../library/components/ViewWrapper');
const AdminUserList = require('../library/components/lists/AdminUserList');
const BaseView = require('../library/components/views/BaseView');
const AdminTeamList = require('../library/components/lists/AdminTeamList');

const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const elementCreator = require('../library/ElementCreator');
const eventCentral = require('../library/EventCentral');
const mouseHandler = require('../library/MouseHandler');
const accessCentral = require('../library/AccessCentral');

const menuBar = new MenuBar({
  viewSwitcher,
  setMenuImage: false,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    room: true,
    view: true,
    docFile: true,
  },
});
const adminUserList = new AdminUserList({
  shouldToggle: true,
});
const adminTeamList = new AdminTeamList({
  shouldToggle: true,
});
const userWrapper = new ViewWrapper({
  menuBar,
  columns: [{
    components: [
      { component: adminUserList },
      { component: adminTeamList },
    ],
  }],
});

const notAllowedView = new BaseView({
  classes: ['notAllowedView'],
});

notAllowedView.element.appendChild(elementCreator.createSpan({ text: 'You do not have permission to access the admin controls. Login to an admin account to proceed.' }));

const notAllowedWrapper = new ViewWrapper({
  menuBar,
  columns: [{
    components: [{ component: notAllowedView }],
  }],
});

mouseHandler.setAllowRightClick(true);
menuBar.setViews({
  views: [
    { view: userWrapper },
  ],
});

eventCentral.addWatcher({
  event: eventCentral.Events.ACCESS_CHANGE,
  func: ({ accessLevel }) => {
    if (accessLevel >= accessCentral.AccessLevels.MODERATOR) {
      viewSwitcher.switchView({ view: userWrapper });
    } else {
      viewSwitcher.switchView({ view: notAllowedWrapper });
    }
  },
});
