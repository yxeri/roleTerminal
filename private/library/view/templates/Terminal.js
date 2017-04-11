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
const TextAnimation = require('./TextAnimation');
const textTools = require('../../TextTools');

const elementCreator = require('../../ElementCreator');

class Terminal extends View {
  constructor() {
    super({ isFullscreen: true, viewId: 'terminal' });
    this.element.classList.add('fullHeight');

    this.terminalInput = elementCreator.createInput({ inputName: 'terminalInput', placeholder: 'Input command', classes: ['terminalInput'] });
    this.element.appendChild(elementCreator.createList({ elementId: 'terminalFeed' }));
    this.element.appendChild(this.terminalInput);
    this.queue = [];
    this.printing = false;
    this.shortQueue = [];
    this.timeout = 50;
    this.firstRun = true;
    this.commands = [];
  }

  addCommand(command) {
    this.commands.push(command);
  }

  triggerCommand(value) {
    const inputValue = value || this.terminalInput.value;

    if (inputValue === '') {
      this.queueMessage({ message: { text: ['$', 'Commands:'], elements: this.getClickableCommandNames() } });
    } else {
      const sentCommandName = textTools.trimSpace(inputValue.toLowerCase());
      const command = this.commands.find(({ commandName }) => sentCommandName === commandName.toLowerCase());

      if (command) {
        this.queueMessage({
          message: {
            text: [
              `$ ${inputValue}`,
              `Running command ${command.commandName}:`,
            ],
          },
        });
        command.startFunc();
      } else {
        this.queueMessage({ message: { text: [`$ ${inputValue}: command not found`, 'Commands:'], elements: this.getClickableCommandNames() } });
      }
    }

    this.terminalInput.value = '';
  }

  addRow(message) {
    const currentText = message.text;

    if (currentText && currentText.length > 0) {
      const text = currentText.shift();
      const row = elementCreator.createListItem({ element: elementCreator.createSpan({ text, classes: message.classes }) });

      this.element.firstElementChild.appendChild(row);
      row.scrollIntoView();
      setTimeout(() => { this.addRow(message); }, this.timeout);
    } else {
      if (message.elements) {
        this.appendRow({ elements: message.elements });
      }
      this.consumeShortQueue();
    }
  }

  consumeShortQueue() {
    if (this.shortQueue.length > 0) {
      const message = this.shortQueue.shift();

      this.addRow(message);
    } else {
      this.printing = false;
      this.consumeQueue();
    }
  }

  consumeQueue() {
    if (this.element.parentNode && !this.printing && this.queue.length > 0) {
      this.shortQueue = this.queue.splice(0, 10);
      this.printing = true;
      this.consumeShortQueue();
    }
  }

  queueMessage({ message }) {
    this.queue.push(message);
    this.consumeQueue(this.queue);
  }

  appendTo(parentElement) {
    if (!this.firstRun) {
      super.appendTo(parentElement);
      this.enableKeyTriggers();
      this.terminalInput.focus();
      this.consumeQueue();
    } else {
      this.addKeyTrigger({
        charCode: 13, // Enter
        triggerless: true,
        func: () => {
          this.triggerCommand();
        },
      });
      this.startBootSequence(parentElement);
    }
  }

  removeView() {
    this.disableKeyTriggers();
    super.removeView();
  }

  getClickableCommandNames() {
    return this.commands.map(({ commandName }) => {
      return elementCreator.createSpan({
        text: commandName,
        classes: ['clickable'],
        func: () => {
          this.triggerCommand(commandName);
        },
      });
    });
  }

  appendRow({ elements }) {
    const listItem = elementCreator.createListItem({});

    elements.forEach(element => listItem.appendChild(element));

    this.element.firstElementChild.appendChild(listItem);
    listItem.scrollIntoView();
  }

  startBootSequence(parentElement) {
    const boot = new TextAnimation({ removeTime: 3000 });

    boot.setQueue([
      {
        func: boot.printLines,
        params: {
          corruption: true,
          corruptionAmount: 0.5,
          classes: ['logo'],
          array: [
            '                          ####',
            '                ####    #########    ####',
            '               ###########################',
            '              #############################',
            '            #######        ##   #  ##########',
            '      ##########           ##    #  ###  ##########',
            '     #########             #########   #   #########',
            '       #####               ##     ########   #####',
            '     #####                 ##     ##     ##########',
            '     ####                  ##      ##     #   ######',
            ' #######                   ##########     ##    ########',
            '########                   ##       ########     ########',
            ' ######      Organica      ##       #      #############',
            '   ####     Oracle         ##       #      ##     ####',
            '   ####     Operations     ##       #      ##    #####',
            '   ####      Center        ##       #      ###########',
            '########                   ##       #########    ########',
            '########                   ##########      #    #########',
            ' ########                  ##      ##     ## ###########',
            '     #####                 ##      ##     ### #####',
            '       #####               ##     ########   #####',
            '      #######              ##########   #  ########',
            '     ###########           ##    ##    # ###########',
            '      #############        ##    #   #############',
            '            ################################',
            '              ############################',
            '              #######  ##########  #######',
            '                ###      ######      ###',
            '                          ####',
          ],
        },
      }, {
        func: boot.printLines,
        params: {
          corruption: false,
          waitTime: 3000,
          array: [
            'Oracle System Administrator Toolset',
            'OSAT ACCESS AUTHENTICATION',
            'PERMITTED ONLY BY AUTHORIZED PERSONNEL',
            'ACCESS DENIED',
            'ACCESS DENIED',
            'ACCESS DENIED',
            'ACCESS DENIED',
            'ACCESS DENIED',
            'Loading...',
          ],
        },
      }, {
        func: boot.printLines,
        params: {
          corruption: false,
          waitTime: 2000,
          array: [
            'ACCESS GRANTED',
            'Welcome, administrator Charlotte Jenkins',
            'Your field report is 721 days late',
            'Oracle status: HQ CONNECTION FAILED',
            'OSAT version: UNDEFINED',
          ],
        },
      }, {
        func: boot.printLines,
        params: {
          classes: ['logo'],
          waitTime: 2000,
          array: [
            'THIS RELEASE OF OSAT WAS BROUGHT TO YOU BY',
            '   ####',
            '###############',
            ' #####  #########                                           ####',
            '  ####     #######  ########     ###########    ####     ###########',
            '  ####    ######      #######   ####   #####  ########    ####   #####',
            '  ####  ###         ####  ####        ####  ###    ###### ####   #####',
            '  #########        ####    ####     ####   #####     ##############',
            '  #### ######     ####     #####  ####     #######   ###  ########',
            '  ####   ######  ##### #### #### ############  #######    ####   ###',
            ' ######    #############    ################     ###      ####    #####',
            '########     ########        ####                        ######      #####   ##',
            '               ###########        ##                                    ###### ',
            '                    ###############',
            '                  Razor  #####  Demos - Warez - Honey',
            'ENJOY',
          ],
        },
      }, {
        func: boot.printLines,
        params: {
          corruption: false,
          array: [
            'Loading',
            '...',
            '...',
            '...',
            '...',
            '...',
          ],
        },
      },
    ]);
    boot.setEndFunc(() => {
      this.firstRun = false;
      this.appendTo(parentElement);
      this.queueMessage({
        message: {
          text: [
            'OSAT identity: C. Jenkins',
            'Your actions will be monitored',
            'Input or click on the command you want to run',
            'Commands:',
          ],
          elements: this.getClickableCommandNames(),
        },
      });
    });
    boot.appendTo(parentElement);
  }
}

module.exports = Terminal;
