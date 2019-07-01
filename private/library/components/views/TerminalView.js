/*
 Copyright 2019 Carmilla Mina Jankovic

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

const ViewWrapper = require('../ViewWrapper');
const TerminalPage = require('./pages/TerminalPage');

const eventCentral = require('../../EventCentral');

class TerminalView extends ViewWrapper {
  constructor({
    bootSequence,
    classes = [],
    elementId = `termView-${Date.now()}`,
  }) {
    const terminalPage = new TerminalPage({});

    super({
      elementId,
      columns: [
        {
          classes: ['columnTerminal'],
          components: [{ component: terminalPage }],
        },
      ],
      classes: classes.concat(['terminalView']),
    });

    this.terminalPage = terminalPage;
    this.bootSequence = bootSequence;
    this.skipBoot = false;

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGIN,
      func: () => {
        this.skipBoot = false;
      },
    });
  }

  addToView({ element }) {
    super.addToView({ element });

    if (!this.skipBoot && this.bootSequence && this.bootSequence.length > 0) {
      this.skipBoot = true;

      this.terminalPage.queueMessages({ objects: this.bootSequence });
    }
  }
}

module.exports = TerminalView;
