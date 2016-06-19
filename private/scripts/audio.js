/** @module */

const audio = new Audio();

/**
 * @param {Object} params
 */
function playAudio(params) {
  if (params.path) {
    audio.src = params.path;
  }

  if (params.startTime) {
    audio.currentTime = params.startTime;
  }

  if (params.volume) {
    audio.volume = params.volume;
  }

  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function resetAudio() {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 1;
}

/**
 * @param {Number} level
 */
function changeAudioVolume(level) {
  audio.volume = level;
}

exports.playAudio = playAudio;
exports.pauseAudio = pauseAudio;
exports.resetAudio = resetAudio;
exports.changeAudioVolume = changeAudioVolume;
