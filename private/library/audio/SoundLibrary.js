/*
 Copyright 2016 Aleksandar Jankovic

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

const SoundElement = require('./SoundElement');

class SoundLibrary {
  constructor() {
    this.sounds = {};
  }

  addSound(sound) {
    this.sounds[sound.soundId] = sound;
  }

  getSound(sentSoundId) {
    if (this.sounds[sentSoundId]) {
      return this.sounds[sentSoundId];
    }

    return null;
  }

  playSound(soundId, params = {}) {
    const sound = this.sounds[soundId];

    if (sound) {
      if (!sound.multi) {
        sound.playAudio(params);
      } else {
        const newSound = {
          path: sound.audio.src,
          volume: sound.audio.volume,
          soundId: sound.soundId,
          multi: sound.multi,
        };

        new SoundElement(newSound).playAudio({});
      }
    }
  }

  removeSound(sentSoundId) {
    this.sounds[sentSoundId] = null;
  }
}

const soundLibrary = new SoundLibrary();

module.exports = soundLibrary;
