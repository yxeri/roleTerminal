/** @module */

const videoPlayer = document.getElementById('videoPlayer');

/**
 * @static
 */
function playVideo() {
  videoPlayer.play();
}

/**
 * @static
 */
function loadVideo() {
  videoPlayer.load();
}

/**
 * @static
 */
function stopVideo() {
  videoPlayer.firstChild.removeAttribute('src');
  videoPlayer.load();
}

/**
 * @static
 * @param {string} path
 */
function setVideo(path) {
  videoPlayer.firstChild.setAttribute('src', path);
}

/**
 * @static
 */
function pauseVideo() {
  videoPlayer.pause();
}

/**
 * @static
 * @returns {Number}
 */
function getReadyState() {
  return videoPlayer.readyState;
}

/**
 * @static
 * @returns {HTMLMediaElement}
 */
function getPlayer() {
  return videoPlayer;
}

exports.playVideo = playVideo;
exports.setVideo = setVideo;
exports.stopVideo = stopVideo;
exports.pauseVideo = pauseVideo;
exports.getReadyState = getReadyState;
exports.loadVideo = loadVideo;
exports.getPlayer = getPlayer;
