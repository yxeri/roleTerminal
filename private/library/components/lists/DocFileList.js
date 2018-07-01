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
const storageManager = require('../../StorageManager');

class DocFileList extends List {
  constructor({
    classes = [],
    elementId = `dFList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'title',
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
          const userId = storageManager.getUserId();
          const docFile = dataHandler.docFiles.getObject({ objectId });

          if (!docFile.isLocked || docFile.code || docFile.ownerId === userId) {
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
