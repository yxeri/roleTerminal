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

    this.queueMessage({
      message: {
        text: [
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
        classes: ['logo'],
      },
    });
    this.queueMessage({
      message: {
        text: [
          'Welcome to the Oracle of Organica',
          'Please login to start your productive day!',
          'You can retrieve instructions on how to use the terminal with the tab button or typing double space without any other input',
          'You can also type "help" to retrieve the same instructions',
          'Learn these valuable skills to increase your productivity!',
        ],
      },
    });
    this.queueMessage({
      message: {
        text: [
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
        ],
        classes: ['logo'],
      },
    });
    this.queueMessage({
      message: {
        text: ['## This terminal has been cracked by your friendly Razor team. Enjoy! ##'],
      },
    });
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
    super.appendTo(parentElement);
    this.terminalInput.focus();
    this.consumeQueue();
  }
}

module.exports = Terminal;
