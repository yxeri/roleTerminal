/** @module */

const labels = require('./labels');
const mapTools = require('./mapTools');
const domManipulator = require('./domManipulator');

/**
 * @private
 * @param {string} name
 * @param {} item
 */
function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

/**
 * @private
 * @param {string} name
 * @returns {}
 */
function getLocalVal(name) {
  return localStorage.getItem(name);
}

/**
 * @private
 * @param {string} name
 */
function removeLocalVal(name) {
  localStorage.removeItem(name);
}

/**
 * Get default language
 * @static
 * @returns {string}
 */
function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
}

/**
 * @static
 * @param {string} languageCode
 */
function setDefaultLanguage(languageCode) {
  setLocalVal('defaultLanguage', languageCode);
  labels.setLanguage(languageCode);
}

/**
 * @static
 * @returns {boolean}
 */
function getFastMode() {
  return getLocalVal('fastMode') === 'true';
}

/**
 * @static
 * @param {boolean} isOn
 */
function setFastMode(isOn) {
  setLocalVal('fastMode', isOn);
}

/**
 * @static
 * @param {boolean} hide
 */
function shouldHideRoomNames(hide) {
  setLocalVal('hideRoomNames', hide);
}

/**
 * @static
 * @returns {boolean}
 */
function getHideRoomNames() {
  return getLocalVal('hideRoomNames') === 'true';
}

/**
 * @static
 * @param {boolean} hide
 */
function shouldHideTimeStamp(hide) {
  setLocalVal('hideTimeStamp', hide);
}

/**
 * @static
 * @returns {boolean}
 */
function getHideTimeStamp() {
  return getLocalVal('hideTimeStamp') === 'true';
}

/**
 * @public
 * @static
 * @returns {Object}
 */
function getAliases() {
  const aliases = getLocalVal('aliases');

  return aliases !== null ? JSON.parse(aliases) : {};
}

/**
 * @static
 * @param {Object} aliases
 */
function setAliases(aliases) {
  setLocalVal('aliases', JSON.stringify(aliases));
}

/**
 * @static
 * @returns {string}
 */
function getDeviceId() {
  return getLocalVal('deviceId');
}

/**
 * @static
 * @param {string} deviceId
 */
function setDeviceId(deviceId) {
  setLocalVal('deviceId', deviceId);
}

/**
 * @static
 * @returns {string}
 */
function getRoom() {
  return getLocalVal('room');
}

/**
 * @static
 * @param {string} room
 */
function setRoom(room) {
  setLocalVal('room', room);
}

/**
 * @static
 */
function removeRoom() {
  removeLocalVal('room');
}

/**
 * @static
 * @returns {boolean}
 */
function isHiddenCursor() {
  return getLocalVal('hiddenCursor') === 'true';
}

/**
 * @static
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
 * @static
 * @returns {boolean}
 */
function isHiddenMenu() {
  return getLocalVal('hiddenMenu') === 'true';
}

/**
 * @static
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
 * @static
 * @returns {boolean}
 */
function isHiddenCmdInput() {
  return getLocalVal('hiddenCmdInput') === 'true';
}

/**
 * @static
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
 * @static
 * @returns {boolean}
 */
function isThinView() {
  return getLocalVal('thinnerView') === 'true';
}

/**
 * @static
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
 * @static
 * @returns {Number}
 */
function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'), 10);
}

/**
 * @static
 * @param {Number} accessLevel
 */
function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
}

/**
 * @static
 * @param {boolean} forceFullscreen
 */
function shouldForceFullscreen(forceFullscreen) {
  setLocalVal('forceFullscreen', forceFullscreen);
}

/**
 * @static
 * @returns {boolean}
 */
function getForceFullscreen() {
  return getLocalVal('forceFullscreen') === 'true';
}

/**
 * @static
 * @param {boolean} gpsTracking
 */
function shouldGpsTrack(gpsTracking) {
  setLocalVal('gpsTracking', gpsTracking);
}

/**
 * @static
 * @returns {boolean}
 */
function getGpsTracking() {
  return getLocalVal('gpsTracking') === 'true';
}

/**
 * @static
 * @param {boolean}
 */
function shouldDisableCommands(disable) {
  setLocalVal('disableCommands', disable);
}

/**
 * @static
 * @returns {boolean}
 */
function getDisableCommands() {
  return getLocalVal('disableCommands') === 'true';
}

/**
 * @static
 * @returns {string}
 */
function getUser() {
  return getLocalVal('user');
}

/**
 * @static
 * @param {string} user
 */
function setUser(user) {
  setLocalVal('user', user);
}

/**
 * @static
 */
function removeUser() {
  removeLocalVal('user');
}

/**
 * @static
 * @returns {string[]}
 */
function getCommandHistory() {
  const commandHistory = getLocalVal('cmdHistory');

  return commandHistory && commandHistory !== null ? JSON.parse(commandHistory) : [];
}

/**
 * @public
 * @static
 * @param {string[]} commandHistory
 */
function setCommandHistory(commandHistory) {
  setLocalVal('cmdHistory', JSON.stringify(commandHistory));
}

/**
 * @static
 */
function removeCommandHistory() {
  removeLocalVal('cmdHistory');
}

/**
 * @static
 * @param {string} mode
 */
function setMode(mode) {
  setLocalVal('mode', mode);
}

/**
 * @static
 * @returns {string}
 */
function getMode() {
  return getLocalVal('mode');
}

/**
 * @static
 * @returns {boolean}
 */
function getStaticInputStart() {
  return getLocalVal('staticInputStart') === 'true';
}

/**
 * @static
 * @param {boolean} isStatic
 */
function shouldStaticInputStart(isStatic) {
  setLocalVal('staticInputStart', isStatic);
}

/**
 * @static
 * @param {string} value
 */
function setDefaultInputStart(value) {
  setLocalVal('defaultInputStart', value);
}

/**
 * @static
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
 * @static
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCenterCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('centerLat')),
    longitude: parseFloat(getLocalVal('centerLong')),
  };
}

/**
 * @static
 * @param {Number} longitude
 * @param {Number} latitude
 */
function setCornerOneCoordinates(longitude, latitude) {
  setLocalVal('cornerOneLong', longitude);
  setLocalVal('cornerOneLat', latitude);
}

/**
 * @static
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCornerOneCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerOneLat')),
    longitude: parseFloat(getLocalVal('cornerOneLong')),
  };
}

/**
 * @static
 * @param {Number} longitude
 * @param {Number} latitude
 */
function setCornerTwoCoordinates(longitude, latitude) {
  setLocalVal('cornerTwoLong', longitude);
  setLocalVal('cornerTwoLat', latitude);
}

/**
 * @static
 * @returns {{latitude: Number, longitude: Number}}
 */
function getCornerTwoCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerTwoLat')),
    longitude: parseFloat(getLocalVal('cornerTwoLong')),
  };
}

/**
 * @static
 * @param {Number} zoomLevel
 */
function setDefaultZoomLevel(zoomLevel) {
  setLocalVal('defaultZoomLevel', zoomLevel);
}

/**
 * @static
 * @returns {Number}
 */
function getDefaultZoomLevel() {
  return parseInt(getLocalVal('defaultZoomLevel'), 10);
}

/**
 * Sets radio channels
 * @static
 * @param {{name: string, url: string}} radioChannels
 */
function setRadioChannels(radioChannels) {
  setLocalVal('radioChannels', JSON.stringify(radioChannels));
}

/**
 * @static
 * @returns {{name: string, url: string}}
 */
function getRadioChannels() {
  return JSON.parse(getLocalVal('radioChannels'));
}

/**
 * @static
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
