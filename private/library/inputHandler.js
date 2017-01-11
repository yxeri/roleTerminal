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

let currentInput = {};

// TODO Check if text area and do this
/**
 * Sets the height of the textarea to fit all text
 * @param {Object} textArea - Text area to resize
 */
function resizeTextarea() {
//   textArea.style.height = 'auto';
//   textArea.style.height = `${textArea.scrollHeight}px`;
}

/**
 * Set text in input field
 * @param {string} text - Text to be set
 */
function setInputText(text) {
  currentInput.value = text;
  // TODO Check if text area and d othis
  // input.setSelectionRange(input.value.length, input.value.length);
}

/**
 * @param {Object} input - Input
 * @returns {string} Input text
 */
function getInputText() {
  // TODO Check type of input field and retrieve correct value
  return currentInput.value;
}

/**
 * Clear text in input field
 */
function clearInput() {
  setInputText('');
}

/**
 * Replaces last part of the input field with sent string
 * @param {string} text - String to replace with
 */
function replaceLastInputPhrase(text) {
  const phrases = getInputText().split(' ');
  phrases[phrases.length - 1] = text;

  setInputText(phrases.join(' '));
}

/**
 * Set focus on the input field
 * @param {Object} input - Input field to focus
 */
function focusInput(input) {
  input.focus();
}

/**
 * Remove focus from the input field
 * @param {Object} input - Input field to blur
 */
function blurInput(input) {
  input.blur();
}

/**
 * Append string to input field
 * @param {string} text - New string to be appended
 */
function appendInputText(text) {
  const currentInputText = getInputText();
  let appendText = '';

  if (currentInputText[currentInputText.length - 1] !== ' ') {
    appendText = ' ';
  }

  appendText += text;

  setInputText(currentInputText + appendText);
}

/**
 * Set input that is currently prioritized/used by the user
 * @param {Object} input - Input field
 */
function setCurrentInput(input) {
  currentInput = input;
}

exports.setCommandInput = setInputText;
exports.clearInput = clearInput;
exports.focusInput = focusInput;
exports.blurInput = blurInput;
exports.replaceLastInputPhrase = replaceLastInputPhrase;
exports.appendInputText = appendInputText;
exports.resizeInput = resizeTextarea;
exports.setCurrentInput = setCurrentInput;
