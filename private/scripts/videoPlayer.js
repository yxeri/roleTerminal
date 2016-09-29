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

/** @module */

const videoPlayer = document.getElementById('videoPlayer');

/**
 * Starts playing the video
 * @static
 */
function playVideo() {
  videoPlayer.play();
}

/**
 * Starts loading the video
 * @static
 */
function loadVideo() {
  videoPlayer.load();
}

/**
 * Stop playing the video, by removing the source and loading the video
 * @static
 */
function stopVideo() {
  videoPlayer.firstChild.removeAttribute('src');
  videoPlayer.load();
}

/**
 * Sets new video file path
 * @static
 * @param {string} path - Path to the video file
 */
function setVideo(path) {
  videoPlayer.firstChild.setAttribute('src', path);
}

/**
 * Pauses the video
 * @static
 */
function pauseVideo() {
  videoPlayer.pause();
}

/**
 * Get the video ready state
 * @static
 * @returns {Number} - Video ready state
 */
function getReadyState() {
  return videoPlayer.readyState;
}

/**
 * Get the video element
 * @static
 * @returns {HTMLMediaElement} - Video element
 */
function getPlayer() {
  return videoPlayer;
}

exports.playVideo = playVideo;
exports.setVideo = setVideo;
exports.stopVideo = stopVideo;
exports.pauseVideo = pauseVideo;
exports.getReadyState = getReadyState;
exports.loadVideo = loadVideo;
exports.getPlayer = getPlayer;
