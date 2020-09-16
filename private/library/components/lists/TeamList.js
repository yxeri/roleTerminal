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
import TeamDialog from '../views/dialogs/TeamDialog';

import {
  users,
  teams,
  aliases,
} from '../../data/DataHandler';
import accessCentral from '../../AccessCentral';
import viewSwitcher from '../../ViewSwitcher';
import storageManager from '../../StorageManager';
import labelHandler from '../../labels/LabelHandler';

export default class TeamList extends List {
  constructor({
    title,
    effect,
    shouldToggle,
    classes = [],
    elementId = `fullTeamList-${Date.now()}`,
  }) {
    classes.push('fullTeamList');

    const headerFields = [{
      paramName: 'teamName',
    }, {
      paramName: 'description',
      convertFunc: (description) => {
        if (description.length !== 0) {
          return `${labelHandler.getLabel({ baseObject: 'UserList', label: 'description' })}: ${description.join('\n')}`;
        }

        return '';
      },
    }];

    super({
      elementId,
      classes,
      title,
      effect,
      shouldToggle,
      imageThumb: true,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      dependencies: [
        users,
        teams,
        aliases,
      ],
      collector: teams,
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
