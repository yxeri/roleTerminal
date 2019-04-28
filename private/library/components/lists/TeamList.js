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

const List = require('./List');
const TeamDialog = require('../views/dialogs/TeamDialog');

const dataHandler = require('../../data/DataHandler');
const accessCentral = require('../../AccessCentral');
const viewSwitcher = require('../../ViewSwitcher');
const storageManager = require('../../StorageManager');

class TeamList extends List {
  constructor({
    title,
    effect,
    classes = [],
    elementId = `teamList-${Date.now()}`,
  }) {
    classes.push('teamList');

    const headerFields = [{
      paramName: 'teamName',
    }];

    super({
      elementId,
      classes,
      title,
      effect,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
      collector: dataHandler.teams,
      listItemFields: headerFields,
      sorting: {
        paramName: 'teamName',
      },
      filter: {
        rules: [
          { paramName: 'isPermissionsOnly', paramValue: false },
        ],
      },
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          if (storageManager.getAccessLevel() <= accessCentral.AccessLevels.ANONYMOUS) {
            return;
          }

          const teamDialog = new TeamDialog({
            teamId: objectId,
            origin: this.elementId,
          });

          teamDialog.addToView({ element: viewSwitcher.getParentElement() });
        },
      },
    });
  }
}

module.exports = TeamList;
