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

const BaseView = require('../BaseView');
const InputArea = require('../inputs/InputArea');

const elementCreator = require('../../../ElementCreator');
const accessCentral = require('../../../AccessCentral');
const textTools = require('../../../TextTools');
const labelHandler = require('../../../labels/LabelHandler');
const keyHandler = require('../../../KeyHandler');

class TerminalPage extends BaseView {
  constructor({
    classes = [],
    elementId = `termPage-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['terminalPage']),
    });

    this.commands = [];
    this.nextFunc = null;
    this.printing = false;
    this.queue = [];
    this.outputList = elementCreator.createList({
      classes: ['terminalOutput'],
    });
    this.inputArea = new InputArea({
      focusless: true,
      placeholder: labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'placeholder' }),
      classes: ['terminalInput'],
      multiLine: false,
      sendOnEnter: true,
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      triggerCallback: ({ text }) => {
        this.triggerCommand(text);
      },
    });

    this.element.appendChild(this.outputList);
    this.inputArea.addToView({
      element: this.element,
    });

    keyHandler.addKey(9, () => {
      this.autoCompleteCommand();
    }, true);
  }

  addToView({
    element,
    insertBeforeElement,
    shouldPrepend,
  }) {
    super.addToView({
      element,
      insertBeforeElement,
      shouldPrepend,
    });

    this.inputArea.setKeyListener();
  }

  removeFromView() {
    super.removeFromView();

    keyHandler.removeKey(9);
  }

  consumeQueue() {
    const object = this.queue.shift();

    if (object) {
      const {
        element,
        beforeTimeout,
        fullscreen,
        afterTimeout = 50,
      } = object;

      if (fullscreen) {
        this.outputList.classList.add('fullscreen');
      } else if (typeof fullscreen === 'boolean' && !fullscreen) {
        this.outputList.classList.remove('fullscreen');
      }

      const callback = () => {
        this.outputList.appendChild(elementCreator.createListItem({ elements: [element] }));
        this.outputList.lastElementChild.scrollIntoView(true);

        setTimeout(() => { this.consumeQueue(); }, afterTimeout);
      };

      if (beforeTimeout) {
        setTimeout(callback, beforeTimeout);

        return;
      }

      callback();
    } else {
      this.outputList.classList.remove('fullscreen');
      this.printing = false;
    }
  }

  queueMessages({
    objects,
  }) {
    this.queue.push(...objects);

    if (!this.printing) {
      this.printing = true;

      this.consumeQueue({ queue: this.queue });
    }
  }

  setNextFunc(func) {
    this.nextFunc = func;
  }

  resetNextFunc() {
    this.nextFunc = null;

    this.inputArea.clearInput();
    this.queueMessages({
      objects: [
        { element: elementCreator.createSpan({ text: `[${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'completed' })}]` }) },
        { element: elementCreator.createSpan({ text: '' }) },
      ],
    });
    this.printCommands();
  }

  addCommand(command) {
    this.commands.push(command);
  }

  printCommands() {
    this.queueMessages({
      objects: [{ element: elementCreator.createSpan({ text: `${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'programs' })}:` }) }],
    });
    this.queueMessages({
      objects: this.commands.map(({ commandName }) => {
        return {
          element: elementCreator.createSpan({
            text: commandName,
            classes: ['clickable', 'linkLook'],
            clickFuncs: {
              leftFunc: () => {
                this.triggerCommand(commandName);
              },
            },
          }),
        };
      }),
    });
  }

  triggerCommand(value) {
    const inputValue = (value || this.inputArea.getInputValue()).toString();

    if (this.nextFunc) {
      if (textTools.trimSpace(inputValue.toLowerCase()) === 'abort') {
        this.inputArea.clearInput();
        this.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'aborted' }) }) }] });
        this.resetNextFunc();
      } else {
        this.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: `$ ${inputValue}` }) }] });
        this.nextFunc(inputValue);
        this.inputArea.clearInput();
      }

      return;
    }

    if (inputValue === '') {
      this.queueMessages({
        objects: [{ element: elementCreator.createSpan({ text: '$' }) }],
      });
      this.printCommands();
    } else {
      const sentCommandName = textTools.trimSpace(inputValue.toLowerCase());
      const command = this.commands.find(({ commandName }) => sentCommandName === commandName.toLowerCase());

      if (command) {
        this.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: `$ ${inputValue}` }) },
            { element: elementCreator.createSpan({ text: `${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'running' })} ${command.commandName}:` }) },
            { element: elementCreator.createSpan({ text: `${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'typeAbort' })} ` }) },
            {
              element: elementCreator.createSpan({
                classes: ['clickable', 'linkLook'],
                text: labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'abortCommand' }),
                clickFuncs: {
                  leftFunc: () => {
                    this.triggerCommand('abort');
                  },
                },
              }),
            },
          ],
        });

        command.startFunc();
      } else {
        this.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: `$ ${inputValue}: ${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'notFound' })}` }) },
          ],
        });
        this.printCommands();
      }
    }

    this.inputArea.clearInput();
  }

  autoCompleteCommand() {
    const commands = this.commands.map(({ commandName }) => commandName);
    const matched = [];
    const inputValue = this.inputArea.getInputValue().toLowerCase();
    let matches;

    if (inputValue === '') {
      this.triggerCommand('');

      return;
    }

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
      this.inputArea.setInputValue({ value: matched[0] });
    } else if (matched.length > 0) {
      this.queueMessages({
        objects: [{ element: elementCreator.createSpan({ text: `${labelHandler.getLabel({ baseObject: 'TerminalPage', label: 'multipleMatches' })}:` }) }],
      });
      this.queueMessages({
        objects: matched.map((commandName) => {
          return {
            element: elementCreator.createSpan({
              text: commandName,
              classes: ['clickable'],
              clickFuncs: {
                leftFunc: () => {
                  this.triggerCommand(commandName);
                },
              },
            }),
          };
        }),
      });
    }
  }
}

module.exports = TerminalPage;
