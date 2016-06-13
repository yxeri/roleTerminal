const storage = require('./storage');
const commandHandler = require('./commandHandler');
const textTools = require('./textTools');

const menu = document.getElementById('menu');
const mainFeed = document.getElementById('mainFeed');
/**
 * User input field
 * @type {Element}
 */
const cmdInput = document.getElementById('cmdInput');
/**
 * The span infront of the input field
 * @type {Element}
 */
const inputStart = document.getElementById('inputStart');
/**
 * Span showing the current mode the user is in
 * @type {Element}
 */
const modeField = document.getElementById('mode');
/**
 * Adds padding to the bottom. Scrolling of the view targets this element
 * @type {Element}
 */
const spacer = document.getElementById('spacer');
/**
 * List with clickable options
 * @type {Element}
 */
const menuList = document.getElementById('menuList');
/**
 * Div containing mainFeed, inputContainer and spacer
 * @type {Element}
 */
let mainView = document.getElementById('background');
let secondView = null;
let oldAndroid;

function hideInput(hide) {
  if (hide) {
    cmdInput.setAttribute('type', 'password');
  } else {
    cmdInput.setAttribute('type', 'text');
  }
}

function getInputText() {
  return cmdInput.value;
}

function setCommandInput(text) {
  cmdInput.value = text;
}

function getInputStart() {
  return inputStart.textContent;
}

function clearInput() {
  setCommandInput('');
}

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

function setModeText(text) {
  modeField.textContent = `[${text}]`;
}

function clearModeText() {
  modeField.textContent = '';
}

function getModeText() {
  return modeField.textContent; // String
}

// TODO: Change name to setInputStartText or similar
function setInputStart(text) {
  inputStart.textContent = text.replace(/\s/g, '-').toLowerCase();
}

function changeModeText() {
  const inputText = getInputText();
  const mode = storage.getMode();

  if (storage.getUser() && !commandHandler.getCommandHelper().command) {
    // TODO msg command text in comparison should not be hard coded
    if ((mode === 'chat' && commandHandler.isCommandChar(inputText.charAt(0))) || (mode === 'cmd' && textTools.trimSpace(inputText).split(' ')[0] !== 'msg')) {
      setModeText('CMD');
    } else {
      setModeText('CHAT');
    }
  }
}

function setSecondView(view) {
  secondView = view;
}

function getSecondView() {
  return secondView;
}

function getMainView() {
  return mainView;
}

function getSpacer() {
  return spacer;
}

function focusInput() {
  cmdInput.focus();
}

function blurInput() {
  cmdInput.blur();
}

function addMenuItem(item) {
  menuList.appendChild(item);
}

function setMainView(view) {
  mainView = view;
}

function clearMainFeed() {
  while (mainFeed.childNodes.length > 1) {
    mainFeed.removeChild(mainFeed.lastChild);
  }
}

function getMenu() {
  return menu;
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
