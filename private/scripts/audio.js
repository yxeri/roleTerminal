/** @module */

const audio = new Audio();

/**
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.path - Path to the file
 * @param {Number} params.startTime - Starting time of the audio
 * @param {Number} params.volume - Volume for the audio
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

/**
 * Pauses the audio
 * @static
 */
function pauseAudio() {
  audio.pause();
}

/**
 * Pauses audio and resets time and volume parameters
 * @static
 */
function resetAudio() {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 1;
}

/**
 * Sets new audio volume
 * @static
 * @param {Number} level - New audio volume
 */
function changeAudioVolume(level) {
  audio.volume = level;
}

exports.playAudio = playAudio;
exports.pauseAudio = pauseAudio;
exports.resetAudio = resetAudio;
exports.changeAudioVolume = changeAudioVolume;
