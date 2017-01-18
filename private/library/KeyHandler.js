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

// switch () {
//   case 9: // Tab
//   case 13: // Enter
//   case 16: // Shift
//   case 17: // Ctrl
//   case 18: // Alt
//   case 20: // Caps lock
//   case 33: // Page up
//   case 34: // Page down
//   case 37: // Left arrow
//   case 38: // Up arrow
//   case 39: // Down arrow
//   case 40: // Down arrow
//   case 91: // Left Command key in OS X
//   case 93: // Right Command key in OS X
//   case 224: { // Command key in OS X (Firefox)
//     break;
//   }
//   default: {
//     break;
//   }
// }

class KeyHandler {
  constructor() {
    this.keys = new Map();
    this.keyPressed = false;
    this.triggerKeyPressed = false;
    this.triggerKey = 18; // Alt

    window.addEventListener('keydown', (event) => {
      const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;

      if (keyCode === this.triggerKey) {
        this.triggerKeyPressed = true;
        event.preventDefault();
      } else if (this.triggerKeyPressed && !this.keyPressed) {
        const keyFunc = this.keys.get(keyCode);

        if (keyFunc) {
          keyFunc();
          this.keyPressed = true;
          event.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (event) => {
      const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;

      if (keyCode === this.triggerKey) {
        this.triggerKeyPressed = false;
      } else {
        this.keyPressed = false;
      }
    });
  }

  addKey(key, func) {
    this.keys.set(key, func);
  }

  removeKey(key) {
    this.keys.delete(key);
  }
}

module.exports = KeyHandler;
