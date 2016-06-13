let clicked = false;

function setClicked(sentClicked) {
  clicked = sentClicked;
}

function toggleClicked() {
  clicked = !clicked;
}

function isClicked() {
  return clicked;
}

exports.setClicked = setClicked;
exports.isClicked = isClicked;
exports.toggleClicked = toggleClicked;
