/**
 * Beautifies number by adding a 0 before the number if it is lower than 10
 * @param {Number} number Number to be beautified
 * @returns {string} String with number or with 0 + number
 */
// TODO Use built-in padding
export const beautifyNumber = (number) => (number > 9
  ? `${number}`
  : `0${number}`
);
