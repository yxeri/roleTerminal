'use strict';

/**
 * @param {string} password - String to generate hints from
 * @returns {string[]} - Returns password hints
 */
function createHints(password) {
  const hints = [];
  const startAmount = Math.floor(Math.random() * 2);
  const endAmount = startAmount === 0 ? Math.floor(Math.random() * 2) : 0;

  /**
   * start *characters*
   * Example: start pi
   */
  hints.push(`start ${password.substr(0, 1 + startAmount)}`);

  /**
   * end *characters*
   * Example: end za
   */
  hints.push(`end ${password.substr((password.length - 1) - endAmount)}`);

  if (password.length > 5) {
    const position = Math.floor(Math.random() * ((password.length - 3) - 2) + 2);

    /**
     * middle *position* *characters*
     * Example: middle 3 z
     */
    hints.push(`middle ${position + 1} ${password.charAt(position)}`);
  }

  /**
   * length *number*
   * Example:length 5
   */
  hints.push(`length ${password.length}`);

  return hints;
}

exports.createHints = createHints;
