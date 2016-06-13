const labels = require('./labels');
const mapTools = require('./mapTools');
const domManipulator = require('./domManipulator');

function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

function getLocalVal(name) {
  return localStorage.getItem(name);
}

function removeLocalVal(name) {
  localStorage.removeItem(name);
}

function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
}

function setDefaultLanguage(languageCode) {
  setLocalVal('defaultLanguage', languageCode);
  labels.setLanguage(languageCode);
}

function getFastMode() {
  return getLocalVal('fastMode') === 'true';
}

function setFastMode(isOn) {
  setLocalVal('fastMode', isOn);
}

function shouldHideRoomNames(hide) {
  setLocalVal('hideRoomNames', hide);
}

function getHideRoomNames() {
  return getLocalVal('hideRoomNames') === 'true';
}

function shouldHideTimeStamp(hide) {
  setLocalVal('hideTimeStamp', hide);
}

function getHideTimeStamp() {
  return getLocalVal('hideTimeStamp') === 'true';
}

function getAliases() {
  const aliases = getLocalVal('aliases');

  return aliases !== null ? JSON.parse(aliases) : {};
}

function setAliases(aliases) {
  setLocalVal('aliases', JSON.stringify(aliases));
}

function getDeviceId() {
  return getLocalVal('deviceId');
}

function setDeviceId(deviceId) {
  setLocalVal('deviceId', deviceId);
}

function getRoom() {
  return getLocalVal('room');
}

function setRoom(room) {
  setLocalVal('room', room);
}

function removeRoom() {
  removeLocalVal('room');
}

function isHiddenCursor() {
  return getLocalVal('hiddenCursor') === 'true';
}

function shouldHideCursor(isHidden) {
  const mainView = domManipulator.getMainView();

  if (isHidden) {
    mainView.classList.add('hideCursor');
  } else {
    mainView.classList.remove('hideCursor');
  }

  setLocalVal('hiddenCursor', isHidden);
}

function isHiddenMenu() {
  return getLocalVal('hiddenMenu') === 'true';
}

function shouldHideMenu(isHidden) {
  const menu = domManipulator.getMenu();

  if (isHidden) {
    menu.classList.add('hide');
  } else {
    menu.classList.remove('hide');
  }

  setLocalVal('hiddenMenu', isHidden);
}

function isHiddenCmdInput() {
  return getLocalVal('hiddenCmdInput') === 'true';
}

function shouldHideCmdInput(isHidden) {
  const cmdContainer = document.getElementById('inputContainer');

  if (isHidden) {
    cmdContainer.classList.add('invisible');
  } else {
    cmdContainer.classList.remove('invisible');
  }

  setLocalVal('hiddenCmdInput', isHidden);
}

function isThinView() {
  return getLocalVal('thinnerView') === 'true';
}

function shouldThinView(isThinner) {
  if (isThinner) {
    document.body.classList.add('thinner');
  } else {
    document.body.classList.remove('thinner');
  }

  setLocalVal('thinnerView', isThinner);
}

function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'), 10);
}

function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
}

function shouldForceFullscreen(forceFullscreen) {
  setLocalVal('forceFullscreen', forceFullscreen);
}

function getForceFullscreen() {
  return getLocalVal('forceFullscreen') === 'true';
}

function shouldGpsTrack(gpsTracking) {
  setLocalVal('gpsTracking', gpsTracking);
}

function getGpsTracking() {
  return getLocalVal('gpsTracking') === 'true';
}

function shouldDisableCommands(disable) {
  setLocalVal('disableCommands', disable);
}

function getDisableCommands() {
  return getLocalVal('disableCommands') === 'true';
}

function getUser() {
  return getLocalVal('user');
}

function setUser(user) {
  setLocalVal('user', user);
}

function removeUser() {
  removeLocalVal('user');
}

function getCommandHistory() {
  const commandHistory = getLocalVal('cmdHistory');

  return commandHistory && commandHistory !== null ? JSON.parse(commandHistory) : [];
}

function setCommandHistory(commandHistory) {
  setLocalVal('cmdHistory', JSON.stringify(commandHistory));
}

function removeCommandHistory() {
  removeLocalVal('cmdHistory');
}

function setMode(mode) {
  setLocalVal('mode', mode);
}

function getMode() {
  return getLocalVal('mode');
}

function getStaticInputStart() {
  return getLocalVal('staticInputStart') === 'true';
}

function shouldStaticInputStart(isStatic) {
  setLocalVal('staticInputStart', isStatic);
}

function setDefaultInputStart(value) {
  setLocalVal('defaultInputStart', value);
}

function setCenterCoordinates(longitude, latitude) {
  setLocalVal('centerLong', longitude);
  setLocalVal('centerLat', latitude);

  mapTools.setMapCenter({
    latitude,
    longitude,
  });
}

function getCenterCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('centerLat')),
    longitude: parseFloat(getLocalVal('centerLong')),
  };
}

function setCornerOneCoordinates(longitude, latitude) {
  setLocalVal('cornerOneLong', longitude);
  setLocalVal('cornerOneLat', latitude);
}

function getCornerOneCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerOneLat')),
    longitude: parseFloat(getLocalVal('cornerOneLong')),
  };
}

function setCornerTwoCoordinates(longitude, latitude) {
  setLocalVal('cornerTwoLong', longitude);
  setLocalVal('cornerTwoLat', latitude);
}

function getCornerTwoCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('cornerTwoLat')),
    longitude: parseFloat(getLocalVal('cornerTwoLong')),
  };
}

function setDefaultZoomLevel(zoomLevel) {
  setLocalVal('defaultZoomLevel', zoomLevel);
}

function getDefaultZoomLevel() {
  return parseInt(getLocalVal('defaultZoomLevel'), 10);
}

function setRadioChannels(radioChannels) {
  setLocalVal('radioChannels', JSON.stringify(radioChannels));
}

function getRadioChannels() {
  return JSON.parse(getLocalVal('radioChannels'));
}

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
