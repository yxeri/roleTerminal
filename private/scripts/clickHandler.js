/** @module */

/**
 * @type {boolean}
 */
let clicked = false;

/**
 * @params {boolean} sentClicked
 */
function setClicked(sentClicked) {
  clicked = sentClicked;
}

function toggleClicked() {
  clicked = !clicked;
}

/**
 * @returns {boolean}
 */
function isClicked() {
  return clicked;
}

exports.setClicked = setClicked;
exports.isClicked = isClicked;
exports.toggleClicked = toggleClicked;
