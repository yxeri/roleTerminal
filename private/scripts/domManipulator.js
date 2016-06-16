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
 * @param {boolean} hide
 */
function hideInput(hide) {
  if (hide) {
    cmdInput.setAttribute('type', 'password');
  } else {
    cmdInput.setAttribute('type', 'text');
  }
}

/**
 * @returns {string}
 */
function getInputText() {
  return cmdInput.value;
}

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
 * @param {string} text
 */
function setCommandInput(text) {
  cmdInput.value = text;
  updateThisCommandItem();
}

/**
 * @returns {string}
 */
function getInputStart() {
  return inputStart.textContent;
}

function clearInput() {
  setCommandInput('');
}

/**
 * @param {string} text
 */
function replaceLastInputPhrase(text) {
  const phrases = getInputText().split(' ');
  phrases[phrases.length - 1] = text;

  setCommandInput(phrases.join(' '));
}

function scrollView() {
  if (!oldAndroid) {
    spacer.scrollIntoView();
  } else {
    // Compatibility fix for old Android
    window.scrollTo(0, document.body.scrollHeight);
  }
}

/**
 * @param {string} text
 */
function setModeText(text) {
  modeField.textContent = `[${text}]`;
}

function clearModeText() {
  modeField.textContent = '';
}

/**
 * @returns {string}
 */
function getModeText() {
  return modeField.textContent;
}

/**
 * @param {string} text
 */
function setInputStart(text) {
  inputStart.textContent = text.replace(/\s/g, '-').toLowerCase();
}

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
 * @param {HTMLElement} view
 */
function setSecondView(view) {
  secondView = view;
}

/**
 * @returns {HTMLElement}
 */
function getSecondView() {
  return secondView;
}

/**
 * @returns {HTMLElement}
 */
function getMainView() {
  return mainView;
}

/**
 * @returns {HTMLElement}
 */
function getSpacer() {
  return spacer;
}

function focusInput() {
  cmdInput.focus();
}

function blurInput() {
  cmdInput.blur();
}

/**
 * @param {HTMLElement} item
 */
function addMenuItem(item) {
  menuList.appendChild(item);
}

function addSubMenuItem(elementId, item) {
  const element = Array.from(menuList.children).find((elem) => elem.id === elementId);

  if (element) {
    element.appendChild(item);
  }
}

/**
 * @param {HTMLElement} view
 */
function setMainView(view) {
  mainView = view;
}

function clearMainFeed() {
  while (mainFeed.childNodes.length > 1) {
    mainFeed.removeChild(mainFeed.lastChild);
  }
}

/**
 * @returns {HTMLElement}
 */
function getMenu() {
  return menu;
}

function setThisCommandItem(item) {
  thisCommandItem = item;
}

function getThisCommandItem() {
  return thisCommandItem;
}

function appendInputText(text) {
  const currentInputText = getInputText();
  let appendText = '';

  if (currentInputText[currentInputText.length - 1] !== ' ') {
    appendText = ' ';
  }

  appendText += text;

  setCommandInput(currentInputText + appendText);
}

function removeSubMenu() {
  const commandList = menuList.lastChild;

  commandList.removeChild(commandList.lastChild);
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
