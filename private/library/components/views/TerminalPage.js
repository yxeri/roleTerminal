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
const List = require('../lists/List');
const InputArea = require('../views/inputs/InputArea');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const userComposer = require('../../data/composers/UserComposer');
const accessCentral = require('../../AccessCentral');
const labelHandler = require('../../labels/LabelHandler');
const socketManager = require('../../SocketManager');
const textTools = require('../../TextTools');

class TerminalPage extends BaseView {
  constructor({
    classes = [],
    elementId = `tePage-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['linePrinterPage']),
    });

    const lineList = new List({

    });
    const inputArea = new InputArea({
      sendOnEnter: true,
    });

    this.commands = [];
    this.timeout = 50;
    this.lineList = lineList;
    this.inputArea = inputArea;

    socketManager.addEvent(socketManager.EmitTypes.SIMPLEMSG, ({ error, data }) => {
      const { simpleMsg } = data;

      if (simpleMsg.type !== 'terminal') {
        return;
      } else if (error) {
        console.log('simple msg', error);

        return;
      }

      this.lineList.addOneItem({

      });
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SIMPLEMSG,
      func: ({ docFile }) => {
        const { title, objectId } = docFile;
        const dialog = new LockedDocFileDialog({
          title,
          docFileId: objectId,
        });

        dialog.addToView({ element: this.getParentElement() });
      },
    });
  }

  getCommandNames() {
    return this.commands.map(({ commandName }) => commandName);
  }

  getInput() {
    return textTools.trimSpace(this.inputArea.getInputValue());
  }

  autoCompleteCommand() {
    const commands = this.getCommandNames();
    const matched = [];
    const inputValue = this.getInput().toLowerCase();
    let matches;

    commands.forEach((commandName) => {
      const lowerCommand = commandName.toLowerCase();
      matches = false;

      for (let j = 0; j < inputValue.length; j += 1) {
        if (inputValue.charAt(j) === lowerCommand.charAt(j)) {
          matches = true;
        } else {
          matches = false;

          break;
        }
      }

      if (matches) {
        matched.push(commandName);
      }
    });

    if (matched.length === 1) {
      this.terminalInput.value = matched[0];
    } else if (matched.length > 0) {
      this.queueMessage({
        message: {
          text: ['$ Multiple matched commands:'],
          elements: matched.map((commandName) => {
            return elementCreator.createSpan({
              text: commandName,
              classes: ['clickable'],
              func: () => {
                this.triggerCommand(commandName);
              },
            });
          }),
        },
      });
    }
  }
}

module.exports = TerminalPage;
