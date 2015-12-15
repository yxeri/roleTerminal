'use strict';

const logger = require('./logger');

function checkKeys(data, expected) {
  const expectedKeys = Object.keys(expected);

  for (let i = 0; i < expectedKeys.length; i++) {
    const expectedKey = expectedKeys[i];

    if (!data[expectedKey] || data[expectedKey] === null) {
      logger.sendErrorMsg(logger.ErrorCodes.general, ['Key missing:', expectedKey]);

      return false;
    }

    const dataObj = data[expectedKey];

    if (dataObj !== null && !(dataObj instanceof Array) && typeof dataObj === 'object') {
      return checkKeys(dataObj, expected[expectedKey]);
    }
  }

  return true;
}

function isValidData(data, expected) {
  if ((!data || data === null) || (!expected || expected === null)) {
    logger.sendErrorMsg(logger.ErrorCodes.general, 'Data and expected structure have to be set');

    return false;
  }

  const isValid = checkKeys(data, expected);

  if (!isValid) {
    logger.sendErrorMsg(logger.ErrorCodes.general, [
      'Expected:',
      expected,
      'Received:',
      data,
    ]);
  }

  return isValid;
}

exports.isValidData = isValidData;
