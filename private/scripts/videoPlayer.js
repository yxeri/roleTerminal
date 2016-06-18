const videoPlayer = document.getElementById('videoPlayer');

function playVideo() {
  videoPlayer.play();
}

function loadVideo() {
  videoPlayer.load();
}

function stopVideo() {
  videoPlayer.firstChild.removeAttribute('src');
  videoPlayer.load();
}

function setVideo(path) {
  videoPlayer.firstChild.setAttribute('src', path);
}

function pauseVideo() {
  videoPlayer.pause();
}

function getReadyState() {
  return videoPlayer.readyState;
}

/**
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
