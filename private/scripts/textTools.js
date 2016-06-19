/** @module */

const labels = require('./labels');

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
 * Max string length
 * @private
 * @type {Number}
 */
const lineLength = 28;

/**
 * Beautifies number by adding a 0 before the number if it is lower than 10
 * @public
 * @static
 * @returns {Number|string}
 */
function beautifyNumb(number) {
  return number > 9 ? number : `0${number}`;
}

/**
 * Takes date and returns shorter human-readable time
 * @public
 * @static
 * @param {Date} date
 * @param {boolean} full
 * @param {boolean} year
 * @returns {string}
 */
function generateTimeStamp(date, full, year) {
  let newDate = new Date(date);
  let timeStamp;

  /**
   * Splitting of date is a fix for NaN on Android 2.*
   */
  if (isNaN(newDate.getMinutes())) {
    const splitDate = date.split(/[-T:\.]+/);
    newDate = new Date(Date.UTC(splitDate[0], splitDate[1], splitDate[2], splitDate[3], splitDate[4], splitDate[5]));
  }

  const mins = beautifyNumb(newDate.getMinutes());
  const hours = beautifyNumb(newDate.getHours());
  timeStamp = `${hours}:${mins}`;

  if (full) {
    const month = beautifyNumb(newDate.getMonth());
    const day = beautifyNumb(newDate.getDate());
    timeStamp = `${day}/${month} ${timeStamp}`;
  }

  if (year) {
    const fullYear = newDate.getFullYear();
    timeStamp = `${fullYear} ${timeStamp}`;
  }

  return timeStamp;
}

/**
 * @public
 * @static
 * @returns {boolean}
 */
function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

/**
 * @public
 * @static
 * @param {string} text
 * @param {string} find
 * @param {string} replaceWith
 * @returns {string}
 */
function findOneReplace(text, find, replaceWith) {
  return text.replace(new RegExp(find), replaceWith);
}

/**
 * Needed for Android 2.1. trim() is not supported
 * @public
 * @static
 * @returns {string}
 */
function trimSpace(sentText) {
  return findOneReplace(sentText, /^\s+|\s+$/, '');
}

/**
 * @public
 * @static
 * @param {{selection: string, length: Number, upperCase: boolean, codeMode: boolean}} params
 * @returns {string}
 */
function createRandString(params) {
  const selection = params.selection;
  const length = params.length;
  const upperCase = params.upperCase;
  const codeMode = params.codeMode;
  const randomLength = selection.length;
  let result = '';

  for (let i = 0; i < length; i++) {
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
 * @public
 * @static
 * @returns {string}
 */
function createDeviceId() {
  return createRandString({
    selection: numbers + chars,
    length: 15,
    upperCase: false,
  });
}

/**
 * @public
 * @static
 * @param {{length: Number, upperCase: boolean}}
 * @returns {string}
 */
function createCharString(length, upperCase) {
  return createRandString({
    selection: chars,
    length,
    upperCase,
  });
}

/**
 * @public
 * @static
 * @returns {string}
 */
function createBinaryString(length) {
  return createRandString({
    selection: binary,
    length,
  });
}

/**
 * @public
 * @static
 * @returns {string}
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
 * @public
 * @static
 * @returns {string}
 */
function createLine(length) {
  let line = '';

  for (let i = 0; i < length; i++) {
    line += '-';
  }

  return line;
}

/**
 * @public
 * @static
 * @returns {string}
 */
function createFullLine() {
  return createLine(lineLength);
}

/**
 * @public
 * @static
 * @returns {string[]}
 */
function createCommandStart(commandName) {
  return [
    createFullLine(),
    ` ${commandName.toUpperCase()}`,
    createFullLine(),
  ];
}

/**
 * @public
 * @static
 * @returns {string}
 */
function createCommandEnd() {
  return createFullLine();
}

/**
 * @public
 * @static
 * @param {Object} data
 * @returns {string[]}
 */
function prependBroadcastMessage(data = {}) {
  const title = {};

  if (data.sender) {
    title.text = `${labels.getString('broadcast', 'broadcastFrom')} ${data.sender}`;
  } else {
    title.text = labels.getString('broadcast', 'broadcast');
  }

  return createCommandStart(title.text);
}

/**
 * @public
 * @static
 * @param {Object} message
 * @returns {Object}
 */
function addMessageSpecialProperties(message = {}) {
  const modifiedMessage = message;

  if (message.extraClass === 'broadcastMsg') {
    modifiedMessage.text = prependBroadcastMessage({ sender: message.customSender }).concat(message.text);
    modifiedMessage.text.push(createFullLine());
  }

  return modifiedMessage;
}

/**
 * @private
 * @param {string} sentString
 * @returns {string}
 */
function mixCases(sentString) {
  let mixed = '';

  for (let i = 0; i < sentString.length; i++) {
    const rand = Math.random();

    if (rand > 0.5) {
      mixed += sentString[i].toUpperCase();
    } else {
      mixed += sentString[i].toLowerCase();
    }
  }

  return mixed;
}

/**
 * @public
 * @static
 * @param {{amount: Number, length: Number, upperCase: boolean, codeMode: boolean, requiredStrings: string[]}} params
 * @returns {string[]}
 */
function createMixedArray(params) {
  const amount = params.amount;
  const length = params.length;
  const upperCase = params.upperCase;
  const codeMode = params.codeMode;
  const requiredStrings = params.requiredStrings || [];
  const text = [];
  const requiredIndexes = [];

  for (let i = 0; i < amount; i++) {
    text.push(createMixedString(length, upperCase, codeMode));
  }

  for (let i = 0; i < requiredStrings.length; i++) {
    const stringLength = requiredStrings[i].length;
    const randomStringIndex = Math.floor(Math.random() * (length - stringLength - 1));
    let randomArrayIndex = Math.floor(Math.random() * (amount - 2));

    while (requiredIndexes.length < amount && requiredIndexes.indexOf(randomArrayIndex) > - 1) {
      randomArrayIndex = Math.floor(Math.random() * (amount - 2));
    }

    text[randomArrayIndex] = text[randomArrayIndex].slice(0, randomStringIndex) + mixCases(requiredStrings[i]) + text[randomArrayIndex].slice(randomStringIndex + stringLength);
    requiredIndexes.push(randomArrayIndex);
  }

  return text;
}

exports.createDeviceId = createDeviceId;
exports.createCharString = createCharString;
exports.createBinaryString = createBinaryString;
exports.createLine = createLine;
exports.createFullLine = createFullLine;
exports.createMixedString = createMixedString;
exports.createRandString = createRandString;
exports.isTextAllowed = isTextAllowed;
exports.createCommandStart = createCommandStart;
exports.createCommandEnd = createCommandEnd;
exports.trimSpace = trimSpace;
exports.prependBroadcastMessage = prependBroadcastMessage;
exports.addMessageSpecialProperties = addMessageSpecialProperties;
exports.generateTimeStamp = generateTimeStamp;
exports.beautifyNumb = beautifyNumb;
exports.createMixedArray = createMixedArray;
