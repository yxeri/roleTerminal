/** @module */

const videoPlayer = document.getElementById('videoPlayer');

/**
 * Starts playing the video
 * @static
 */
function playVideo() {
  videoPlayer.play();
}

/**
 * Starts loading the video
 * @static
 */
function loadVideo() {
  videoPlayer.load();
}

/**
 * Stop playing the video, by removing the source and loading the video
 * @static
 */
function stopVideo() {
  videoPlayer.firstChild.removeAttribute('src');
  videoPlayer.load();
}

/**
 * Sets new video file path
 * @static
 * @param {string} path - Path to the video file
 */
function setVideo(path) {
  videoPlayer.firstChild.setAttribute('src', path);
}

/**
 * Pauses the video
 * @static
 */
function pauseVideo() {
  videoPlayer.pause();
}

/**
 * Get the video ready state
 * @static
 * @returns {Number} - Video ready state
 */
function getReadyState() {
  return videoPlayer.readyState;
}

/**
 * Get the video element
 * @static
 * @returns {HTMLMediaElement} - Video element
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
