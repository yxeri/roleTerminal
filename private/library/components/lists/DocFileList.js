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

const dataHandler = require('../../data/DataHandler');
const eventCentral = require('../../EventCentral');

class DocFileList extends List {
  constructor({
    title,
    effect,
    sorting = {
      paramName: 'title',
    },
    listItemFields = [{
      paramName: 'title',
    }],
    classes = [],
    elementId = `dFList-${Date.now()}`,
  }) {
    super({
      title,
      elementId,
      sorting,
      effect,
      listItemFields,
      classes: classes.concat(['docFileList']),
      dependencies: [
        dataHandler.docFiles,
        dataHandler.aliases,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.transactions,
      ],
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const docFile = dataHandler.docFiles.getObject({ objectId });

          if (!docFile.isLocked || docFile.code) {
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
    });
  }
}

module.exports = DocFileList;
