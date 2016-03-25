'use strict';

// Removed l, I and 1 to decrease user errors when reading the random strings
const chars = 'abcdefghjkmnopqrstuvwxyz';
const numbers = '023456789';
const specials = '/\\!<>*';
const binary = '01';
const lineLength = 29;

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

module.exports.createDeviceId = createDeviceId;
module.exports.createCharString = createCharString;
module.exports.createBinaryString = createBinaryString;
module.exports.createLine = createLine;
module.exports.createFullLine = createFullLine;
module.exports.createMixedString = createMixedString;
module.exports.createRandString = createRandString;
