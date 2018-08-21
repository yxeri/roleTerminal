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

const BaseView = require('./BaseView');
const LockedDocFileDialog = require('./dialogs/LockedDocFileDialog');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const userComposer = require('../../data/composers/UserComposer');
const accessCentral = require('../../AccessCentral');
const viewSwitcher = require('../../ViewSwitcher');

class TeamPage extends BaseView {
  constructor({
    classes = [],
    elementId = `tPage-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['teamPage']),
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.OPEN_TEAM,
      func: ({ docFile }) => {
        const newElement = elementCreator.createContainer({
          elementId,
          classes,
        });
        const { hasFullAccess } = accessCentral.hasAccessTo({
          objectToAccess: docFile,
          toAuth: userComposer.getCurrentUser(),
        });

        if (hasFullAccess) {
          newElement.appendChild(createControls({ docFile }));
        }

        newElement.appendChild(createHeader({ docFile }));
        newElement.appendChild(createBody({ docFile }));

        this.replaceOnParent({ element: newElement });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.ACCESS_DOCFILE,
      func: ({ docFile }) => {
        const { title, objectId } = docFile;
        const dialog = new LockedDocFileDialog({
          title,
          docFileId: objectId,
        });

        dialog.addToView({ element: viewSwitcher.getParentElement() });
      },
    });
  }
}

module.exports = TeamPage;
