'use strict';

/**
 * @param {string} hints - Rules to use to match with
 * @param {string} password - String to match against
 * @returns {boolean} - Does the password match against the hint?
 */
function matchHint(hints, password) {
  console.log(hints, password);

  for (const hint of hints) {
    const phrases = hint.split(' ');
    const type = phrases[0];
    let matches = false;

    /**
     * start *characters*
     * Example: start ap
     */
    if (type === 'start' && phrases[1]) {
      const subString = phrases[1];

      matches = password.password.match(`^${subString}`) !== null;
    /**
     * end *characters*
     * Example: end aba
     */
    } else if (type === 'end' && phrases[1]) {
      const subString = phrases[1];

      matches = password.password.match(`${subString}$`) !== null;
    /**
     * middle *position* *characters*
     * Example: middle 2 c
     */
    } else if (type === 'middle' && phrases[1] && phrases[2]) {
      const subString = phrases[1];
      const position = parseInt(phrases[2], 10);

      matches = password.password.match(`^.{${position}}${subString}`) !== null;
    /**
     * length *number*
     * Example:length 5
     */
    } else if (type === 'length' && phrases[1]) {
      const length = parseInt(phrases[1], 10);

      matches = password.password.length === length;
    }

    if (matches) {
      return true;
    }
  }

  return false;
}

exports.matchHint = matchHint;
