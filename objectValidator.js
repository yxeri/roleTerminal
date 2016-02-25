'use strict';

const logger = require('./logger');

function checkKeys(data, expected) {
  const expectedKeys = Object.keys(expected);

  for (let i = 0; i < expectedKeys.length; i++) {
    const expectedKey = expectedKeys[i];

    if ((!data[expectedKey] || data[expectedKey] === null) && typeof data[expectedKey] !== 'boolean') {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.general,
        text: ['Key missing: ' + expectedKey],
      });

      return false;
    }

    const dataObj = data[expectedKey];
    const expectedDataObj = expected[expectedKey];

    if (!(expectedDataObj instanceof Array) && typeof expectedDataObj === 'object') {
      return checkKeys(dataObj, expected[expectedKey]);
    }
  }

  return true;
}

function isValidData(data, expected) {
  if ((!data || data === null) || (!expected || expected === null)) {
    logger.sendErrorMsg({
      code: logger.ErrorCodes.general,
      text: ['Data and expected structure have to be set'],
    });

    return false;
  }

  const isValid = checkKeys(data, expected);

  if (!isValid) {
    logger.sendErrorMsg({
      code: logger.ErrorCodes.general,
      text: ['Expected: ' + JSON.stringify(expected)],
    });
  }

  return isValid;
}

exports.isValidData = isValidData;
