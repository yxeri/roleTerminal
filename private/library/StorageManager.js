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

const converters = require('./Converters');
const eventCentral = require('./EventCentral');

class StorageManager {
  static addWatchers() {
    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_ROOM,
      func: ({ room }) => {
        this.setCurrentRoom(room.objectId);
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_FORUM,
      func: ({ forum }) => {
        this.setCurrentForum(forum.objectId);
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.SWITCH_LANGUAGE,
      func: ({ language }) => {
        this.setLanguage(language.code);
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGIN,
      func: ({ user }) => {
        const { accessLevel, defaultRoomId, objectId } = user;

        this.setUser({
          accessLevel,
          defaultRoomId,
          userId: objectId,
        });
      },
    });
  }

  /**
   * Sets item to localStorage.
   * @static
   * @param {string} name - Name of the item.
   * @param {Object} item - Item to be set.
   */
  static setLocalVal(name, item) {
    if (typeof item === 'string') {
      localStorage.setItem(name, item);
    } else {
      localStorage.setItem(name, converters.stringifyObject(item));
    }
  }

  /**
   * Gets item from localStorage.
   * @static
   * @param {string} name - Name of the item to be retrieved.
   * @returns {Object|number|boolean|string|[]} - Retrieved item.
   */
  static getLocalVal(name) {
    return localStorage.getItem(name);
  }

  /**
   * Removes item from localStorage.
   * @static
   * @param {string} name - Name of the item to be removed.
   */
  static removeLocalVal(name) {
    localStorage.removeItem(name);
  }

  /**
   * Set user.
   * @static
   */
  static setUser({
    accessLevel,
    currentRoom,
    userId,
  }) {
    this.setAccessLevel(accessLevel);
    this.setCurrentRoom(currentRoom);
    this.setUserId(userId);

    eventCentral.emitEvent({
      event: eventCentral.Events.ACCESS_CHANGE,
      params: { accessLevel },
    });
  }

  /**
   * Reset user.
   * @static
   */
  static resetUser() {
    this.removeGameCode();
    this.removeToken();
    this.setCurrentRoom(this.getPublicRoomId());
    this.setAccessLevel(0);
    this.removeCurrentForum();
    this.removeUserId();

    eventCentral.emitEvent({
      event: eventCentral.Events.ACCESS_CHANGE,
      params: { accessLevel: 0 },
    });
  }

  static setPublicRoomId(roomId) {
    this.setLocalVal('publicRoom', roomId);
  }

  static getPublicRoomId() {
    return this.getLocalVal('publicRoom');
  }

  /**
   * Get device Id.
   * @static
   * @returns {string} Device Id.
   */
  static getDeviceId() {
    return this.getLocalVal('deviceId');
  }

  /**
   * Set device Id.
   * @static
   * @param {string} deviceId - Device Id.
   */
  static setDeviceId(deviceId) {
    this.setLocalVal('deviceId', deviceId);
  }

  /**
   * Get user Id.
   * @static
   * @returns {string} User Id.
   */
  static getUserId() {
    return this.getLocalVal('userId');
  }

  /**
   * Set user Id.
   * @static
   * @param {string} userId - User Id.
   */
  static setUserId(userId) {
    this.setLocalVal('userId', userId);
  }

  static removeUserId() {
    this.removeLocalVal('userId');
  }

  /**
   * Set center coordinates for the map.
   * @static
   * @param {Object} coordinates - Coordinates.
   * @param {number} coordinates.longitude - Longitude.
   * @param {number} coordinates.latitude - Latitude.
   */
  static setCenterCoordinates(coordinates) {
    this.setLocalVal('centerCoordinates', converters.stringifyObject(coordinates));
  }

  static getCenterCoordinates() {
    return converters.convertToObject(this.getLocalVal('centerCoordinates'));
  }

  /**
   * Set corner one coordinates for the map.
   * @static
   * @param {Object} coordinates - Parameters.
   * @param {number} coordinates.longitude - Longitude.
   * @param {number} coordinates.latitude - Latitude.
   */
  static setCornerOneCoordinates(coordinates) {
    this.setLocalVal('cornerOneCoordinates', converters.stringifyObject(coordinates));
  }

  static getCornerOneCoordinates() {
    return converters.convertToObject(this.getLocalVal('cornerOneCoordinates'));
  }

  /**
   * Set corner two coordinates for the map.
   * @static
   * @param {Object} coordinates - Coordinates.
   * @param {number} coordinates.longitude - Longitude.
   * @param {number} coordinates.latitude - Latitude.
   */
  static setCornerTwoCoordinates(coordinates) {
    this.setLocalVal('cornerTwoCoordinates', converters.stringifyObject(coordinates));
  }

  static getCornerTwoCoordinates() {
    return converters.convertToObject(this.getLocalVal('cornerTwoCoordinates'));
  }

  /**
   * Set default zoom level on the map.
   * @static
   * @param {number} defaultZoomLevel - Default zoom level on the map.
   */
  static setDefaultZoomLevel(defaultZoomLevel) {
    this.setLocalVal('defaultZoom', defaultZoomLevel);
  }

  static getDefaultZoomlevel() {
    return converters.convertToInt(this.getLocalVal('defaultZoom'));
  }

  /**
   * Set the amount of years to be used to adjust the current date with.
   * @static
   * @param {number} yearModification - Amount of years that will be added/removed from the current year.
   */
  static setYearModification(yearModification) {
    this.setLocalVal('yearModification', yearModification);
  }

  /**
   * Get amount of years to adjust the current date with.
   * @return {number} Amount of years.
   */
  static getYearModification() {
    return converters.convertToInt(this.getLocalVal('yearModification'));
  }

  static removeYearModification() {
    this.removeLocalVal('yearModification');
  }

  /**
   * Set the amount of days to be used to adjust the current date with.
   * @static
   * @param {number} dayModification - Amount of days that will be added/removed from the current date.
   */
  static setDayModification(dayModification) {
    this.setLocalVal('dayModification', dayModification);
  }

  /**
   * Get amount of days to adjust the current date with.
   * @return {number} Amount of years.
   */
  static getDayModification() {
    return converters.convertToInt(this.getLocalVal('dayModification'));
  }

  static removeDayModification() {
    this.removeLocalVal('dayModification');
  }

  static setGameCode(gameCode) {
    this.setLocalVal('gameCode', gameCode);
  }

  static getGameCode() {
    return parseInt(this.getLocalVal('gameCode'), 10);
  }

  static removeGameCode() {
    this.removeLocalVal('gameCode');
  }

  static setToken(token) {
    this.setLocalVal('token', token);
  }

  static getToken() {
    return this.getLocalVal('token');
  }

  static removeToken() {
    this.removeLocalVal('token');
  }

  static setStaticPosition(coordinates) {
    this.setLocalVal('staticPosition', converters.stringifyObject({ coordinates }));
  }

  static getStaticPosition() {
    return converters.convertToObject(this.getLocalVal('staticPosition'));
  }

  static removeStaticPosition() {
    this.removeLocalVal('staticPosition');
  }

  static setRequiresVerification(requiresVerification) {
    this.setLocalVal('requiresVerification', requiresVerification);
  }

  static getRequiresVerification() {
    return this.getLocalVal('requiresVerification') === 'true';
  }

  static setCurrentRoom(roomId) {
    this.setLocalVal('currentRoom', roomId);
  }

  static getCurrentRoom() {
    return this.getLocalVal('currentRoom');
  }

  static removeCurrentForum() {
    this.removeLocalVal('currentForum');
  }

  static setCurrentForum(forumId) {
    console.log('set current', forumId);

    this.setLocalVal('currentForum', forumId);
  }

  static getCurrentForum() {
    return this.getLocalVal('currentForum');
  }

  /**
   * Get user's access level.
   * @static
   * @returns {number} Access level.
   */
  static getAccessLevel() {
    return converters.convertToInt(this.getLocalVal('accessLevel'));
  }

  /**
   * Set user's access level.
   * @static
   * @param {number} accessLevel - User's access level.
   */
  static setAccessLevel(accessLevel) {
    this.setLocalVal('accessLevel', accessLevel);
  }

  static setLanguage(language) {
    this.setLocalVal('language', language);
  }

  static getLanguage() {
    this.getLocalVal('language');
  }
}

StorageManager.addWatchers();

module.exports = StorageManager;
