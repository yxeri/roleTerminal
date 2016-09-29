/*
 Copyright 2015 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @module
 */

const audioElements = {
  radio: new Audio(),
};

/**
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.path - Path to the file
 * @param {Number} params.startTime - Starting time of the audio
 * @param {Number} params.volume - Volume for the audio
 * @param {string} params.type - Type of audio
 */
function playAudio(params) {
  const audio = audioElements[params.type];

  if (audio) {
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
}

/**
 * Pauses the audio
 * @static
 * @param {string} type - Type of audio
 */
function pauseAudio(type) {
  const audio = audioElements[type];

  if (audio) {
    audio.pause();
  }
}

/**
 * Pauses audio and resets time and volume parameters
 * @static
 * @param {string} type - Type of audio
 */
function resetAudio(type) {
  const audio = audioElements[type];

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
  }
}

/**
 * Sets new audio volume
 * @static
 * @param {Number} level - New audio volume
 * @param {string} type - Type of audio
 */
function changeAudioVolume(level, type) {
  const audio = audioElements[type];

  if (audio) {
    audio.volume = level;
  }
}

exports.playAudio = playAudio;
exports.pauseAudio = pauseAudio;
exports.resetAudio = resetAudio;
exports.changeAudioVolume = changeAudioVolume;
