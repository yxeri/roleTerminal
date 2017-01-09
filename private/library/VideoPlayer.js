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

class VideoPlayer {
  constructor(element) {
    this.videoElement = element;
  }

  /**
   * Starts playing the video
   */
  playVideo() {
    this.videoElement.play();
  }

  /**
   * Starts loading the video
   */
  loadVideo() {
    this.videoElement.load();
  }

  /**
   * Stop playing the video, by removing the source and loading the video
   */
  stopVideo() {
    this.videoElement.firstChild.removeAttribute('src');
    this.videoElement.load();
  }

  /**
   * Sets new video file path
   * @param {string} path - Path to the video file
   */
  setVideo(path) {
    this.videoElement.firstChild.setAttribute('src', path);
  }

  /**
   * Pauses the video
   */
  pauseVideo() {
    this.videoElement.pause();
  }

  /**
   * Get the video ready state
   * @returns {Number} - Video ready state
   */
  getReadyState() {
    return this.videoElement.readyState;
  }
}

module.exports = VideoPlayer;
