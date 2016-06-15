const domManipulator = require('./domManipulator');

let viewIsSplit = false;
let isLandscape = window.innerWidth > window.innerHeight;

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

function toggleIsLandscape() {
  isLandscape = !isLandscape;
}

function isViewSplit() {
  return viewIsSplit;
}

exports.splitView = splitView;
exports.changeOrientation = changeOrientation;
exports.toggleIsLandscape = toggleIsLandscape;
exports.isViewSplit = isViewSplit;
