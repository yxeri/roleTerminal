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

const storageManager = require('./StorageManager');

/**
 * Characters used when generating random text
 * Removed l and i to decrease user errors when reading the random strings
 * @type {string}
 */
const chars = 'abcdefghjkmnopqrstuvwxyz';
/**
 * Numbers used when generating random text
 * Removed 1 to decrease user errors when reading the random string
 * @type {string}
 */
const numbers = '023456789';
/**
 * Special characters used when generating random text
 * @type {string}
 */
const specials = '/\\!;:#&*';
/**
 * Used when generating random binary text
 * @type {string}
 */
const binary = '01';
const allowedRegex = /^[\w\d\såäöÅÄÖ-]+$/g;
const internationalRegex = /^[\w\d]+$/g;

class TextTools {
  /**
   * Beautifies number by adding a 0 before the number if it is lower than 10
   * @static
   * @param {Number} number - Number to be beautified
   * @returns {Number|string} - Single number or string with 0 + number
   */
  static beautifyNumber(number) {
    return number > 9 ? number : `0${number}`;
  }

  /**
   * Takes date and returns shorter human-readable time
   * @static
   * @param {Object} params - Parameters
   * @param {Date|number} params.date - Date
   * @param {Number} [params.offset] - Should hours be modified from the final time?
   * @param {boolean} [params.lockYear] - Should the year stay unmodified?
   * @returns {Object} Human-readable time and date
   */
  static generateTimeStamp({ date, offset, lockDate }) {
    const newDate = new Date(date);
    const timeStamp = {};
    const yearModification = storageManager.getYearModification();

    if (offset) { newDate.setHours(newDate.getHours() + offset); }
    if (!lockDate && !isNaN(yearModification)) { newDate.setFullYear(newDate.getFullYear() + parseInt(yearModification, 10)); }

    timeStamp.mins = this.beautifyNumber(newDate.getMinutes());
    timeStamp.hours = this.beautifyNumber(newDate.getHours());
    timeStamp.seconds = this.beautifyNumber(newDate.getSeconds());
    timeStamp.month = this.beautifyNumber(newDate.getMonth() + 1);
    timeStamp.day = this.beautifyNumber(newDate.getDate());
    timeStamp.year = newDate.getFullYear();
    timeStamp.halfTime = `${timeStamp.hours}:${timeStamp.mins}`;
    timeStamp.fullTime = `${timeStamp.halfTime}:${timeStamp.seconds}`;
    timeStamp.halfDate = `${timeStamp.day}/${timeStamp.month}`;
    timeStamp.fullDate = `${timeStamp.halfDate}/${timeStamp.year}`;

    return timeStamp;
  }

  /**
   * Does the string contain only legal (a-zA-z0-9) alphanumerics?
   * @static
   * @param {string} text - String to be checked
   * @returns {boolean} - Does string contain only legal (a-zA-z0-9) alphanumerics?
   */
  static isTextAllowed(text) { return allowedRegex.test(text); }

  /**
   * Replaces part of the sent string and returns it
   * @static
   * @param {string} text - Original string
   * @param {string} find - Substring to replace
   * @param {string} replaceWith - String that will replace the found substring
   * @returns {string} - Modified string
   */
  static findOneReplace(text, find, replaceWith) { return text.replace(new RegExp(find), replaceWith); }

  /**
   * Trims whitespaces from beginning and end of the string
   * Needed for Android 2.1. trim() is not supported
   * @static
   * @param {string} sentText - String to be trimmed
   * @returns {string} - String with no whitespaces in the beginning and end
   */
  static trimSpace(sentText) { return this.findOneReplace(sentText, /^\s+|\s+$/, ''); }

  /**
   * Creates and returns a randomised string
   * @static
   * @param {Object} params - Parameters
   * @param {string} params.selection - Characters to randomise from
   * @param {Number} params.length - Length of randomised string
   * @param {boolean} [params.upperCase] - Should all characters be in upper case?
   * @param {boolean} [params.codeMode] - Should there be extra {} and () inserted into the string?
   * @returns {string} - Randomised string
   */
  static createRandString({ selection, length, upperCase, codeMode }) {
    const randomLength = selection.length;
    let result = '';

    for (let i = 0; i < length; i += 1) {
      const randomVal = Math.round(Math.random() * (randomLength - 1));
      let val = Math.random() > 0.5 ? selection[randomVal].toUpperCase() : selection[randomVal];

      if (codeMode) {
        const rand = Math.random();

        // If new value is a character or number
        if (i < length - 2 && (chars + numbers).indexOf(val) > -1) {
          if (rand > 0.95) {
            val = `${val}{}`;
            i += 2;
          } else if (rand < 0.05) {
            val = `${val}()`;
            i += 2;
          }
        }
      }

      result += val;
    }

    if (upperCase) {
      return result.toUpperCase();
    }

    return result;
  }

