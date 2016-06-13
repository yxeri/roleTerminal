'use strict';

const labels = require('./labels');

// Removed l, I and 1 to decrease user errors when reading the random strings
const chars = 'abcdefghjkmnopqrstuvwxyz';
const numbers = '023456789';
const specials = '/\\!<>*';
const binary = '01';
const lineLength = 29;

function beautifyNumb(number) {
  return number > 9 ? number : `0${number}`;
}

// Takes date and returns shorter readable time
function generateTimeStamp(date, full, year) {
  let newDate = new Date(date);
  let timeStamp;

  // Splitting of date is a fix for NaN on Android 2.*
  if (isNaN(newDate.getMinutes())) {
    const splitDate = date.split(/[-T:\.]+/);
    newDate = new Date(Date.UTC(splitDate[0], splitDate[1], splitDate[2], splitDate[3], splitDate[4], splitDate[5]));
  }

  const mins = beautifyNumb(newDate.getMinutes());
  const hours = beautifyNumb(newDate.getHours());
  timeStamp = `${hours}:${mins}`;

  if (full) {
    const month = beautifyNumb(newDate.getMonth());
    const day = beautifyNumb(newDate.getDate());
    timeStamp = `${day}/${month} ${timeStamp}`;
  }

  if (year) {
    const fullYear = newDate.getFullYear();
    timeStamp = `${fullYear} ${timeStamp}`;
  }

  return timeStamp;
}

function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

function findOneReplace(text, find, replaceWith) {
  return text.replace(new RegExp(find), replaceWith);
}

// Needed for Android 2.1. trim() is not supported
function trimSpace(sentText) {
  return findOneReplace(sentText, /^\s+|\s+$/, '');
}

function createRandString(selection, length, upperCase) {
  const randomLength = selection.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomVal = Math.round(Math.random() * (randomLength - 1));
    const val = Math.random() > 0.5 ? selection[randomVal].toUpperCase() : selection[randomVal];
    result += val;
  }

  if (upperCase) {
    return result.toUpperCase();
  }

  return result;
}

function createDeviceId() {
  return createRandString(numbers + chars, 15, false);
}

function createCharString(length, upperCase) {
  return createRandString(chars, length, upperCase);
}

function createBinaryString(length) {
  return createRandString(binary, length);
}

function createMixedString(length, upperCase) {
  return createRandString(numbers + chars + specials, length, upperCase);
}

function createLine(length) {
  let line = '';

  for (let i = 0; i < length; i++) {
    line += '-';
  }

  return line;
}

function createFullLine() {
  return createLine(lineLength);
}

function createCommandStart(commandName) {
  return [
    createFullLine(),
    ` ${commandName.toUpperCase()}`,
    createFullLine(),
  ];
}

function createCommandEnd() {
  return createFullLine();
}

function prependBroadcastMessage(data = {}) {
  const title = {};

  if (data.sender) {
    title.text = `${labels.getString('broadcast', 'broadcastFrom')} ${data.sender}`;
  } else {
    title.text = labels.getString('broadcast', 'broadcast');
  }

  return createCommandStart(title.text);
}

function addMessageSpecialProperties(message = {}) {
  const modifiedMessage = message;

  if (message.extraClass === 'broadcastMsg') {
    modifiedMessage.text = prependBroadcastMessage({ sender: message.customSender }).concat(message.text);
    modifiedMessage.text.push(createFullLine());
  }

  return modifiedMessage;
}

exports.createDeviceId = createDeviceId;
exports.createCharString = createCharString;
exports.createBinaryString = createBinaryString;
exports.createLine = createLine;
exports.createFullLine = createFullLine;
exports.createMixedString = createMixedString;
exports.createRandString = createRandString;
exports.isTextAllowed = isTextAllowed;
exports.createCommandStart = createCommandStart;
exports.createCommandEnd = createCommandEnd;
exports.trimSpace = trimSpace;
exports.prependBroadcastMessage = prependBroadcastMessage;
exports.addMessageSpecialProperties = addMessageSpecialProperties;
exports.generateTimeStamp = generateTimeStamp;
exports.beautifyNumb = beautifyNumb;
