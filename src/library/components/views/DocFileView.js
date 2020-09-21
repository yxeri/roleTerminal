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

import ViewWrapper from '../ViewWrapper';
import DocFileList from '../lists/DocFileList';
import DocFilePage from './pages/DocFilePage';

import eventCentral from '../../EventCentral';

class DocFileView extends ViewWrapper {
  constructor({
    effect,
    classes = [],
    elementId = `dFView-${Date.now()}`,
  }) {
    const docFileList = new DocFileList({});
    const docFilePage = new DocFilePage({
      effect,
      closeFunc: () => {
        this.columnElements[0].classList.remove('hide');
        this.columnElements[1].classList.add('hide');
      },
    });

    super({
      elementId,
      columns: [
        {
          components: [{ component: docFileList }],
          classes: ['columnList'],
        }, {
          components: [{ component: docFilePage }],
          classes: ['hide'],
        },
      ],
      classes: classes.concat(['docFileView']),
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.OPEN_DOCFILE,
      func: () => {
        this.columnElements[0].classList.add('hide');
        this.columnElements[1].classList.remove('hide');
      },
    });
  }
}

export default DocFileView;
