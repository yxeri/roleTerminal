/*
 Copyright 2018 Aleksandar Jankovic

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

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');
const userComposer = require('../../data/composers/UserComposer');

class DocFileList extends List {
  constructor({
    classes = [],
    elementId = `dFList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'title',
      }, {
        paramName: 'ownerAliasId',
        fallbackTo: 'ownerId',
        convertFunc: (objectId) => {
          const user = userComposer.getUser({ userId: objectId });

          return user ? user.username : '-';
        },
      }, {
        paramName: 'teamId',
        convertFunc: (objectId) => {
          const team = dataHandler.teams.getObject({ objectId });

          if (team) {
            return team.teamName;
          }

          return '-';
        },
      },
    ];

    super({
      elementId,
      classes: classes.concat(['docFileList']),
      dependencies: [
        dataHandler.docFiles,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const docFile = dataHandler.docFiles.getObject({ objectId });

          if (docFile.code) {
            eventCentral.emitEvent({
              event: eventCentral.Events.OPEN_DOCFILE,
              params: { docFile },
            });
          } else {
            eventCentral.emitEvent({
              event: eventCentral.Events.ACCESS_DOCFILE,
              params: { docFile },
            });
          }
        },
      },
      collector: dataHandler.docFiles,
      listItemFields: headerFields,
    });
  }
}

module.exports = DocFileList;
