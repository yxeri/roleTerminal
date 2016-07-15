/** @module */

const storage = require('./storage');
const commandHandler = require('./commandHandler');
const textTools = require('./textTools');

/**
 * @type {HTMLElement}
 */
const menu = document.getElementById('menu');
/**
 * @type {HTMLElement}
 */
const mainFeed = document.getElementById('mainFeed');
/**
 * User input field
 * @type {HTMLElement}
 */
const cmdInput = document.getElementById('cmdInput');
/**
 * The span infront of the input field
 * @type {HTMLElement}
 */
const inputStart = document.getElementById('inputStart');
/**
 * Span showing the current mode the user is in
 * @type {HTMLElement}
 */
const modeField = document.getElementById('mode');
/**
 * Adds padding to the bottom. Scrolling of the view targets this element
 * @type {HTMLElement}
 */
const spacer = document.getElementById('spacer');
/**
 * List with clickable options
 * @type {HTMLElement}
 */
const menuList = document.getElementById('menuList');
/**
 * @type {HTMLElement}
 */
const videoHolder = document.getElementById('videoHolder');
/**
 * Div containing mainFeed, inputContainer and spacer
 * @type {HTMLElement}
 */
let mainView = document.getElementById('background');
/**
 * @type {HTMLElement}
 */
let secondView = null;
/**
 * @type {boolean}
 */
let oldAndroid;
/**
 * @type {HTMLElement}
 */
let thisCommandItem;

/**
 * Changes color of the text to melt into the background
 * Uglier but less complex way than replacing characters in keydown event
 * @param {boolean} hide - Should input be hidden?
 */
function hideInput(hide) {
  if (hide) {
    cmdInput.classList.add('textMelt');
  } else {
    cmdInput.classList.remove('textMelt');
  }
}

/**
 * Get text from input field
 * @returns {string} - Text from input field
 */
function getInputText() {
  return cmdInput.value;
}

/**
 * Updates command item in menu
 */
function updateThisCommandItem() {
  const command = commandHandler.getCommand(getInputText().split(' ')[0]);
  const span = thisCommandItem.firstElementChild;

  if (command) {
    span.textContent = command.commandName.toUpperCase();
  } else {
    span.textContent = '';
  }
}

/**
 * Scrolls the list view to the bottom
 */
function scrollView() {
  if (!oldAndroid) {
    cmdInput.scrollIntoView();
  } else {
    // Compatibility fix for old Android
    window.scrollTo(0, document.body.scrollHeight);
  }
}

/**
 * Sets the height of the textarea to fit all text
 */
function resizeInput() {
  cmdInput.style.height = 'auto';
  cmdInput.style.height = `${cmdInput.scrollHeight}px`;

  scrollView();
}

/**
 * Set text in input field
 * @param {string} text - Text to be set
 */
function setCommandInput(text) {
  cmdInput.value = text;
  updateThisCommandItem();
}

/**
 * Returns text from input start
 * @returns {string} - Text from input start
 */
function getInputStart() {
  return inputStart.textContent;
}

/**
 * Clear text in input field
 */
function clearInput() {
  setCommandInput('');
}

/**
 * Replaces last part of the input field with sent string
 * @param {string} text - String to replace with
 */
function replaceLastInputPhrase(text) {
  const phrases = getInputText().split(' ');
  phrases[phrases.length - 1] = text;

  setCommandInput(phrases.join(' '));
}

/**
 * Set text in mode field (CHAT or CMD)
 * @param {string} text - String to be set
 */
function setModeText(text) {
  modeField.textContent = `[${text}]`;
}

/**
 * Clears text in mode field
 */
function clearModeText() {
  modeField.textContent = '';
}

/**
 * Get text from mode field
 * @returns {string} - Text in mode field
 */
function getModeText() {
  return modeField.textContent;
}

/**
 * Set text in input start
 * @param {string} text - String to be set
 */
function setInputStart(text) {
  inputStart.textContent = text.replace(/\s/g, '-').toLowerCase();
}

/**
 * Replace text in mode field (CMD or CHAT)
 */
