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

/**
 * A filter will be used to filter out the objects retrieved or received. Only those who match the filter will be accepted.
 * @typedef {Object} Filter
 * @property {string} paramName - Name of the parameter.
 * @property {string} paramValue - Value of the parameter.
 */

const socketManager = require('../SocketManager');
const eventCentral = require('../EventCentral');

const noFunctionError = {
  type: 'no function',
  text: ['This data type does not support the function.'],
};

class BaseData {
  constructor({
    createEvents,
    retrieveEvents,
    updateEvents,
    removeEvents,
    objectTypes,
    eventTypes,
    emitTypes,
  }) {
    this.objects = {};
    this.removeEvents = removeEvents;
    this.createEvents = createEvents;
    this.retrieveEvents = retrieveEvents;
    this.updateEvents = updateEvents;
    this.objectTypes = objectTypes;
    this.eventTypes = eventTypes;
    this.hasFetched = false;

    eventCentral.addWatcher({
      event: eventCentral.Events.STARTUP,
      func: ({ shouldReset }) => {
        this.fetchObjects({ reset: shouldReset });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGIN,
      func: () => {
        this.fetchObjects({ reset: true });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.RECONNECT,
      func: () => {
        this.fetchObjects({});
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGOUT,
      func: () => {
        this.fetchObjects({ reset: true });
      },
    });

    if (emitTypes) {
      const func = ({ data }) => {
        const { changeType } = data;
        const object = data[this.objectTypes.one];
        const paramsToEmit = {
          changeType,
        };

        switch (changeType) {
          case socketManager.ChangeTypes.UPDATE: {
            if (this.objects[object.objectId]) {
              Object.keys(object).forEach((param) => {
                this.objects[object.objectId][param] = object[param];
              });
            } else {
              this.objects[object.objectId] = object;
            }

            break;
          }
          case socketManager.ChangeTypes.CREATE: {
            this.objects[object.objectId] = object;

            break;
          }
          case socketManager.ChangeTypes.REMOVE: {
            this.objects[object.objectId] = undefined;

            break;
          }
          default: {
            console.log(`Incorrect change type for ${this.objectTypes.one}: ${changeType}`);

            break;
          }
        }

        paramsToEmit[this.objectTypes.one] = changeType === socketManager.ChangeTypes.REMOVE ?
          { objectId: object.objectId } :
          this.objects[object.objectId];

        eventCentral.emitEvent({
          event: this.eventTypes.one,
          params: paramsToEmit,
        });
      };

      emitTypes.forEach((type) => {
        socketManager.addEvent(type, func);
      });
    }
  }

  /**
   * Retrieves objects from server.
   * @param {Object} params - Parameters.
   * @param {Object} [params.emitParams] - Data to send to the server.
   * @param {boolean} [params.reset] - Should stored objects be reset?
   */
  fetchObjects({
    event,
    callback,
    emitParams = {},
    reset = false,
  }) {
    socketManager.emitEvent(event || this.retrieveEvents.many, emitParams, ({ error, data }) => {
      if (error) {
        const errorParams = {
          event: this.retrieveEvents.many,
          data: emitParams,
        };

        eventCentral.emitEvent({
          event: eventCentral.Events.ERROR,
          params: errorParams,
        });

        this.hasFetched = true;

        return;
      }

      const objects = data[this.objectTypes.many];
      const params = {};
      params[this.objectTypes.many] = objects;
      params.hasReset = reset;

      if (reset) {
        this.objects = {};
      }

      objects.forEach((object) => {
        this.objects[object.objectId] = object;
      });

      this.hasFetched = true;

      if (!callback) {
        eventCentral.emitEvent({
          params,
          event: this.eventTypes.many,
        });

        return;
      }

      callback({ error, data });
    });
  }

  /**
   * Retrieve object from server.
   * @param {Object} params - Parameters.
   * @param {Object} params.params - Parameters to send to the server.
   * @param {boolean} [params.noEmit] - Should the event emit be suppressed?
   * @param {Function} [params.callback] - Callback.
   */
  fetchObject({
    params,
    noEmit,
    callback = () => {},
  }) {
    socketManager.emitEvent(this.retrieveEvents.one, params, ({ error, data }) => {
      if (error) {
        if (!noEmit) {
          const errorParams = {
            event: this.retrieveEvents.one,
            data: params,
          };

          eventCentral.emitEvent({
            event: eventCentral.Events.ERROR,
            params: errorParams,
          });
        }

        callback({ error });

        return;
      }

      const object = data[this.objectTypes.one];
      const dataToSend = { data: {} };
      const eventParams = {};

      eventParams[this.objectTypes.one] = object;
      dataToSend.data[this.objectTypes.one] = object;

      if (this.objects[object.objectId]) {
        Object.keys(object).forEach((param) => {
          this.objects[object.objectId][param] = object[param];
        });
      } else {
        this.objects[object.objectId] = object;
      }

      if (!noEmit) {
        eventCentral.emitEvent({
          params: eventParams,
          event: this.eventTypes.one,
        });
      }

      callback(dataToSend);
    });
  }

  /**
   * Craete an object on the server and return the created object.
   * @param {Object} params - Parameters.
   * @param {Object} params.params - Parameters to send.
   * @param {Function} params.callback - Callback.
   * @param {string} [params.event] - Event type to emit. Will override the default one.
   */
  createObject({
    params,
    callback,
    event,
  }) {
    if (!event && !this.createEvents) {
      callback({ error: noFunctionError });

      return;
    }

    socketManager.emitEvent(event || this.createEvents.one, params, ({ error, data }) => {
      if (error) {
        callback({ error });

        return;
      }

      const object = data[this.objectTypes.one];

      this.objects[object.objectId] = object;

      eventCentral.emitEvent({
        event: this.eventTypes.one,
        params: data,
      });

      callback({ data });
    });
  }

  /**
   * Update an object on the server and return the updated object.
   * @param {Object} params - Parameters.
   * @param {Object} params.params - Parameters to send.
   * @param {Function} params.callback - Callback.
   * @param {string} [params.event] - Event type to emit. Will override the default one.
   */
  updateObject({
    params,
    callback,
    event,
  }) {
    if (!event && !this.updateEvents) {
      callback({ error: noFunctionError });

      return;
    }

    socketManager.emitEvent(event || this.updateEvents.one, params, ({ error, data }) => {
      if (error) {
        callback({ error });

        return;
      }

      const dataToReturn = data;
      const object = data[this.objectTypes.one];

      if (this.objects[object.objectId]) {
        Object.keys(object).forEach((param) => {
          this.objects[object.objectId][param] = object[param];
        });
      } else {
        this.objects[object.objectId] = object;
      }

      dataToReturn[this.objectTypes.one] = this.objects[object.objectId];

      eventCentral.emitEvent({
        event: this.eventTypes.one,
        params: data,
      });

      callback({ data });
    });
  }

  /**
   * Remove an object from the server and local.
   * @param {Object} params - Parameters.
   * @param {Object} params.params - Parameters to send.
   * @param {Function} params.callback - Callback.
   */
  removeObject({
    params,
    callback,
  }) {
    if (!this.removeEvents) {
      callback({ error: noFunctionError });

      return;
    }

    socketManager.emitEvent(this.removeEvents.one, params, ({ error, data }) => {
      if (error) {
        callback({ error });

        return;
      }

      const object = data[this.objectTypes.one];

      this.objects[object.objectId] = undefined;

      eventCentral.emitEvent({
        event: this.eventTypes.one,
        params: data,
      });

      callback({ data });
    });
  }

  /**
   * Get locally stored object.
   * @param {Object} params - Parameters.
   * @param {string} params.objectId - Id of the object.
   * @return {Object} Found object.
   */
  getObject({ objectId }) {
    return this.objects[objectId];
  }

  /**
   * Get locally stored objects.
   * Setting paramName and value will retrieve objects matching them.
   * @param {Object} params - Parameters.
   * @param {Object} params.filter - Filter to check against.
   * @param {boolean} [params.orCheck] - Is it enough for only one sent value to match?
   * @param {Object} [params.sorting] - Sorting of the returned objects.
   * @param {string} params.sorting.paramName - Name of the parameter to sort by.
   * @param {string} [params.sorting.fallbackParamName] - Name of the parameter to sort by, if paramName is not found.
   * @param {boolean} [params.sorting.reverse] - Should the sort order be reversed?
   * @return {Object} Stored objects.
   */
  getObjects({
    filter,
    sorting,
  }) {
    const sortFunc = (a, b) => {
      const aParam = (a[sorting.paramName] || a[sorting.fallbackParamName]).toLowerCase();
      const bParam = (b[sorting.paramName] || b[sorting.fallbackParamName]).toLowerCase();

      if (aParam < bParam) {
        return sorting.reverse ?
          1 :
          -1;
      } else if (aParam > bParam) {
        return sorting.reverse ?
          -1 :
          1;
      }

      return 0;
    };
    const objects = Object.keys(this.objects).map(objectKey => this.objects[objectKey]);

    if (filter) {
      const { orCheck } = filter;

      const filteredObjects = objects.filter((object) => {
        if (orCheck) {
          return filter.rules.some((rule) => {
            if (rule.shouldInclude) {
              return rule.paramValue.every(value => object[rule.paramName].includes(value));
            }

            return rule.paramValue === object[rule.paramName];
          });
        }

        return filter.rules.every((rule) => {
          if (rule.shouldInclude) {
            return rule.paramValue.every(value => object[rule.paramName].includes(value));
          }

          return rule.paramValue === object[rule.paramName];
        });
      });

      return sorting ?
        filteredObjects.sort(sortFunc) :
        filteredObjects;
    }

    return sorting ?
      objects.sort(sortFunc) :
      objects;
  }
}

module.exports = BaseData;
