/** @module */

/**
 * @private
 * @type {boolean}
 */
let clicked = false;

/**
 * Set clicked boolean
 * @static
 * @param {boolean} sentClicked - New clicked boolean
 */
function setClicked(sentClicked) {
  clicked = sentClicked;
}

/**
 * Toggle clicked boolean from false to true or vice versa
 * @static
 */
function toggleClicked() {
  clicked = !clicked;
}

/**
 * Is clicked true?
 * @static
 * @returns {boolean} - clicked boolean
 */
function isClicked() {
  return clicked;
}

exports.setClicked = setClicked;
exports.isClicked = isClicked;
exports.toggleClicked = toggleClicked;
