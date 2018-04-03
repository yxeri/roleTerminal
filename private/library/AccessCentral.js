/*
 Copyright 2016 Aleksandar Jankovic

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

class AccessCentral {
  constructor() {

  }

  /**
   * Adds a watcher for events.
   * @param {Object} params - Parameters.
   * @param {string} params.event - Name of the event to listen for.
   * @param {Function} params.func - Function to call.
   */
  addWatcher({ event, func }) {
    if (!this.eventWatchers[event]) {
      this.eventWatchers[event] = [];
    }

    this.eventWatchers[event].push({ func });
  }

  /**
   * Emit event.
   * @param {Object} params - Parameters.
   * @param {string} params.event - Event to emit.
   * @param {Object} [params.params] - Parameters to send.
   */
  emitEvent({
    event,
    params = {},
  }) {
    console.log(event, params);

    if (this.eventWatchers[event]) {
      this.eventWatchers[event].forEach(watcher => watcher.func(params));
    }
  }
}

const eventCentral = new EventCentral();

module.exports = eventCentral;
