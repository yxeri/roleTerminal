/**
 * Convert string representation to object
 * @param {string} value Value to be converted
 * @returns {Object|null} Converted object. null if the value was not set
 */
export const convertToObject = (value) => {
  return value
    ? JSON.parse(value)
    : {};
};

/**
 * Convert string to boolean
 * @param {string} value Value to be converted
 * @returns {boolean|null} Converted boolean. null if the value was not a boolean
 */
export const convertToBoolean = (value) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
};

/**
 * Convert string to int
 * @param {string} value Value to be converted
 * @returns {number|null} Converted number. null if the value was not a number
 */
export const convertToInt = (value) => {
  if (Number.isNaN(value)) {
    return null;
  }

  return parseInt(value, 10);
};

/**
 * Convert string to float
 * @param {string} value Value to be converted
 * @returns {number|null} Converted number. null if the value was not a number
 */
export const convertToFloat = (value) => {
  if (Number.isNaN(value)) {
    return null;
  }

  return parseFloat(value);
};

/**
 * Stringifies object for JSON storageManager
 * @param {Object} value Object to stringify
 * @returns {string} Stringified object
 */
export const stringifyObject = (value) => {
  return JSON.stringify(value);
};
