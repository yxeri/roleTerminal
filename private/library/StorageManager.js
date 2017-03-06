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
  /**
   * Sets item to localStorage
   * @static
   * @param {string} name - Name of the item
   * @param {Object} item - Item to be set
   */
  static setLocalVal(name, item) {
    if (typeof item === 'string') {
      localStorage.setItem(name, item);
    } else {
      localStorage.setItem(name, converters.stringifyObject(item));
    }
  }

  /**
   * Gets item from localStorage
   * @static
   * @param {string} name - Name of the item to be retrieved
   * @returns {Object|number|boolean|string|[]} - Retrieved item
   */
  static getLocalVal(name) { return localStorage.getItem(name); }

  /**
   * Removes item from localStorage
   * @static
   * @param {string} name - Name of the item to be removed
   */
  static removeLocalVal(name) { localStorage.removeItem(name); }

  /**
   * Get access level
   * @static
   * @returns {number} Access level
   */
  static getAccessLevel() { return converters.convertToInt(this.getLocalVal('accessLevel')); }

  /**
   * Set access level
   * @static
   * @param {number} accessLevel - Access level
   */
  static setAccessLevel(accessLevel) {
    this.setLocalVal('accessLevel', accessLevel);
    eventCentral.triggerEvent({ event: eventCentral.Events.ACCESS, params: { accessLevel } });
  }

  /**
   * Get user name
   * @static
   * @returns {string} User name
   */
  static getUserName() { return this.getLocalVal('userName'); }

  /**
   * Set user name
   * @static
   * @param {string} userName - User name
   */
  static setUserName(userName) { this.setLocalVal('userName', userName); }

  /**
   * Remove user name and set access level to 0
   * @static
   */
  static removeUser() {
    this.removeLocalVal('userName');
    this.setAccessLevel(0);
    this.removeLocalVal('aliases');
    this.removeLocalVal('selectedAlias');
  }

  /**
   * Get device ID
   * @static
   * @returns {string} Device ID
   */
  static getDeviceId() { return this.getLocalVal('accessLevel'); }

  /**
   * Set device ID
   * @static
   * @param {string} deviceId - Device ID
   */
  static setDeviceId(deviceId) { this.setLocalVal('deviceId', deviceId); }

  /**
   * Get user aliases
   * @static
   * @returns {string[]} User aliases
   */
  static getAliases() { return converters.convertToObject(this.getLocalVal('aliases')) || []; }

  /**
   * Set user aliases
   * @static
   * @param {string[]} aliases - User aliases
   */
  static setAliases(aliases = []) {
    const sortedAliases = aliases.sort();

    this.setLocalVal('aliases', converters.stringifyObject(sortedAliases));
  }

  /**
   * Add a user alias
   * @static
   * @param {string} alias - User alias
   */
  static addAlias(alias) {
    const aliases = this.getAliases();
    aliases.push(alias.toLowerCase());

    this.setAliases(aliases);
  }

  /**
   * Set selected alias
   * @static
   * @param {string} alias - Selected alias
   */
  static setSelectedAlias(alias) { this.setLocalVal('selectedAlias', alias.toLowerCase()); }

  /**
   * Get selected alias
   * @static
   * @returns {string} Selected alias
   */
  static getSelectedAlias() { return this.getLocalVal('selectedAlias'); }

  /**
   * Remove selected alias
   * @static
   */
  static removeSelectedAlias() { this.removeLocalVal('selectedAlias'); }

  /**
   * Set center coordinates for the map
   * @static
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   */
  static setCenterCoordinates(longitude, latitude) { this.setLocalVal('centerCoordinates', converters.stringifyObject({ longitude, latitude })); }

  static getCenterCoordinates() { return converters.convertToObject(this.getLocalVal('centerCoordinates')); }

  /**
   * Set corner one coordinates for the map
   * @static
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   */
  static setCornerOneCoordinates(longitude, latitude) { this.setLocalVal('cornerOneCoordinates', converters.stringifyObject({ longitude, latitude })); }

  static getCornerOneCoordinates() { return converters.convertToObject(this.getLocalVal('cornerOneCoordinates')); }

  /**
   * Set corner two coordinates for the map
   * @static
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   */
  static setCornerTwoCoordinates(longitude, latitude) { this.setLocalVal('cornerTwoCoordinates', converters.stringifyObject({ longitude, latitude })); }

  static getCornerTwoCoordinates() { return converters.convertToObject(this.getLocalVal('cornerTwoCoordinates')); }

  /**
   * Set default zoom level on the map
   * @static
   * @param {number} defaultZoomLevel - Default zoom level on the map
   */
  static setDefaultZoomLevel(defaultZoomLevel) { this.setLocalVal('defaultZoomLevel', defaultZoomLevel); }

  static getDefaultZoomlevel() { return converters.convertToInt(this.getLocalVal('defaultZoomLevel')); }

  /**
   * Set year modification
   * @static
   * @param {number} yearModification - Amount of years that will be increased/decreased to current year
   */
  static setYearModification(yearModification) { this.setLocalVal('yearModification', yearModification); }

  static getYearModification() { return converters.convertToInt(this.getLocalVal('yearModification')); }

  static setRoom(room) {
    this.setLocalVal('room', room);
    eventCentral.triggerEvent({ event: eventCentral.Events.SWITCHROOM, params: { room } });
  }

  static getRoom() { return this.getLocalVal('room'); }

  static setTeam(team) {
    if (team) {
      this.setLocalVal('team', team);
    }
  }

  static getTeam() { return this.getLocalVal('team'); }
}

eventCentral.addWatcher({ watcherParent: StorageManager, event: eventCentral.Events.ALIAS, func: ({ aliases }) => { StorageManager.setAliases(aliases); } });

module.exports = StorageManager;
