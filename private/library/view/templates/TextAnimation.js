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
const keyHandler = require('../../KeyHandler');

class TextAnimation extends View {
  constructor({ removeTime = 4000, lineTime = 50 }) {
    super({ isFullscreen: true });
    this.element.classList.add('textAnimation');
    this.queue = [];
    this.removeTime = removeTime;
    this.lineTime = lineTime;
  }

  addCode({ iteration, maxIteration, row, maxRows, binary, waitTime = 300 }) {
    const span = document.createElement('SPAN');
    const text = document.createTextNode(!binary ? textTools.createMixedString(5) : textTools.createBinaryString(5));

    span.appendChild(text);
    this.element.appendChild(span);

    if (iteration === 0) {
      span.scrollIntoView();
    }

    if (iteration < maxIteration) {
      setTimeout(() => { this.addCode({ iteration: iteration + 1, row, maxRows, maxIteration, binary, waitTime }); }, this.lineTime);
    } else if (row < maxRows) {
      this.element.appendChild(document.createElement('BR'));
      setTimeout(() => { this.addCode({ iteration: 0, maxIteration, row: row + 1, maxRows, binary, waitTime }); }, this.lineTime);
    } else {
      setTimeout(() => {
        this.element.appendChild(document.createElement('BR'));
        this.next();
      }, waitTime);
    }
  }

  printLines({ array, classes, corruption = false, corruptionAmount = 0.2, waitTime = 300 }) {
    const line = array.shift();

    if (line) {
      setTimeout(() => {
        const span = document.createElement('SPAN');
        const text = corruption && Math.random() < corruptionAmount ? textTools.replaceWhitespace(line) : line;

        if (classes) {
          classes.forEach(cssClass => span.classList.add(cssClass));
        }
        span.appendChild(document.createTextNode(text));
        this.element.appendChild(span);
        span.scrollIntoView();
        this.element.appendChild(document.createElement('BR'));
        this.printLines({ array, classes, corruption, corruptionAmount, waitTime });
      }, 50);
    } else {
      setTimeout(() => {
        this.element.appendChild(document.createElement('BR'));
        this.next();
      }, waitTime);
    }
  }

  start() {
    keyHandler.pause();
    this.next();
  }

  next() {
    const nextObj = this.queue.shift();

    if (nextObj) {
      nextObj.func.call(this, nextObj.params);
    } else {
      setTimeout(() => {
        this.removeView();
        keyHandler.unpause();

        if (this.endFunc) {
          this.endFunc();
        }
      }, this.removeTime);
    }
  }

  setQueue(array) {
    this.queue = array;
  }

  setEndFunc(func) {
    this.endFunc = func;
  }

  appendTo(parentElement) {
    super.appendTo(parentElement);
    this.start();
  }
}

module.exports = TextAnimation;
