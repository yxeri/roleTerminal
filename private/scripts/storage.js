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

const labels = require('./labels');
const mapTools = require('./mapTools');
const domManipulator = require('./domManipulator');

/**
 * Sets item to localStorage
 * @private
 * @param {string} name - Name of the item
 * @param {string} item - Item to be set
 */
function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

/**
 * Gets item from localStorage
 * @private
 * @param {string} name - Name of the item to be retrieved
 * @returns {string} - Retrieved item
 */
function getLocalVal(name) {
  return localStorage.getItem(name);
}

/**
 * Removes item from localStorage
 * @private
 * @param {string} name - Name of the item to be removed
 */
function removeLocalVal(name) {
  localStorage.removeItem(name);
}

/**
 * @static
 * @returns {string} - Language code
 */
function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
}

/**
 * @static
 * @param {string} languageCode - New language code
 */
function setDefaultLanguage(languageCode) {
  setLocalVal('defaultLanguage', languageCode);
  labels.setLanguage(languageCode);
}

/**
 * Used to skip some visual effects to save time
 * @static
 * @returns {boolean} - Is fast mode on?
 */
function getFastMode() {
  return getLocalVal('fastMode') === 'true';
}

/**
 * Used to skip some visual effects to save time
 * @static
 * @param {boolean} isOn - Should fast mode be on?
 */
function setFastMode(isOn) {
  setLocalVal('fastMode', isOn);
}

/**
 * @static
 * @param {boolean} hide - Should room names be hidden?
 */
function shouldHideRoomNames(hide) {
  setLocalVal('hideRoomNames', hide);
}

/**
 * @static
 * @returns {boolean} - Are room names hidden?
 */
function getHideRoomNames() {
  return getLocalVal('hideRoomNames') === 'true';
}

/**
 * @static
 * @param {boolean} hide - Should time stamps be hidden?
 */
function shouldHideTimeStamp(hide) {
  setLocalVal('hideTimeStamp', hide);
}

/**
 * @static
 * @returns {boolean} - Are time stamps hidden?
 */
function getHideTimeStamp() {
  return getLocalVal('hideTimeStamp') === 'true';
}

/**
 * Aliases are user-created shortcuts to commands
 * Stored as object
 * @static
 * @returns {Object} - Command aliases
 */
function getAliases() {
  const aliases = getLocalVal('aliases');

  return aliases !== null ? JSON.parse(aliases) : {};
}

/**
 * Aliases are user-created shortcuts to commands
 * Stored as object
 * @static
 * @param {Object} aliases - New aliases
 */
function setAliases(aliases) {
  setLocalVal('aliases', JSON.stringify(aliases));
}

/**
 * @static
 * @returns {string} - Device ID
 */
function getDeviceId() {
  return getLocalVal('deviceId');
}

/**
 * @static
 * @param {string} deviceId - Device ID
 */
function setDeviceId(deviceId) {
  setLocalVal('deviceId', deviceId);
}

/**
 * @static
 * @returns {string} - Room name
 */
function getRoom() {
  return getLocalVal('room');
}

/**
 * @static
 * @param {string} room - New room name
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
 * @returns {boolean} - Is the cursor hidden?
 */
function isHiddenCursor() {
  return getLocalVal('hiddenCursor') === 'true';
}

/**
 * Hides or shows the cursor in the main view
 * @static
 * @param {boolean} isHidden - Should the cursor be hidden?
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
 * @returns {boolean} - Is the menu hidden?
 */
function isHiddenMenu() {
  return getLocalVal('hiddenMenu') === 'true';
}

/**
 * Hides or shows the menu in the view
 * @static
 * @param {boolean} isHidden - Should the menu be hidden?
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
 * @returns {boolean} - Is the command input hidden?
 */
function isHiddenCmdInput() {
  return getLocalVal('hiddenCmdInput') === 'true';
}

/**
 * Hides or shows the command input in the view
 * @static
 * @param {boolean} isHidden - Should the command input be hidden?
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
 * @returns {boolean} - Is the view thin?
 */
function isThinView() {
  return getLocalVal('thinnerView') === 'true';
}

/**
 * Adds more padding to make the view look more thinner
 * Used on screens that might be partially obstructed
 * @static
 * @param {boolean} isThinner - Should the view be thin?
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
 * @returns {Number} - User access level
 */
function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'), 10);
}

/**
 * @static
 * @param {Number} accessLevel - User access level
 */
function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
}

/**
 * Returns longitude and latitude
 * @static
 * @returns {Object} Object with longitude and latitude
 */
function getStaticPosition() {
  return {
    longitude: parseFloat(getLocalVal('staticLong')),
    latitude: parseFloat(getLocalVal('staticLat')),
  };
}

/**
 * Set longitude and latitude
 * @static
 * @param {number} lat - Latitude
 * @param {number} long - Longitude
 */
function setStaticPosition(lat, long) {
  setLocalVal('staticLong', long);
  setLocalVal('staticLat', lat);
}

/**
 * Remove longitude and latitude from localStorage
 */
function removeStaticPosition() {
  localStorage.removeItem('staticLong');
  localStorage.removeItem('staticLat');
}

/**
 * @static
 * @param {boolean} forceFullscreen - Should fullscreen be forced?
 */
function shouldForceFullscreen(forceFullscreen) {
  setLocalVal('forceFullscreen', forceFullscreen);
}

/**
 * @static
 * @returns {boolean} - Is fullscreen forced?
 */
