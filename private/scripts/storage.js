const labels = require('./labels');
const mapTools = require('./mapTools');
const domManipulator = require('./domManipulator');

/**
 * @param {string} name
 * @param {} item
 */
function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

/**
 * @param {string} name
 * @returns {}
 */
function getLocalVal(name) {
  return localStorage.getItem(name);
}

/**
 * @param {string} name
 */
function removeLocalVal(name) {
  localStorage.removeItem(name);
}

/**
 * @returns {string}
 */
function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
}

/**
 * @param {string} languageCode
 */
function setDefaultLanguage(languageCode) {
  setLocalVal('defaultLanguage', languageCode);
  labels.setLanguage(languageCode);
}

/**
 * @returns {boolean}
 */
function getFastMode() {
  return getLocalVal('fastMode') === 'true';
}

/**
 * @param {boolean} isOn
 */
function setFastMode(isOn) {
  setLocalVal('fastMode', isOn);
}

/**
 * @param {boolean} hide
 */
function shouldHideRoomNames(hide) {
  setLocalVal('hideRoomNames', hide);
}

/**
 * @returns {boolean}
 */
function getHideRoomNames() {
  return getLocalVal('hideRoomNames') === 'true';
}

/**
 * @param {boolean} hide
 */
function shouldHideTimeStamp(hide) {
  setLocalVal('hideTimeStamp', hide);
}

/**
 * @returns {boolean}
 */
function getHideTimeStamp() {
  return getLocalVal('hideTimeStamp') === 'true';
}

/**
 * @returns {Object}
 */
function getAliases() {
  const aliases = getLocalVal('aliases');

  return aliases !== null ? JSON.parse(aliases) : {};
}

/**
 * @param {Object} aliases
 */
function setAliases(aliases) {
  setLocalVal('aliases', JSON.stringify(aliases));
}

/**
 * @returns {string}
 */
function getDeviceId() {
  return getLocalVal('deviceId');
}

/**
 * @param {string} deviceId
 */
function setDeviceId(deviceId) {
  setLocalVal('deviceId', deviceId);
}

/**
 * @returns {string}
 */
function getRoom() {
  return getLocalVal('room');
}

/**
 * @param {string} room
 */
function setRoom(room) {
  setLocalVal('room', room);
}

function removeRoom() {
  removeLocalVal('room');
}

/**
 * @returns {boolean}
 */
function isHiddenCursor() {
  return getLocalVal('hiddenCursor') === 'true';
}

/**
 * @param {boolean} isHidden
 */
function shouldHideCursor(isHidden) {
  const mainView = domManipulator.getMainView();

  if (isHidden) {
    mainView.classList.add('hideCursor');
  } else {
    mainView.classList.remove('hideCursor');
  }

  setLocalVal('hiddenCursor', isHidden);
}

/**
 * @returns {boolean}
 */
function isHiddenMenu() {
  return getLocalVal('hiddenMenu') === 'true';
}

/**
 * @param {boolean} isHidden
 */
function shouldHideMenu(isHidden) {
  const menu = domManipulator.getMenu();

  if (isHidden) {
    menu.classList.add('hide');
  } else {
    menu.classList.remove('hide');
  }

  setLocalVal('hiddenMenu', isHidden);
}

/**
 * @returns {boolean}
 */
function isHiddenCmdInput() {
  return getLocalVal('hiddenCmdInput') === 'true';
}

/**
 * @param {boolean} isHidden
 */
function shouldHideCmdInput(isHidden) {
  const cmdContainer = document.getElementById('inputContainer');

  if (isHidden) {
    cmdContainer.classList.add('invisible');
  } else {
    cmdContainer.classList.remove('invisible');
  }

  setLocalVal('hiddenCmdInput', isHidden);
}

/**
 * @returns {boolean}
 */
function isThinView() {
  return getLocalVal('thinnerView') === 'true';
}

/**
 * @param {boolean} isThinner
 */
function shouldThinView(isThinner) {
  if (isThinner) {
    document.body.classList.add('thinner');
  } else {
    document.body.classList.remove('thinner');
  }

  setLocalVal('thinnerView', isThinner);
}

/**
 * @returns {Number}
 */
function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'), 10);
}

/**
 * @param {Number} accessLevel
 */
function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
}

/**
 * @param {boolean} forceFullscreen
 */
function shouldForceFullscreen(forceFullscreen) {
  setLocalVal('forceFullscreen', forceFullscreen);
}

/**
 * @returns {boolean}
 */
function getForceFullscreen() {
  return getLocalVal('forceFullscreen') === 'true';
}

/**
 * @param {boolean} gpsTracking
 */
function shouldGpsTrack(gpsTracking) {
  setLocalVal('gpsTracking', gpsTracking);
}

/**
 * @returns {boolean}
 */
function getGpsTracking() {
  return getLocalVal('gpsTracking') === 'true';
}

/**
 * @param {boolean}
 */
function shouldDisableCommands(disable) {
  setLocalVal('disableCommands', disable);
}

/**
 * @returns {boolean}
 */
function getDisableCommands() {
  return getLocalVal('disableCommands') === 'true';
}

/**
 * @returns {string}
 */
function getUser() {
  return getLocalVal('user');
}

/**
 * @param {string} user
 */
function setUser(user) {
  setLocalVal('user', user);
}

function removeUser() {
  removeLocalVal('user');
}

/**
 * @returns {string[]}
 */
function getCommandHistory() {
  const commandHistory = getLocalVal('cmdHistory');

  return commandHistory && commandHistory !== null ? JSON.parse(commandHistory) : [];
}

/**
 * @param {string[]} commandHistory
 */