function changeModeText() {
  const inputText = getInputText();
  const mode = storage.getMode();

  if (storage.getUser() && !commandHandler.commandHelper.command) {
    // TODO msg command text in comparison should not be hard coded
    if ((mode === 'chat' && commandHandler.isCommandChar(inputText.charAt(0))) || (mode === 'cmd' && textTools.trimSpace(inputText).split(' ')[0] !== 'msg')) {
      setModeText('CMD');
    } else {
      setModeText('CHAT');
    }
  }
}

/**
 * Set second view, which will be shown above/to the left of the main view
 * @param {HTMLElement} view - Second side view
 */
function setSecondView(view) {
  secondView = view;
}

/**
 * Gets second view, which is shown above/to the left of the main view
 * @returns {HTMLElement} - Second side view
 */
function getSecondView() {
  return secondView;
}

/**
 * Get the main view
 * @returns {HTMLElement} - Main view
 */
function getMainView() {
  return mainView;
}

/**
 * Get the space, which is used as a point of reference when scrolling to the bottom of the main view
 * @returns {HTMLElement} - Spacer
 */
function getSpacer() {
  return spacer;
}

/**
 * Set focus on the input field
 */
function focusInput() {
  cmdInput.focus();
}

/**
 * Remove focus from the input field
 */
function blurInput() {
  cmdInput.blur();
}

/**
 * Add a new item to the menu
 * @param {HTMLElement} item - New item in the menu
 */
function addMenuItem(item) {
  menuList.appendChild(item);
}

/**
 * Add a sub menu
 * @param {string} elementId - Id of the element to receive a sub menu
 * @param {HTMLElement} item - New sub menu
 */
function addSubMenuItem(elementId, item) {
  const element = Array.from(menuList.children).find((elem) => elem.id === elementId);

  if (element) {
    element.appendChild(item);
  }
}

/**
 * Set the main view
 * @param {HTMLElement} view - New main view
 */
function setMainView(view) {
  mainView = view;
}

/**
 * Clear main list
 */
function clearMainFeed() {
  while (mainFeed.childNodes.length > 1) {
    mainFeed.removeChild(mainFeed.lastChild);
  }
}

/**
 * Get menu
 * @returns {HTMLElement} - Menu element
 */
function getMenu() {
  return menu;
}

/**
 * Set command item in menu
 * @param {HTMLElement} item - New command item
 */
function setThisCommandItem(item) {
  thisCommandItem = item;
}

/**
 * Get command item from menu
 * @returns {HTMLElement} - Command item
 */
function getThisCommandItem() {
  return thisCommandItem;
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

  setCommandInput(currentInputText + appendText);
}

/**
 * Removes sub menu from item in the menu
 */
function removeSubMenu() {
  const commandList = menuList.lastChild;

  if (commandList.lastChild.tagName === 'UL') {
    commandList.removeChild(commandList.lastChild);
  }
}

/**
 * Get div with video in it
 * @returns {HTMLElement} - Div with video
 */
function getVideoHolder() {
  return videoHolder;
}

exports.setInputStart = setInputStart;
exports.setCommandInput = setCommandInput;
exports.getInputText = getInputText;
exports.clearInput = clearInput;
exports.getModeText = getModeText;
exports.scrollView = scrollView;
exports.getSecondView = getSecondView;
exports.setSecondView = setSecondView;
exports.getMainView = getMainView;
exports.hideInput = hideInput;
exports.getSpacer = getSpacer;
exports.clearModeText = clearModeText;
exports.changeModeText = changeModeText;
exports.focusInput = focusInput;
exports.blurInput = blurInput;
exports.addMenuItem = addMenuItem;
exports.replaceLastInputPhrase = replaceLastInputPhrase;
exports.setMainView = setMainView;
exports.getInputStart = getInputStart;
exports.clearMainFeed = clearMainFeed;
exports.getMenu = getMenu;
exports.addSubMenuItem = addSubMenuItem;
exports.setThisCommandItem = setThisCommandItem;
exports.getThisCommandItem = getThisCommandItem;
exports.appendInputText = appendInputText;
exports.updateThisCommandItem = updateThisCommandItem;
exports.removeSubMenu = removeSubMenu;
exports.getVideoHolder = getVideoHolder;
exports.resizeInput = resizeInput;
