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

class SoundLibrary {
  constructor() {
    this.sounds = [];
  }

  addSound(sound) {
    this.sounds.push({ soundId: sound.soundId, sound });
  }

  getSound(sentSoundId) {
    const sound = this.sounds.find(({ soundId }) => soundId === sentSoundId);

    if (sound) {
      return sound.sound;
    }

    return null;
  }

  removeSound(sentSoundId) {
    const soundIndex = this.sounds.findIndex(({ soundId }) => soundId === sentSoundId);

    if (soundIndex > -1) {
      this.sounds.splice(soundIndex, 1);
    }
  }
}

module.exports = SoundLibrary;
