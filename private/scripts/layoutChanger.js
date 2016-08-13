/** @module */

const domManipulator = require('./domManipulator');

let viewIsSplit = false;
let viewIsExpanded = false;
let isLandscape = window.innerWidth > window.innerHeight;
const viewChangerItem = (() => {
  const item = document.createElement('li');
  const span = document.createElement('span');

  item.setAttribute('id', 'viewChanger');
  item.classList.add('link');
  span.appendChild(document.createTextNode('EXPAND =>'));
  item.appendChild(span);

  item.addEventListener('click', () => {
    transformView(); // eslint-disable-line no-use-before-define
    event.stopPropagation();
  });

  return item;
})();

/**
 * Resizes the secondView to 100% or 50% width by adding classes on them, depending on viewIsExpanded flag
 */
function transformView() {
  const mainView = domManipulator.getMainView();
  const secondView = domManipulator.getSecondView();

  if (!viewIsExpanded) {
    viewIsExpanded = true;

    mainView.classList.add('hide');
    secondView.classList.remove('halfHeight');
    secondView.classList.remove('halfWidth');
    secondView.classList.add('fullView');
    viewChangerItem.firstElementChild.textContent = 'COLLAPSE <=';
  } else {
    viewIsExpanded = false;

    mainView.classList.remove('hide');
    secondView.classList.remove('fullView');
    viewChangerItem.firstElementChild.textContent = 'EXPAND =>';

    if (!isLandscape) {
      mainView.classList.add('halfHeight');
      secondView.classList.add('halfHeight');
    } else {
      mainView.classList.add('halfWidth');
      secondView.classList.add('halfWidth');
    }
  }

  domManipulator.resizeCallback();
}

/**
 * Splits or collapses view. A div will be added (or removed) that takes up 50% of the view
 * @param {boolean} shouldSplit - Should the view split? No means it should collapses
 * @param {HTMLElement} secondDiv - Side div that should be added to the view
 * @param {function} resizeCallback - Function to call when the view changes size
 */
function splitView(shouldSplit, secondDiv, resizeCallback) {
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

    domManipulator.addMenuItem(viewChangerItem);
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
  domManipulator.setSecondView(secondDiv, resizeCallback);

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

  domManipulator.resizeCallback();
}

/**
 * Toggles if view is in landscape mode
 */
function toggleIsLandscape() {
  isLandscape = !isLandscape;
}

/**
 * Is view split?
 * @returns {boolean} viewIsSplit - Is view split?
 */
function isViewSplit() {
  return viewIsSplit;
}

/**
 * Is view expanded?
 * @returns {boolean} viewIsExpanded - Is view expanded?
 */
function isViewExpanded() {
  return viewIsExpanded;
}

exports.splitView = splitView;
exports.changeOrientation = changeOrientation;
exports.toggleIsLandscape = toggleIsLandscape;
exports.isViewSplit = isViewSplit;
exports.transformView = transformView;
exports.isViewExpanded = isViewExpanded;
