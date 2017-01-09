/*
 Copyright 2015 Aleksandar Jankovic

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

// TODO Move all converters to a converter file

/**
 * Convert string representation to object
 * @param {string} value - Value to be converted
 * @returns {Object|null} Converted object. null if the value was not set
 */
function convertToObject(value) {
  return value && value !== null ? JSON.parse(value) : null;
}

/**
 * Convert string to boolean
 * @param {string} value - Value to be converted
 * @returns {boolean|null} Converted boolean. null if the value was not a boolean
 */
function convertToBoolean(value) {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }

  return null;
}

/**
 * Convert string to int or float
 * @param {string} value - Value to be converted
 * @returns {number|null} Converted number. null if the value was not a number
 */
function convertToNumber(value) {
  if (isNaN(value)) {
    return null;
  }

  if (Number.isInteger(value)) {
    return parseInt(value, 10);
  }

  return parseFloat(value);
}

/**
 * Stringifies object for JSON storage
 * @param {Object} value - Object to stringify
 * @returns {string} Stringified object
 */
function stringifyObject(value) {
  return JSON.stringify(value);
}

/**
 * Sets item to localStorage
 * @private
 * @param {string} name - Name of the item
 * @param {Object} item - Item to be set
 */
function setLocalVal(name, item) {
  localStorage.setItem(name, stringifyObject(item));
}

/**
 * Gets item from localStorage
 * @private
 * @param {string} name - Name of the item to be retrieved
 * @returns {Object} - Retrieved item
 */
function getLocalVal(name) {
  const value = localStorage.getItem(name);
  const type = typeof value;

  if (Array.isArray(value) || type === 'object') {
    return convertToObject(value);
  } else if (type === 'number') {
    return convertToNumber(value);
  } else if (type === 'boolean' || (type === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false'))) {
    return convertToBoolean(value);
  }

  return value;
}

/**
 * Removes item from localStorage
 * @private
 * @param {string} name - Name of the item to be removed
 */
function removeLocalVal(name) {
  localStorage.removeItem(name);
}

exports.setLocalVal = setLocalVal;
exports.getLocalVal = getLocalVal;
exports.removeLocalVal = removeLocalVal;
