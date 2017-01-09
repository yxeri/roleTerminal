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

class View {
  constructor({ isFullscreen }) {
    const element = document.createElement('DIV');

    if (isFullscreen) {
      element.classList.add('fullscreen');
    }

    this.element = element;
  }

  hideView() {
    this.element.classList.add('hide');
  }

  showView() {
    this.element.classList.remove('hide');
  }

  goFullscreen() {
    this.element.classList.add('fullscreen');
  }

  goWindowed() {
    this.element.classList.remove('fullscreen');
  }

  appendTo(parentElement) {
    parentElement.appendChild(this.element);
  }
}

module.exports = View;
