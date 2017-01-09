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

/**
 * Is the element inside the view or close to the end of the view?
 * @static
 * @param {HTMLElement} element - The element that will be checked
 * @param {number} [newElementHeight] - Value will be added to check if an element is close to the edge
 * @returns {boolean} - Is the element in view or close to the edge?
 */
function isCloseToEnd(element, newElementHeight) {
  const elementTop = element.getBoundingClientRect().top;

  return elementTop <= window.innerHeight + 100 + (newElementHeight || 0);
}

/**
 * Scrolls the list view to the bottom
 * @static
 */
function scrollView() {
  // cmdInput.scrollIntoView();
  window.scrollTo(0, document.body.scrollHeight);
}

/**
 * Goes into full screen with sent element
 * This is not supported in iOS Safari
 * @param {Element} element - The element which should be maximized to full screen
 */
function goFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

/**
 * Is the view in full screen?
 * @returns {boolean} Is the view in full screen?
 */
function isFullscreen() {
  /** @namespace window.screenY */
  return !window.screenTop && !window.screenY;
}

exports.scrollView = scrollView;
exports.isCloseToEnd = isCloseToEnd;
exports.goFullscreen = goFullScreen;
exports.isFullscreen = isFullscreen;