function setCommandHistory(commandHistory) {
  setLocalVal('cmdHistory', JSON.stringify(commandHistory));
}

function removeCommandHistory() {
  removeLocalVal('cmdHistory');
}

/**
 * @param {string} mode
 */
function setMode(mode) {
  setLocalVal('mode', mode);
}

/**
 * @returns {string}
 */
function getMode() {
  return getLocalVal('mode');
}

/**
 * @returns {boolean}
 */
function getStaticInputStart() {
  return getLocalVal('staticInputStart') === 'true';
}

/**
 * @param {boolean} isStatic
 */
function shouldStaticInputStart(isStatic) {
  setLocalVal('staticInputStart', isStatic);
}

/**
 * @param {string} value
 */
function setDefaultInputStart(value) {
  setLocalVal('defaultInputStart', value);
}

/**
 * @param {Number} longitude
 * @param {Number} latitude
 */
function setCenterCoordinates(longitude, latitude) {
  setLocalVal('centerLong', longitude);
  setLocalVal('centerLat', latitude);

  mapTools.setMapCenter({
    latitude,
    longitude,
  });
}

/**
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCenterCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('centerLat')),
    longitude: parseFloat(getLocalVal('centerLong')),
  };
}

/**
 * @param {Number} longitude
 * @param {Number} latitude
 */
function setCornerOneCoordinates(longitude, latitude) {
  setLocalVal('cornerOneLong', longitude);
  setLocalVal('cornerOneLat', latitude);
}

/**
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCornerOneCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerOneLat')),
    longitude: parseFloat(getLocalVal('cornerOneLong')),
  };
}

/**
 * @param {Number} longitude
 * @param {Number} latitude
 */
function setCornerTwoCoordinates(longitude, latitude) {
  setLocalVal('cornerTwoLong', longitude);
  setLocalVal('cornerTwoLat', latitude);
}

/**
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCornerTwoCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerTwoLat')),
    longitude: parseFloat(getLocalVal('cornerTwoLong')),
  };
}

/**
 * @param {Number} zoomLevel
 */
function setDefaultZoomLevel(zoomLevel) {
  setLocalVal('defaultZoomLevel', zoomLevel);
}

/**
 * @returns {Number}
 */
function getDefaultZoomLevel() {
  return parseInt(getLocalVal('defaultZoomLevel'), 10);
}

/**
 * @param {{name: string, url: string}[]} radioChannels
 */
function setRadioChannels(radioChannels) {
  setLocalVal('radioChannels', JSON.stringify(radioChannels));
}

/**
 * @returns {{name: string, url: string}[]}
 */
function getRadioChannels() {
  return JSON.parse(getLocalVal('radioChannels'));
}

/**
 * @returns {string}
 */
function getDefaultInputStart() {
  return getLocalVal('defaultInputStart');
}

exports.getDefaultLanguage = getDefaultLanguage;
exports.setDefaultLanguage = setDefaultLanguage;
exports.getFastMode = getFastMode;
exports.setFastMode = setFastMode;
exports.shouldHideRoomNames = shouldHideRoomNames;
exports.getHideRoomNames = getHideRoomNames;
exports.shouldHideTimeStamp = shouldHideTimeStamp;
exports.getHideTimeStamp = getHideTimeStamp;
exports.getAliases = getAliases;
exports.setAliases = setAliases;
exports.getDeviceId = getDeviceId;
exports.setDeviceId = setDeviceId;
exports.getRoom = getRoom;
exports.setRoom = setRoom;
exports.removeRoom = removeRoom;
exports.isHiddenCursor = isHiddenCursor;
exports.shouldHideCursor = shouldHideCursor;
exports.isHiddenMenu = isHiddenMenu;
exports.shouldHideMenu = shouldHideMenu;
exports.isHiddenCmdInput = isHiddenCmdInput;
exports.shouldHideCmdInput = shouldHideCmdInput;
exports.isThinView = isThinView;
exports.shouldThinView = shouldThinView;
exports.getAccessLevel = getAccessLevel;
exports.setAccessLevel = setAccessLevel;
exports.shouldForceFullscreen = shouldForceFullscreen;
exports.getForceFullscreen = getForceFullscreen;
exports.shouldGpsTrack = shouldGpsTrack;
exports.getGpsTracking = getGpsTracking;
exports.shouldDisableCommands = shouldDisableCommands;
exports.getDisableCommands = getDisableCommands;
exports.getUser = getUser;
exports.setUser = setUser;
exports.removeUser = removeUser;
exports.getCommandHistory = getCommandHistory;
exports.setCommandHistory = setCommandHistory;
exports.removeCommandHistory = removeCommandHistory;
exports.setMode = setMode;
exports.getMode = getMode;
exports.getStaticInputStart = getStaticInputStart;
exports.shouldStaticInputStart = shouldStaticInputStart;
exports.setDefaultInputStart = setDefaultInputStart;
exports.setCenterCoordinates = setCenterCoordinates;
exports.getCenterCoordinates = getCenterCoordinates;
exports.setCornerOneCoordinates = setCornerOneCoordinates;
exports.getCornerOneCoordinates = getCornerOneCoordinates;
exports.setCornerTwoCoordinates = setCornerTwoCoordinates;
exports.getCornerTwoCoordinates = getCornerTwoCoordinates;
exports.setDefaultZoomLevel = setDefaultZoomLevel;
exports.getDefaultZoomLevel = getDefaultZoomLevel;
exports.setRadioChannels = setRadioChannels;
exports.getRadioChannels = getRadioChannels;
exports.getDefaultInputStart = getDefaultInputStart;
