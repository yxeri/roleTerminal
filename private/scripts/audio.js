/** @module */

const audio = new Audio();

/**
 * @static
 * @param {{path: string, startTime: Number, volume: Number}} params -
 * <pre>
 * path - Path to the file
 * startTime - Starting time of the audio
 * volume - Volume for the audio
 * </pre>
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
