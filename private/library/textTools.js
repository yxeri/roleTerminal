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

/**
 * Characters used when generating random text
 * Removed l and i to decrease user errors when reading the random strings
 * @private
 * @type {string}
 */
const chars = 'abcdefghjkmnopqrstuvwxyz';
/**
 * Numbers used when generating random text
 * Removed 1 to decrease user errors when reading the random string
 * @private
 * @type {string}
 */
const numbers = '023456789';
/**
 * Special characters used when generating random text
 * @private
 * @type {string}
 */
const specials = '/\\!;:#&*';
/**
 * Used when generating random binary text
 * @private
 * @type {string}
 */
const binary = '01';

/**
 * Beautifies number by adding a 0 before the number if it is lower than 10
 * @static
 * @param {Number} number - Number to be beautified
 * @returns {Number|string} - Single number or string with 0 + number
 */
function beautifyNumber(number) {
  return number > 9 ? number : `0${number}`;
}

/**
 * Takes date and returns shorter human-readable time
 * @static
 * @param {Object} params - Parameters
 * @param {Date|number} params.date - Date
 * @param {Number} [params.offset] - Should hours be modified from the final time?
 * @returns {Object} Human-readable time and date
 */
function generateTimeStamp({ date, offset }) {
  const newDate = new Date(date);
  const timeStamp = {};

  if (offset) {
    newDate.setHours(newDate.getHours() + offset);
  }

  timeStamp.mins = beautifyNumber(newDate.getMinutes());
  timeStamp.hours = beautifyNumber(newDate.getHours());
  timeStamp.seconds = beautifyNumber(newDate.getSeconds());
  timeStamp.month = beautifyNumber(newDate.getMonth() + 1);
  timeStamp.day = beautifyNumber(newDate.getDate());
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
function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

/**
 * Replaces part of the sent string and returns it
 * @static
 * @param {string} text - Original string
 * @param {string} find - Substring to replace
 * @param {string} replaceWith - String that will replace the found substring
 * @returns {string} - Modified string
 */
function findOneReplace(text, find, replaceWith) {
  return text.replace(new RegExp(find), replaceWith);
}

/**
 * Trims whitespaces from beginning and end of the string
 * Needed for Android 2.1. trim() is not supported
 * @static
 * @param {string} sentText - String to be trimmed
 * @returns {string} - String with no whitespaces in the beginning and end
 */
function trimSpace(sentText) {
  return findOneReplace(sentText, /^\s+|\s+$/, '');
}

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
function createRandString({ selection, length, upperCase, codeMode }) {
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
function createCharString(length, upperCase) {
  return createRandString({
    selection: chars,
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
function createBinaryString(length) {
  return createRandString({
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
function createMixedString(length, upperCase, codeMode) {
  return createRandString({
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
function createMixedArray(params) {
  const amount = params.amount;
  const length = params.length;
  const upperCase = params.upperCase;
  const codeMode = params.codeMode;
  const requiredStrings = params.requiredStrings || [];
  const text = [];
  const requiredIndexes = [];

  for (let i = 0; i < amount; i += 1) {
    text.push(createMixedString(length, upperCase, codeMode));
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

/**
 * Copies string to avoid the original being consumed
 * @private
 * @param {string} string - String to copy
 * @returns {string} - String copy
 */
function copyString(string) {
  return string && string !== null ? JSON.parse(JSON.stringify(string)) : '';
}

exports.createCharString = createCharString;
exports.createBinaryString = createBinaryString;
exports.createMixedString = createMixedString;
exports.createRandString = createRandString;
exports.isTextAllowed = isTextAllowed;
exports.trimSpace = trimSpace;
exports.generateTimeStamp = generateTimeStamp;
exports.beautifyNumb = beautifyNumber;
exports.createMixedArray = createMixedArray;
exports.copyString = copyString;
