/** @module */

const domManipulator = require('./domManipulator');

let viewIsSplit = false;
let isLandscape = window.innerWidth > window.innerHeight;

/**
 * Splits or collapses view. A div will be added (or removed) that takes up 50% of the view
 * @param {boolean} shouldSplit - Should the view split? No means it should collapses
 * @param {HTMLElement} secondDiv - Side div that should be added to the view
 */
function splitView(shouldSplit, secondDiv) {
  const mainView = domManipulator.getMainView();
  const secondView = domManipulator.getSecondView();

  if (shouldSplit) {
    secondDiv.classList.remove('hide');
    mainView.classList.add('halfView');

    if (!isLandscape) {
      mainView.classList.add('halfHeight');
      secondDiv.classList.add('halfHeight');
    } else {
      mainView.classList.add('halfWidth');
      secondDiv.classList.add('halfWidth');
    }
  } else {
    secondDiv.classList.add('hide');
    mainView.classList.remove('halfView');
    mainView.classList.remove('halfWidth');
    mainView.classList.remove('halfHeight');
    secondDiv.classList.remove('halfWidth');
    secondDiv.classList.remove('halfHeight');
  }

  /**
   * If the view is already split and it should split, meaning that a second view already exists
   */
  if (viewIsSplit && secondDiv !== secondView) {
    secondView.classList.add('hide');
    secondView.classList.remove('halfWidth');
    secondView.classList.remove('halfHeight');
  }

  viewIsSplit = shouldSplit;
  domManipulator.setSecondView(secondDiv);

  domManipulator.scrollView();
}

/**
 * Change the orientation of the view. Most likely triggered by the user changing from landscape to portrait mode or vice versa
 */
function changeOrientation() {
  const mainView = domManipulator.getMainView();
  const secondView = domManipulator.getSecondView();

  if (viewIsSplit) {
    if (!isLandscape) {
      mainView.classList.remove('halfWidth');
      secondView.classList.remove('halfWidth');
      mainView.classList.add('halfHeight');
      secondView.classList.add('halfHeight');
    } else {
      mainView.classList.remove('halfHeight');
      secondView.classList.remove('halfHeight');
      mainView.classList.add('halfWidth');
      secondView.classList.add('halfWidth');
    }
  }
}

/**
 * Toggles if view is in landscape mode
 */
function toggleIsLandscape() {
  isLandscape = !isLandscape;
}

/**
 * Is view split?
 */
function isViewSplit() {
  return viewIsSplit;
}

exports.splitView = splitView;
exports.changeOrientation = changeOrientation;
exports.toggleIsLandscape = toggleIsLandscape;
exports.isViewSplit = isViewSplit;
