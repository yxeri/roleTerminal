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
const chars = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Numbers used when generating random text
 * Removed 1 to decrease user errors when reading the random string
 * @type {string}
 */
const numbers = '0123456789';

/**
 * Special characters used when generating random text
 * @type {string}
 */
const specials = '!;#&()[]';

/**
 * Used when generating random binary text
 * @type {string}
 */
const binary = '01';
const allowedRegex = /^[\w\d\såäöÅÄÖ-]+$/;
const internationalRegex = /^[\w\d]+$/;

class TextTools {
  /**
   * Beautifies number by adding a 0 before the number if it is lower than 10
   * @static
   * @param {Number} number - Number to be beautified
   * @returns {Number|string} - Single number or string with 0 + number
   */
  static beautifyNumber(number) {
    return number > 9 ?
      number :
      `0${number}`;
  }

  static getHoursAndMinutes(time) {
    const hours = TextTools.beautifyNumber(Math.trunc(time / 60));
    const minutes = TextTools.beautifyNumber(time % 60);

    return { hours, minutes };
  }

  /**
   * Takes date and returns shorter human-readable time.
   * @static
   * @param {Object} params - Parameters.
   * @param {Date|number} params.date - Date.
   * @param {Number} [params.offset] - Should hours be modified from the final time?
   * @param {boolean} [params.lockDate] - Should the year stay unmodified?
   * @returns {Object} Human-readable time and date.
   */
  static generateTimestamp({ date, offset, lockDate }) {
    const newDate = new Date(date);
    const timeStamp = {};
    const yearModification = storageManager.getYearModification();
    const dayModification = storageManager.getDayModification();

    if (offset) {
      newDate.setHours(newDate.getHours() + offset);
    }

    if (!lockDate && !Number.isNaN(yearModification)) {
      if (yearModification && !Number.isNaN(yearModification)) {
        newDate.setFullYear(newDate.getFullYear() + parseInt(yearModification, 10));
      }

      if (dayModification && !Number.isNaN(dayModification)) {
        newDate.setDate(newDate.getDate() + parseInt(dayModification, 10));
      }
    }

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
  static findOneReplace(text, find, replaceWith) {
    return text.replace(new RegExp(find), replaceWith);
  }

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
   * @param {Number} length - Length of randomised string
   * @returns {string} - Randomised string
   */
  static createCharString(length) {
    return this.createRandString({
      length,
      selection: chars,
    });
  }

  /**
   * Creates and returns a alphanumerical randomised string
   * @static
   * @param {Number} length - Length of randomised string
   * @returns {string} - Randomised string
   */
  static createAlphaNumbericalString(length) {
    return this.createRandString({
      length,
      selection: numbers + chars,
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
      length,
      selection: binary,
    });
  }

  /**
   * Creates and returns a randomised string, containing alphanumeric and special characters
   * @static
   * @param {Number} length - Length of randomised string
   * @returns {string} - Randomised string
   */
  static createMixedString(length) {
    return this.createRandString({
      length,
      selection: numbers + chars + specials,
    });
  }

  static randomiseCase(string, charToLower) {
    return string.split().map((char) => {
      if (char === charToLower) {
        return char.toLowerCase();
      } else if (Math.random() > 0.5) {
        return char.toUpperCase();
      }

      return char;
    }).join('');
  }

  static createRandString({ selection, length }) {
    const randomLength = selection.length;
    let result = '';

    for (let i = 0; i < length; i += 1) {
      const randomVal = Math.round(Math.random() * (randomLength - 1));

      result += Math.random() > 0.5 ?
        selection[randomVal].toUpperCase() :
        selection[randomVal];
    }

    return result;
  }

  static replaceWhitespace(string) {
    return string.split().map((char) => {
      return this.findOneReplace(char, ' ', this.createMixedString(1));
    }).join('');
  }

  /**
   * Copies string to avoid the original being consumed.
   * @static
   * @param {string} string - String to copy.
   * @returns {string} - String copy.
   */
  static copyString(string) {
    return string && string !== null ?
      JSON.parse(JSON.stringify(string)) :
      '';
  }

  static isInternationalAllowed(text) {
    return internationalRegex.test(text);
  }

  static appendNumberSuffix(number) {
    const modTen = number % 10;
    const modHundred = number % 100;

    if (modTen === 1 && modHundred !== 11) {
      return `${number}st`;
    } else if (modTen === 2 && modHundred !== 12) {
      return `${number}nd`;
    } else if (modTen === 3 && modHundred !== 13) {
      return `${number}rd`;
    }

    return `${number}th`;
  }
}

module.exports = TextTools;
