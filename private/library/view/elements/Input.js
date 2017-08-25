/*
 Copyright 2017 Aleksandar Jankovic

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

class Input {
  constructor() {
    this.element = document.createElement('INPUT');
  }

  blur() { this.element.blur(); }

  focus() { this.element.focus(); }

  clear() { this.element.value = ''; }

  mark() { this.element.classList.add('markedInput'); }

  unmark() { this.element.classList.remove('markedInput'); }

  getText() { return this.element.value; }
}

module.exports = Input;
