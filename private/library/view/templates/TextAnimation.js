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
  constructor({ removeTime = 3000, lineTime = 50, isPermanent = false }) {
    super({ isFullscreen: true });
    this.element.classList.add('textAnimation');
    this.queue = [];
    this.removeTime = removeTime;
    this.lineTime = lineTime;
    this.isPermanent = isPermanent;
  }

  printLines({ array, classes, corruption = false, corruptionAmount = 0.2, waitTime = 300, repeatAmount = 0, lineTime, pre, arrayClone }) {
    if (repeatAmount > 0 && !arrayClone) {
      arrayClone = JSON.parse(JSON.stringify(array));
    }

    const line = array.shift();

    if (line) {
      setTimeout(() => {
        const span = document.createElement('SPAN');
        const text = corruption && Math.random() < corruptionAmount ? textTools.replaceWhitespace(line) : line;

        if (classes) {
          classes.forEach(cssClass => span.classList.add(cssClass));
        }

        span.appendChild(document.createTextNode(text));

        if (pre) {
          const preElement = document.createElement('PRE');

          preElement.appendChild(span);
          this.element.appendChild(preElement);
        } else {
          this.element.appendChild(span);
        }

        span.scrollIntoView();
        this.printLines({ array, classes, corruption, corruptionAmount, waitTime, lineTime, pre, repeatAmount, arrayClone });
      }, lineTime || this.lineTime);
    } else if (repeatAmount > 0) {
      setTimeout(() => {
        this.printLines({ array: arrayClone, classes, corruption, corruptionAmount, waitTime, repeatAmount: repeatAmount -= 1, lineTime, pre });
      }, waitTime);
    } else {
      setTimeout(() => {
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
    } else if (!this.isPermanent) {
      setTimeout(() => {
        this.end();
      }, this.removeTime);
    }
  }

  end() {
    this.element.innerHTML = '';
    this.queue = [];

    if (this.element.parentElement) {
      this.removeView();
      keyHandler.unpause();

      if (this.endFunc) {
        this.endFunc();
      }
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