function getForceFullscreen() {
  return getLocalVal('forceFullscreen') === 'true';
}

/**
 * @static
 * @param {boolean} gpsTracking - Should gps tracking be available?
 */
function shouldGpsTrack(gpsTracking) {
  setLocalVal('gpsTracking', gpsTracking);
}

/**
 * @static
 * @returns {boolean} - Is gps tracking available?
 */
function getGpsTracking() {
  return getLocalVal('gpsTracking') === 'true';
}

/**
 * The msg command will still be available in chat mode
 * @static
 * @param {boolean} disable - Should commands be disabled?
 */
function shouldDisableCommands(disable) {
  setLocalVal('disableCommands', disable);
}

/**
 * The msg command will still be available in chat mode
 * @static
 * @returns {boolean} - Are commands disabled?
 */
function getDisableCommands() {
  return getLocalVal('disableCommands') === 'true';
}

/**
 * @static
 * @returns {string} - User name
 */
function getUser() {
  return getLocalVal('user');
}

/**
 * @static
 * @param {string} user - New user name
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
 * Stored as array
 * @static
 * @returns {string[]} - Command history
 */
function getCommandHistory() {
  const commandHistory = getLocalVal('cmdHistory');

  return commandHistory && commandHistory !== null ? JSON.parse(commandHistory) : [];
}

/**
 * Stored as array
 * @static
 * @param {string[]} commandHistory - Command history
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
 * @param {string} mode - New command input mode
 */
function setMode(mode) {
  setLocalVal('mode', mode);
}

/**
 * @static
 * @returns {string} - Command input mode
 */
function getMode() {
  return getLocalVal('mode');
}

/**
 * @static
 * @returns {boolean} - Is the input start text static?
 */
function getStaticInputStart() {
  return getLocalVal('staticInputStart') === 'true';
}

/**
 * @static
 * @param {boolean} isStatic - Should the input start text be static?
 */
function shouldStaticInputStart(isStatic) {
  setLocalVal('staticInputStart', isStatic);
}

/**
 * @static
 * @param {string} value - New default input start text
 */
function setDefaultInputStart(value) {
  setLocalVal('defaultInputStart', value);
}

/**
 * Sets new center coordinates on the map
 * @static
 * @param {Number} longitude - Longitude
 * @param {Number} latitude - Latitude
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
 * Gets center coordinates from the map
 * @static
 * @returns {{latitude: Number, longitude: Number}} - Center coordinates
 */
function getCenterCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('centerLat')),
    longitude: parseFloat(getLocalVal('centerLong')),
  };
}

/**
 * Used together with cornerTwo to calculate map bounds
 * @static
 * @param {Number} longitude - Longitude
 * @param {Number} latitude - Latitude
 */
function setCornerOneCoordinates(longitude, latitude) {
  setLocalVal('cornerOneLong', longitude);
  setLocalVal('cornerOneLat', latitude);
}

/**
 * Used together with cornerTwo to calculate map bounds
 * @static
 * @returns {{latitude: Number, longitude: Number}} - Corner coordinates
 */
function getCornerOneCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerOneLat')),
    longitude: parseFloat(getLocalVal('cornerOneLong')),
  };
}

/**
 * Used together with cornerOne to calculate map bounds
 * @static
 * @param {Number} longitude - Longitude
 * @param {Number} latitude - Latitude
 */
function setCornerTwoCoordinates(longitude, latitude) {
  setLocalVal('cornerTwoLong', longitude);
  setLocalVal('cornerTwoLat', latitude);
}

/**
 * Used together with cornerOne to calculate map bounds
 * @static
 * @returns {{latitude: Number, longitude: Number}} - Corner coordinates
 */
function getCornerTwoCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerTwoLat')),
    longitude: parseFloat(getLocalVal('cornerTwoLong')),
  };
}

/**
 * Set default zoom level on the map
 * @static
 * @param {Number} zoomLevel - New default zoom level
 */
function setDefaultZoomLevel(zoomLevel) {
  setLocalVal('defaultZoomLevel', zoomLevel);
}

/**
 * Get default zoom level from the map
 * @static
 * @returns {Number} - Get default zoom level
 */
function getDefaultZoomLevel() {
  return parseInt(getLocalVal('defaultZoomLevel'), 10);
}

/**
 * Sets radio channels
 * Stored as object
 * @static
 * @param {{name: string, url: string}} radioChannels - Radio channels, consisting of name and url
 */
function setRadioChannels(radioChannels) {
  setLocalVal('radioChannels', JSON.stringify(radioChannels));
}

/**
 * Stored as object
 * @static
 * @returns {{name: string, url: string}} - Radio channels, consisting of name and url
 */
function getRadioChannels() {
  return JSON.parse(getLocalVal('radioChannels'));
}

/**
 * @static
 * @returns {string} - Default start input
 */
function getDefaultInputStart() {
  return getLocalVal('defaultInputStart');
}

/**
 * @static
 * @param {boolean} shouldLoad - Should video load?
 */
function shouldLoadVideo(shouldLoad) {
  setLocalVal('loadVideo', shouldLoad);
}

/**
 * @static
 * @returns {boolean} - Should video load?
 */
function getLoadVideo() {
  return getLocalVal('loadVideo') === true;
}

exports.shouldLoadVideo = shouldLoadVideo;
exports.getLoadVideo = getLoadVideo;
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
exports.getStaticPosition = getStaticPosition;
exports.setStaticPosition = setStaticPosition;
exports.removeStaticPosition = removeStaticPosition;
