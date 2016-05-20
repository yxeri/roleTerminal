'use strict';

const audio = new Audio();

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

function changeAudioVolume(level) {
  audio.volume = level;
}

module.exports.playAudio = playAudio;
module.exports.pauseAudio = pauseAudio;
module.exports.resetAudio = resetAudio;
module.exports.changeAudioVolume = changeAudioVolume;
