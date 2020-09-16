/*
 Copyright 2020 Carmilla Mina Jankovic

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

import dataHandler from '../../data/DataHandler';
import userComposer from '../../data/composers/UserComposer';
import teamComposer from '../../data/composers/TeamComposer';
import labelHandler from '../../labels/LabelHandler';
import textTools from '../../TextTools';

export default class TeamScoringList extends List {
  constructor({
    effect,
    reverseSorting = true,
    classes = [],
    elementId = `tSList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'targeterId',
        convertFunc: (targeterId) => {
          const targeter = userComposer.getIdentity({ objectId: targeterId }) || teamComposer.getTeam({ teamId: targeterId });
          const targeterName = targeter.aliasName || targeter.username || targeter.teamName;

          return `${labelHandler.getLabel({ baseObject: 'TeamScoring', label: 'doneBy' })}: ${targeterName}.`;
        },
      }, {
        paramName: 'targetId',
        convertFunc: (targetId) => {
          const target = userComposer.getIdentity({ objectId: targetId }) || teamComposer.getTeam({ teamId: targetId });
          const targetName = target.aliasName || target.username || target.teamName;

          return `${labelHandler.getLabel({ baseObject: 'TeamScoring', label: 'target' })}: ${targetName}.`;
        },
      }, {
        paramName: 'scoreType',
        convertFunc: (scoreType) => {
          if (scoreType === 'elimination') {
            return 'Target has been eliminated';
          }

          return '';
        },
      }, {
        paramName: 'customTimeCreated',
        fallbackTo: 'timeCreated',
        convertFunc: (time) => {
          const timestamp = textTools.generateTimestamp({ date: time });

          return `${timestamp.fullDate} ${timestamp.fullTime}`;
        },
      }, {
        paramName: 'note',
      },
    ];

    super({
      elementId,
      effect,
      shouldFocusOnClick: false,
      sorting: {
        paramName: 'cutomTimeCreated',
        fallbackParamName: 'timeCreated',
        reverse: reverseSorting,
      },
      classes: classes.concat(['teamScoringList']),
      dependencies: [
        dataHandler.teamScoring,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
      ],
      collector: dataHandler.teamScoring,
      listItemFields: headerFields,
    });
  }
}
