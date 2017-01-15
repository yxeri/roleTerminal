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

const storage = require('../../storage');
const textTools = require('../../textTools');

class Time {
  constructor(timeElement) {
    this.element = timeElement;

    this.updateTime();
  }

  /**
   * Updates time in DOM
   */
  updateTime() {
    const date = new Date();
    const yearModification = parseInt(storage.getLocalVal('yearModification'), 10);

    if (!isNaN(yearModification)) {
      date.setFullYear(date.getFullYear() + yearModification);
    }

    if (date.getSeconds() > 59) {
      date.setMinutes(date.getMinutes() + 1);
    }

    const beautifulDate = textTools.generateTimeStamp({ date });

    this.element.replaceChild(document.createTextNode(`${beautifulDate.halfTime} ${beautifulDate.fullDate}`), this.element.firstChild);
  }

  /**
   * Start time tracking and calls updateTime to update time in DOM
   */
  startClock() {
    const now = new Date();
    const waitTime = ((60 - now.getSeconds()) * 1000) - now.getMilliseconds();

    setTimeout(() => {
      this.updateTime();
      this.startClock();
    }, waitTime);
  }
}

module.exports = Time;
