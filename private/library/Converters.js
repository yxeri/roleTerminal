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

class Converters {
  /**
   * Convert string representation to object
   * @static
   * @param {string} value - Value to be converted
   * @returns {Object|null} Converted object. null if the value was not set
   */
  static convertToObject(value) { return value && value !== null ? JSON.parse(value) : {}; }

  /**
   * Convert string to boolean
   * @static
   * @param {string} value - Value to be converted
   * @returns {boolean|null} Converted boolean. null if the value was not a boolean
   */
  static convertToBoolean(value) {
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }

    return null;
  }

  /**
   * Convert string to int
   * @static
   * @param {string} value - Value to be converted
   * @returns {number|null} Converted number. null if the value was not a number
   */
  static convertToInt(value) {
    if (Number.isNaN(value)) { return null; }

    return parseInt(value, 10);
  }

  /**
   * Convert string to float
   * @static
   * @param {string} value - Value to be converted
   * @returns {number|null} Converted number. null if the value was not a number
   */
  static convertToFloat(value) {
    if (Number.isNaN(value)) { return null; }

    return parseFloat(value);
  }

  /**
   * Stringifies object for JSON storageManager
   * @static
   * @param {Object} value - Object to stringify
   * @returns {string} Stringified object
   */
  static stringifyObject(value) { return JSON.stringify(value); }
}

module.exports = Converters;
