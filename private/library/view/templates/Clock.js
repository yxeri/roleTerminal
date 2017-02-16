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

const Time = require('../base/Time');
const textTools = require('../../TextTools');

class Clock extends Time {
  constructor(timeElement) {
    super(timeElement);

    this.updateTime();
  }

  /**
   * Updates time in DOM
   */
  updateTime() {
    const date = new Date();

    if (date.getSeconds() > 59) {
      date.setMinutes(date.getMinutes() + 1);
    }

    const beautifulDate = textTools.generateTimeStamp({ date });
    const span = document.createElement('SPAN');
    span.appendChild(document.createTextNode(`${beautifulDate.halfTime} ${beautifulDate.fullDate}`));

    this.element.replaceChild(span, this.element.firstChild);
  }
}

module.exports = Clock;
