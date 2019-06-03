/*
 Copyright 2019 Carmilla Mina Jankovic

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

class VoiceCommander {
  constructor() {
    if (typeof annyang !== 'undefined') { // eslint-disable-line
      this.voiceListener = annyang; // eslint-disable-line
    }

    this.hasStarted = false;
    this.commands = {};
  }

  start() {
    if (!this.voiceListener) {
      setTimeout(this.start, 1000);

      return;
    }

    this.voiceListener.addCallback('errorPermissionBlocked', () => {
      this.voiceListener.abort();
      this.hasStarted = false;
    });

    this.voiceListener.addCallback('errorPermissionDenied', () => {
      this.voiceListener.abort();
      this.hasStarted = false;
    });

    this.voiceListener.start({
      autoRestart: true,
      continuous: false,
    });
    this.voiceListener.addCommands(this.commands);
    this.hasStarted = true;
  }

  addCommands({
    activationString,
    commands = [],
  }) {
    const commandsObj = {};

    commands.forEach((command) => {
      const {
        func,
        strings = [],
      } = command;

      strings.forEach((string) => {
        const fullString = activationString
          ? `${activationString} ${string}`
          : string;

        commandsObj[fullString] = func;
        this.commands[fullString] = func;
      });
    });

    if (this.voiceListener && this.hasStarted) {
      this.voiceListener.addCommands(commandsObj);
    }
  }

  pause() {
    if (!this.voiceListener || !this.hasStarted) {
      return;
    }

    this.voiceListener.pause();
  }

  unpause() {
    if (!this.voiceListener || !this.hasStarted) {
      return;
    }

    this.voiceListener.resume();
  }
}

const voiceCommander = new VoiceCommander();

module.exports = voiceCommander;
