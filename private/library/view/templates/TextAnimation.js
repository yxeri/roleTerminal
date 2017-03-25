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
const textTools = require('../../TextTools');

class Boot extends View {
  constructor({ removeTime = 4000 }) {
    super({ isFullscreen: true });
    this.element.classList.add('textAnimation');
    this.queue = [];
    this.removeTime = removeTime;
  }

  addCode({ iteration, maxIteration, row, maxRows, binary }) {
    const span = document.createElement('SPAN');
    const text = document.createTextNode(!binary ? textTools.createMixedString(5, false, true) : textTools.createBinaryString(5));

    span.appendChild(text);
    this.element.appendChild(span);
    span.scrollIntoView();

    if (iteration < maxIteration) {
      setTimeout(() => { this.addCode({ iteration: iteration + 1, row, maxRows, maxIteration, binary }); }, 50);
    } else if (row < maxRows) {
      this.element.appendChild(document.createElement('BR'));
      setTimeout(() => { this.addCode({ iteration: 0, maxIteration, row: row + 1, maxRows, binary }); }, 50);
    } else {
      this.element.appendChild(document.createElement('BR'));
      this.next();
    }
  }

  printLines({ array, classes, code }) {
    const line = array.shift();

    if (line) {
      setTimeout(() => {
        const span = document.createElement('SPAN');
        const text = code && Math.random() > 0.8 ? textTools.replaceWhitespace(line) : line;

        if (classes) {
          span.classList.add(classes);
        }
        span.appendChild(document.createTextNode(text));
        this.element.appendChild(span);
        span.scrollIntoView();
        this.element.appendChild(document.createElement('BR'));
        this.printLines({ array, classes, code });
      }, 50);
    } else {
      this.element.appendChild(document.createElement('BR'));
      this.next();
    }
  }

  start() {
    this.next();
  }

  next() {
    const nextObj = this.queue.shift();

    if (nextObj) {
      nextObj.func.call(this, nextObj.params);
    } else {
      setTimeout(() => { this.removeView(); }, this.removeTime);
    }
  }

  setQueue(array) {
    this.queue = array;
  }

  appendTo(parentElement) {
    super.appendTo(parentElement);
    this.start();
  }
}

module.exports = Boot;