  /**
   * Creates and returns a randomised string
   * @static
   * @param {Number} length - Length of randomised string
   * @param {boolean} upperCase - Should all characters be in upper case?
   * @returns {string} - Randomised string
   */
  static createCharString(length, upperCase) {
    return this.createRandString({
      selection: chars,
      length,
      upperCase,
    });
  }

  /**
   * Creates and returns a alphanumerical randomised string
   * @static
   * @param {Number} length - Length of randomised string
   * @param {boolean} upperCase - Should all characters be in upper case?
   * @returns {string} - Randomised string
   */
  static createAlphaNumbericalString(length, upperCase) {
    return this.createRandString({
      selection: numbers + chars,
      length,
      upperCase,
    });
  }

  /**
   * Creates and returns a randomised string, only containing 0 and 1
   * @static
   * @param {Number} length - Length of randomised string
   * @returns {string} - Randomised string
   */
  static createBinaryString(length) {
    return this.createRandString({
      selection: binary,
      length,
    });
  }

  /**
   * Creates and returns a randomised string, containing alphanumeric and special characters
   * @static
   * @param {Number} length - Length of randomised string
   * @param {boolean} upperCase - Should all characters be in upper case?
   * @param {boolean} codeMode - Should there be extra {} and () inserted into the string?
   * @returns {string} - Randomised string
   */
  static createMixedString(length, upperCase, codeMode) {
    return this.createRandString({
      selection: numbers + chars + specials,
      length,
      upperCase,
      codeMode,
    });
  }

  /**
   * Creates array with randomised strings.
   * It will also insert substrings into the randomised strings, if requiredStrings is set
   * @static
   * @param {Object} params - Parameters
   * @param {Number} params.amount - Number of randomised strings
   * @param {Number} params.length - Length of randomised string
   * @param {boolean} params.upperCase - Should all characters be in upper case?
   * @param {boolean} params.codeMode - Should there be extra {} and () inserted into the string?
   * @param {string[]} params.requiredStrings - Substrings to be added into the randomised strings
   * @returns {string[]} - Randomised strings
   */
  static createMixedArray(params) {
    const amount = params.amount;
    const length = params.length;
    const upperCase = params.upperCase;
    const codeMode = params.codeMode;
    const requiredStrings = params.requiredStrings || [];
    const text = [];
    const requiredIndexes = [];

    for (let i = 0; i < amount; i += 1) {
      text.push(this.createMixedString(length, upperCase, codeMode));
    }

    for (let i = 0; i < requiredStrings.length; i += 1) {
      const stringLength = requiredStrings[i].length;
      const randomStringIndex = Math.floor(Math.random() * (length - stringLength - 1));
      let randomArrayIndex = Math.floor(Math.random() * (amount - 2));

      /**
       * Max 1 required string per randomised string
       * Stores the indexes of the ones who already had a substring added to them
       * This rule will be ignored and multiple substrings can appear in a randomised string if the amount of required string is higher than the amount of strings to be generated
       */
      while (requiredIndexes.length < amount && requiredIndexes.indexOf(randomArrayIndex) > -1) {
        randomArrayIndex = Math.floor(Math.random() * (amount - 2));
      }

      /**
       * Inserts required string and cuts away enough characters from the left and right of the random string to keep the length intact
       */
      text[randomArrayIndex] = text[randomArrayIndex].slice(0, randomStringIndex) + requiredStrings[i] + text[randomArrayIndex].slice(randomStringIndex + stringLength);
      requiredIndexes.push(randomArrayIndex);
    }

    return text;
  }

  static replaceWhitespace(string) {
    return Array.from(string).map(char => this.findOneReplace(char, ' ', this.createMixedString(1, false, true))).join('');
  }

  /**
   * Copies string to avoid the original being consumed
   * @static
   * @param {string} string - String to copy
   * @returns {string} - String copy
   */
  static copyString(string) { return string && string !== null ? JSON.parse(JSON.stringify(string)) : ''; }

  static isInternationalAllowed(text) {
    return internationalRegex.test(text);
  }
}


module.exports = TextTools;
