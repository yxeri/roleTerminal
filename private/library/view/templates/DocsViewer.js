/*
 Copyright 2017 Aleksandar Jankovic

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

const View = require('../base/View');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');

class DocsViewer extends View {
  constructor({ isFullscreen }) {
    super({ isFullscreen });

    this.docsSelect = elementCreator.createContainer({});
  }

  populateList() {
    socketManager.emitEvent('getArchivesList', {}, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      const archives = (data.archives || []).map((archive) => {
        return elementCreator.createButton({
          func: () => {},
          text: `${archive.title || archive.archiveId}`,
        });
      });

      elementCreator.replaceOnlyChild(this.docsSelect, elementCreator.createList({ elements: archives, classes: ['itemSelect'] }));
    });
  }
}

module.exports = DocsViewer;
