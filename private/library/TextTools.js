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
const tools = require('./Tools');
const elementcreator = require('./ElementCreator');

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
const specials = '!;#&';
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
   * @param {Number} length - Length of randomised string
   * @returns {string} - Randomised string
   */
  static createCharString(length) {
    return this.createRandString({
      selection: chars,
      length,
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
      selection: numbers + chars,
      length,
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
   * @returns {string} - Randomised string
   */
  static createMixedString(length) {
    return this.createRandString({
      selection: numbers + chars + specials,
      length,
    });
  }

  static randomiseCase(string) {
    return Array.from(string).map((char) => {
      if (Math.random() > 0.5) {
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

      result += Math.random() > 0.5 ? selection[randomVal].toUpperCase() : selection[randomVal];
    }

    return result;
  }

  static createMixedArray({ rowAmount, length, requiredClickableStrings = [], requiredFunc = () => {} }) {
    const selection = chars + numbers + specials;
    const spans = [];
    let indexes = [];

    for (let i = 0; i < rowAmount; i += 1) {
      spans.push(this.createRandString({ selection, length }));
      indexes.push(i);
    }

    indexes = tools.shuffleArray(indexes);

    for (let i = 0; i < requiredClickableStrings.length; i += 1) {
      const stringLength = requiredClickableStrings[i].length;
      const randomStringIndex = Math.floor(Math.random() * (length - stringLength - 1));
      const randomIndex = indexes[i];
      const randomString = spans[randomIndex];
      const span = elementcreator.createSpan({});

      /**
       * Inserts required string and cuts away enough characters from the left and right of the random string to keep the length intact
       */
      span.appendChild(elementcreator.createSpan({
        text: randomString.slice(0, randomStringIndex),
      }));
      span.appendChild(elementcreator.createSpan({
        text: this.randomiseCase(requiredClickableStrings[i]),
        classes: ['clickable'],
        func: () => { requiredFunc(requiredClickableStrings[i]); },
      }));
      span.appendChild(elementcreator.createSpan({
        text: randomString.slice(randomStringIndex + stringLength),
      }));

      spans[randomIndex] = span;
    }

    return spans;
  }

  static replaceWhitespace(string) {
    return Array.from(string).map(char => this.findOneReplace(char, ' ', this.createMixedString(1))).join('');
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
