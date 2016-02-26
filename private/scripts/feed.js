'use strict';

// Timeout between print of rows (milliseconds)
const rowTimeout = 40;
/**
 * Number of messages that will be processed and printed
 * per loop in consumeMessageQueue
 */
const messagesPerQueue = 5;
/**
 * Queue of all the message objects that will be handled and printed
 */
const messageQueue = [];
const commandQueue = [];
/**
 * Char that is prepended on commands in chat mode
 */
const commandChars = ['-', '/'];
const cmdMode = 'cmd';
const chatMode = 'chat';
const randomString = '023456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';
const randomBinary = '01';
const hideRooms = [
  'broadcast',
  'important',
  'morse',
];
const noLinkRooms = [
  'whisper',
];
// Interval/timeout times in milliseconds
const screenOffIntervalTime = 1000;
const watchPositionTime = 15000;
const pausePositionTime = 40000;
/**
 * DOM element init
 * Initiation of DOM elements has to be done here.
 * Android 4.1.* would otherwise give JS errors
 */
const mainFeed = document.getElementById('mainFeed');
const commandInput = document.getElementById('cmdInput');
const inputStart = document.getElementById('inputStart');
const modeField = document.getElementById('mode');
const spacer = document.getElementById('spacer');
const background = document.getElementById('background');
// Socket.io
const socket = io(); // eslint-disable-line
// Queue of all the sounds that will be handled and played
const soundQueue = [];
const commandTime = 1000;
const dot = '.';
const dash = '-';
const morseSeparator = '#';
// TODO Convert to arrays with amounts pointing to either - or .
const morseCodes = {
  'a': '.-',
  'b': '-...',
  'c': '-.-.',
  'd': '-..',
  'e': '.',
  'f': '..-.',
  'g': '--.',
  'h': '....',
  'i': '..',
  'j': '.---',
  'k': '-.-',
  'l': '.-..',
  'm': '--',
  'n': '-.',
  'o': '---',
  'p': '.--.',
  'q': '--.-',
  'r': '.-.',
  's': '...',
  't': '-',
  'u': '..-',
  'v': '...-',
  'w': '.--',
  'x': '-..-',
  'y': '-.--',
  'z': '--..',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '0': '-----',
  // Symbolizes space betwen words
  '#': morseSeparator,
};
/**
 * Stores everything related to the map area
 * The map area will be separated into grids
 * The size of each grid is dependent of the map size
 * (which is set with coordinates) and max amount of X and Y grids
 */
const mapHelper = {
  leftLong: 15.1857261,
  rightLong: 15.2045467,
  topLat: 59.7609695,
  bottomLat: 59.7465301,
  xGridsMax: 24,
  yGridsMax: 36,
  xSize: 0,
  ySize: 0,
  xGrids: {},
  yGrids: {},
};
const commmandFailText = {
  text: ['command not found'],
  text_se: ['Kommandot kunde inte hittas'],
};
const abortInfo = {
  text: ['You can cancel out of the command by typing "exit" or "abort"'],
  text_se: ['Ni kan avbryta kommandot genom att skriva "exit" eller "abort"'],
};
const defaultInputStart = 'RAZCMD';
const commandHelper = {
  maxSteps: 0,
  onStep: 0,
  command: null,
  keysBlocked: false,
  data: null,
  hideInput: false,
};
const validCommands = {};
const lineLength = 29;
const triggerKeysPressed = [];
let storedMessages = {};
let audioCtx;
let oscillator;
let gainNode;
let soundTimeout = 0;
let previousCommandPointer;
let watchId = null;
// Is geolocation tracking on?
let isTracking = true;
let positions = [];
/**
 * Used by isScreenOff() to force reconnect when phone screen is off
 * for a longer period of time
 */
let lastScreenOff = (new Date()).getTime();
let commmandUsed = false;
/**
 * Used to block repeat of some key presses
 */
let keyPressed = false;
/**
 * Used for Android full screen to change CSS layout
 */
let clicked = false;
// True if messages are being processed and printed right now
let printing = false;
/**
 * Shorter queue of messages that will be processed this loop. Length is
 * based on messagesPerQueue constiable
 */
let shortMessageQueue = [];
/**
 * Focus can sometimes trigger twice, which is used to check if a reconnection
 * is needed. This flag will be set to true while it is reconnecting to
 * block the second attempt
 */
let reconnecting = false;
let oldAndroid;
let trackingInterval = null;
let isScreenOffInterval = null;

function getInputText() {
  return commandInput.value;
}

function setCommandInput(text) {
  commandInput.value = text;
}

function getInputStart() {
  return inputStart.textContent;
}

function clearInput() {
  setCommandInput('');
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

function replaceLastInputPhrase(text) {
  const phrases = getInputText().split(' ');
  phrases[phrases.length - 1] = text;

  setCommandInput(phrases.join(' '));
}

function beautifyNumb(number) {
  return number > 9 ? number : '0' + number;
}

function createLine(length) {
  let line = '';

  for (let i = 0; i < length; i++) {
    line += '-';
  }

  return line;
}

function generateSpan(params = { text: '' }) {
  const text = params.text;
  const linkable = params.linkable;
  const keepInput = params.keepInput;
  const replacePhrase = params.replacePhrase;
  const className = params.className;
  const spanObj = document.createElement('span');

  // TODO Refactor this and generateLink()
  if (linkable) {
    spanObj.classList.add('link');

    spanObj.addEventListener('click', function spanClick(event) {
      clicked = true;


      if (replacePhrase) {
        replaceLastInputPhrase(text + ' ');
      } else if (keepInput) {
        appendInputText(text + ' ');
      } else {
        setCommandInput(text + ' ');
      }

      commandInput.focus();
      event.stopPropagation();
    });
  }

  spanObj.appendChild(document.createTextNode(text));

  if (className) {
    spanObj.className = className;
  }

  return spanObj;
}

// TODO Refactor this and if case for linkable in generateSpan()
function generateLink(text, className, func) {
  const spanObj = generateSpan({
    text: text,
    className: className,
  });
  spanObj.classList.add('link');

  spanObj.addEventListener('click', function linkClickHandler(event) {
    clicked = true;

    func(this);
    commandInput.focus();
    event.stopPropagation();
  });

  return spanObj;
}

// Takes date and returns shorter readable time
function generateTimeStamp(date, full, year) {
  let newDate = new Date(date);
  let timeStamp;

  // Splitting of date is a fix for NaN on Android 2.*
  if (isNaN(newDate.getMinutes)) {
    const splitDate = date.split(/[-T:\.]+/);
    newDate = new Date(Date.UTC(splitDate[0], splitDate[1], splitDate[2], splitDate[3], splitDate[4], splitDate[5]));
  }

  const mins = beautifyNumb(newDate.getMinutes());
  const hours = beautifyNumb(newDate.getHours());
  timeStamp = hours + ':' + mins;

  if (full) {
    const month = beautifyNumb(newDate.getMonth());
    const day = beautifyNumb(newDate.getDate());
    timeStamp = day + '/' + month + ' ' + timeStamp;
  }

  if (year) {
    const fullYear = newDate.getFullYear();
    timeStamp = fullYear + ' ' + timeStamp;
  }

  return timeStamp;
}

function linkUser(elem) {
  setCommandInput('whisper ' + elem.textContent + ' ');
}

function linkRoom(elem) {
  validCommands.room.func([elem.textContent]);
}

function scrollView() {
  if (!oldAndroid) {
    spacer.scrollIntoView(false);
  } else {
    // Compatibility fix for old Android
    window.scrollTo(0, document.body.scrollHeight);
  }
}

// Adds time stamp and room name to a string from a message if they are set
function generateFullRow(sentText, message) {
  const rowObj = document.createElement('li');
  const roomName = message.roomName;

  if (message.time && !message.skipTime) {
    rowObj.appendChild(generateSpan({
      text: generateTimeStamp(message.time),
      extraClass: 'timestamp',
    }));
  }

  if (roomName && hideRooms.indexOf(roomName.toLowerCase()) === -1) {
    if (noLinkRooms.indexOf(roomName.toLowerCase()) > -1) {
      rowObj.appendChild(generateSpan({
        text: roomName,
        className: 'room',
      }));
    } else {
      rowObj.appendChild(generateLink(roomName, 'room', linkRoom));
    }
  }

  if (!message.hideName && message.userName) {
    rowObj.appendChild(generateLink(message.userName, 'user', linkUser));
  }

  rowObj.appendChild(generateSpan({
    text: sentText,
    linkable: message.linkable,
    keepInput: message.keepInput,
    replacePhrase: message.replacePhrase,
  }));

  return rowObj;
}

function getLocalVal(name) {
  return localStorage.getItem(name);
}

function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
}

function printRow(text, message) {
  const row = generateFullRow(text, message);
  const extraClass = message.extraClass;

  if (extraClass) {
    // classList doesn't work on older devices, thus the usage of className
    row.className += ' ' + extraClass;
  }

  mainFeed.appendChild(row);
  scrollView();
}

function createRow(message) {
  const defaultLanguage = getDefaultLanguage();
  // Set text depending on default language set. Empty means English
  let currentText = defaultLanguage === '' ? message.text : message['text_' + defaultLanguage];

  // Fallback to English if there is no text in the default language
  if (!currentText) {
    currentText = message.text;
  }

  if (currentText && currentText.length > 0) {
    const text = currentText.shift();

    printRow(text, message);
    setTimeout(createRow, rowTimeout, message);
  } else {
    if (message.morseCode) {
      printRow(message.morseCode, { time: message.time });
    }

    consumeMessageShortQueue(); // eslint-disable-line no-use-before-define
  }
}

function consumeMessageShortQueue() {
  if (shortMessageQueue.length > 0) {
    const message = shortMessageQueue.shift();

    createRow(message, consumeMessageShortQueue);
  } else {
    printing = false;
    consumeMessageQueue(); // eslint-disable-line no-use-before-define
  }
}

// Prints messages from the queue
function consumeMessageQueue() {
  if (!printing && messageQueue.length > 0) {
    shortMessageQueue = messageQueue.splice(0, messagesPerQueue);
    printing = true;
    consumeMessageShortQueue();
  }
}

function findOneReplace(text, find, replaceWith) {
  return text.replace(new RegExp(find), replaceWith);
}

function hideInput(hide) {
  if (hide) {
    commandInput.setAttribute('type', 'password');
  } else {
    commandInput.setAttribute('type', 'text');
  }
}

function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

function removeLocalVal(name) {
  localStorage.removeItem(name);
}

function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

function queueMessage(message) {
  messageQueue.push(message);
  consumeMessageQueue();
}

function copyString(text) {
  if (text && text !== null) {
    return JSON.parse(JSON.stringify(text));
  }

  return '';
}

function copyMessage(textObj) {
  if (textObj && textObj !== null) {
    return JSON.parse(JSON.stringify(textObj));
  }

  return { text: [''] };
}

function createRandString(selection, length, upperCase) {
  const randomLength = selection.length;
  let result = '';
  let randomVal;

  for (let i = 0; i < length; i++) {
    randomVal = Math.random() * (randomLength - 1);
    result += selection[Math.round(randomVal)];
  }

  if (upperCase) {
    return result.toUpperCase();
  }

  return result;
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

function getAccessLevel() {
  return parseInt(getLocalVal('accessLevel'), 10);
}

function setAccessLevel(accessLevel) {
  setLocalVal('accessLevel', accessLevel);
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

  if (commandHistory && commandHistory !== null) {
    return JSON.parse(commandHistory);
  }

  return [];
}

function setCommandHistory(commandHistory) {
  setLocalVal('cmdHistory', JSON.stringify(commandHistory));
}

function removeCommandHistory() {
  removeLocalVal('cmdHistory');
}

function setModeText(text) {
  modeField.textContent = '[' + text + ']';
}

function clearModeText() {
  modeField.textContent = '';
}

function getModeText() {
  return modeField.textContent; // String
}
function setMode(mode) {
  setLocalVal('mode', mode);
}

function getMode() {
  return getLocalVal('mode');
}

// TODO: Change name to setInputStartText or similar
function setInputStart(text) {
  inputStart.textContent = text.replace(/\s/g, '-').toLowerCase();
}

function resetCommand(aborted) {
  const room = getRoom() ? getRoom() : defaultInputStart;
  commandHelper.command = null;
  commandHelper.onStep = 0;
  commandHelper.maxSteps = 0;
  commandHelper.keysBlocked = false;
  commandHelper.data = null;
  commandHelper.hideInput = false;
  commandHelper.allowAutoComplete = false;

  if (aborted) {
    queueMessage({
      text: ['Aborting command'],
      text_se: ['Avbryter kommandot'],
    });
  }

  setInputStart(room);
  hideInput(false);
}

function refreshApp() {
  window.location.reload();
}

function queueCommand(command, data, commandMsg) {
  commandQueue.push({
    command: command,
    data: data,
    commandMsg: commandMsg,
  });
}

function reconnect() {
  const user = getUser();

  if (!reconnecting) {
    reconnecting = true;

    socket.disconnect();
    socket.connect({ forceNew: true });
    socket.emit('updateId', {
      user: { userName: user },
      device: { deviceId: getDeviceId },
    });
  }
}

// Needed for Android 2.1. trim() is not supported
function trimSpace(sentText) {
  return findOneReplace(sentText, /^\s+|\s+$/, '');
}

function changeModeText() {
  const inputText = getInputText();
  const mode = getMode();

  if (getUser() && !commandHelper.command) {
    // TODO msg command text in comparison should not be hard coded
    if ((chatMode === mode && commandChars.indexOf(inputText.charAt(0)) > -1) || (cmdMode === mode && trimSpace(inputText).split(' ')[0] !== 'msg')) {
      setModeText(cmdMode.toUpperCase());
    } else {
      setModeText(chatMode.toUpperCase());
    }
  }
}

function pushCommandHistory(command) {
  const commandHistory = getCommandHistory();

  commandHistory.push(command);
  setCommandHistory(commandHistory);
}

function enterRoom(roomName) {
  setRoom(roomName);
  setInputStart(roomName);
  queueMessage({
    text: ['Entered ' + roomName],
    text_se: ['Gick in i ' + roomName],
  });
}

function resetPreviousCommandPointer() {
  const commandHistory = getCommandHistory();

  previousCommandPointer = commandHistory ? commandHistory.length : 0;
}

function setGain(value) {
  gainNode.gain.value = value;
}

function playMorse(morseCode) {
  let duration;
  let shouldPlay;

  function finishSoundQueue(timeouts) {
    const cleanMorse = morseCode.replace(/#/g, '');

    soundQueue.splice(0, timeouts);
    queueMessage({
      text: ['Morse code message received:  ' + cleanMorse],
      text_se: ['Morse mottaget:  ' + cleanMorse],
    });
  }

  if (soundQueue.length === 0) {
    soundTimeout = 0;
  }

  for (let i = 0; i < morseCode.length; i++) {
    shouldPlay = false;
    duration = 0;

    if (dot === morseCode[i]) {
      duration = 50;
      shouldPlay = true;
    } else if (dash === morseCode[i]) {
      duration = 150;
      shouldPlay = true;
    } else if (morseSeparator === morseCode[i]) {
      duration = 50;
    } else {
      duration = 75;
    }

    if (shouldPlay) {
      soundQueue.push(setTimeout(setGain, soundTimeout, 1));
      soundQueue.push(setTimeout(setGain, soundTimeout + duration, 0));
    }

    soundTimeout += duration;
  }

  setTimeout(finishSoundQueue, soundTimeout, (2 * morseCode.length), morseCode);
}

/*
 * Taken from http://stackoverflow.com/questions/639695/
 * how-to-convert-latitude-or-longitude-to-meters/11172685#11172685
 * generally used geo measurement function
 * @param {number} lat1 - Latitude for first coordinate
 * @param {number} lon1 - Longitude for first coordinate
 * @param {number} lat2 - Latitude for second coordinate
 * @param {number} lon2 - Longitude for second coordinate
 * @returns {number} Returns distances in meters between the coordinates
 */
// function measureDistance(lat1, lon1, lat2, lon2) {
//
//  // Radius of earth in KM
//  const R = 6378.137;
//  const dLat = (lat2 - lat1) * Math.PI / 180;
//  const dLon = (lon2 - lon1) * Math.PI / 180;
//  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//          Math.sin(dLon / 2) * Math.sin(dLon / 2);
//  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//  const d = R * c;
//  return d * 1000; // meters
// }

function parseMorse(text) {
  let morseCode;
  let morseCodeText = '';
  let filteredText = text.toLowerCase();

  filteredText = filteredText.replace(/[åä]/g, 'a');
  filteredText = filteredText.replace(/[ö]/g, 'o');
  filteredText = filteredText.replace(/\s/g, '#');
  filteredText = filteredText.replace(/[^a-z0-9#]/g, '');

  for (let i = 0; i < filteredText.length; i++) {
    morseCode = morseCodes[filteredText.charAt(i)];

    for (let j = 0; j < morseCode.length; j++) {
      morseCodeText += morseCode[j] + ' ';
    }

    morseCodeText += '   ';
  }

  return morseCodeText;
}

function generateMap() {
  const startLetter = 'A';
  mapHelper.xSize = (mapHelper.rightLong - mapHelper.leftLong) / parseFloat(mapHelper.xGridsMax);
  mapHelper.ySize = (mapHelper.topLat - mapHelper.bottomLat) / parseFloat(mapHelper.yGridsMax);

  for (let xGrid = 0; xGrid < mapHelper.xGridsMax; xGrid++) {
    const currentChar = String.fromCharCode(startLetter.charCodeAt(0) + xGrid);
    mapHelper.xGrids[currentChar] = mapHelper.leftLong + parseFloat(mapHelper.xSize * xGrid);
  }

  for (let yGrid = 0; yGrid < mapHelper.yGridsMax; yGrid++) {
    mapHelper.yGrids[yGrid] = mapHelper.topLat - parseFloat(mapHelper.ySize * yGrid);
  }
}

function locateOnMap(latitude, longitude) {
  // TODO Change from Object.keys for compatibility with older Android
  const xKeys = Object.keys(mapHelper.xGrids);
  const yKeys = Object.keys(mapHelper.yGrids);
  let x;
  let y;

  if (longitude >= mapHelper.leftLong && longitude <= mapHelper.rightLong && latitude <= mapHelper.topLat && latitude >= mapHelper.bottomLat) {
    for (let xGrid = 0; xGrid < xKeys.length; xGrid++) {
      const nextXGrid = mapHelper.xGrids[xKeys[xGrid + 1]];

      if (longitude < nextXGrid) {
        x = xKeys[xGrid];

        break;
      } else if (longitude === (nextXGrid + parseFloat(mapHelper.xSize))) {
        x = xKeys[xGrid + 1];

        break;
      }
    }

    for (let yGrid = 0; yGrid < yKeys.length; yGrid++) {
      const nextYGrid = mapHelper.yGrids[yKeys[yGrid + 1]];

      if (latitude > nextYGrid) {
        y = yKeys[yGrid];

        break;
      } else if (latitude === (nextYGrid - parseFloat(mapHelper.ySize))) {
        y = yKeys[yGrid + 1];

        break;
      }
    }
  }

  if (x !== undefined && y !== undefined) {
    return x + '' + y;
  }

  return createLine(3);
}

/**
 * Geolocation object is empty when sent through Socket.IO
 * This is a fix for that
 * @param {object} position . -
 * @returns {object} Returns position
 */
function preparePosition(position) {
  const preparedPosition = {};
  preparedPosition.latitude = position.coords.latitude;
  preparedPosition.longitude = position.coords.longitude;
  preparedPosition.speed = position.coords.speed;
  preparedPosition.accuracy = position.coords.accuracy;
  preparedPosition.heading = position.coords.heading;
  preparedPosition.timestamp = position.timestamp;

  return preparedPosition; // geolocation
}

function sendLocation() {
  let mostAccuratePos;

  function retrievePosition() {
    const clearingWatch = function clearingWatch() {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      trackingInterval = setTimeout(sendLocation, pausePositionTime);
    };

    watchId = navigator.geolocation.watchPosition(function watchPosition() {
      // FIXME This is broken and doesn't do anything
      // if (position !== undefined) {
      //  positions.push(position);
      // }
    }, function watchPositionCallback(err) {
      if (err.code === err.PERMISSION_DENIED) {
        isTracking = false;
        clearTimeout(trackingInterval);
        queueMessage({
          text: [
            'Unable to connect to the tracking satellites',
            'Turning off tracking is a major offense',
            'Organica Re-Education Squads have been ' +
            'sent to scour the area',
          ],
          extraClass: 'importantMsg',
        });
      }
    }, { enableHighAccuracy: true });

    if (isTracking) {
      trackingInterval = setTimeout(clearingWatch, watchPositionTime);
    }
  }

  if (getUser() !== null && positions.length > 0) {
    mostAccuratePos = positions[positions.length - 1];

    for (let i = positions.length - 2; i >= 0; i--) {
      const position = positions[i];
      const accuracy = positions[i].coords.accuracy;

      if (mostAccuratePos.coords.accuracy > accuracy) {
        mostAccuratePos = position;
      }
    }

    positions = [];

    socket.emit('updateLocation', { position: preparePosition(mostAccuratePos) });
  }

  retrievePosition();
}

/**
 * Some devices disable Javascript when screen is off (iOS)
 * They also fail to notice that they have been disconnected
 * We check the time between heartbeats and if the time i
 * over 10 seconds (example: when screen is turned off and then on)
 * we force them to reconnect
 * @returns {undefined} Returns nothing
 */
function isScreenOff() {
  const now = (new Date()).getTime();
  const diff = now - lastScreenOff;
  // FIXME Hard coded
  const offBy = diff - 1000;
  lastScreenOff = now;

  // FIXME Hard coded
  if (offBy > 10000) {
    reconnect();
  }
}

/**
 * Set intervals at boot and recreate them when the window is focused
 * This is to make sure that nothing has been killed in the background
 * @returns {undefined} Returns nothing
 */
function setIntervals() {
  if (trackingInterval !== null) {
    clearTimeout(trackingInterval);
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  if (isTracking && navigator.geolocation) {
    // Gets new geolocation data
    sendLocation();
  }

  // Should not be recreated on focus
  if (isScreenOffInterval === null) {
    /**
     * Checks time between when JS stopped and started working again
     * This will be most frequently triggered when a user turns off the
     * screen on their phone and turns it back on
     */
    isScreenOffInterval = setInterval(isScreenOff, screenOffIntervalTime);
  }
}

function startAudio() {
  // Not supported in Spartan nor IE11 or lower
  if (window.AudioContext || window.webkitAudioContext) {
    if (window.AudioContext) {
      audioCtx = new window.AudioContext();
    } else if (window.webkitAudioContext) {
      audioCtx = new window.webkitAudioContext(); // eslint-disable-line
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 0;
    oscillator.type = 'sine';
    oscillator.frequency.value = '440';
    // oscillator.type = 'square';
    // oscillator.frequency.value = '300';

    oscillator.start(0);
  }
}

function triggerAutoComplete(text, textChar) {
  if (text.charAt(text.length - 1) === ' ' && textChar === ' ') {
    setCommandInput(trimSpace(text));

    return true;
  }

  return false;
}

function setCommandUsed(used) {
  commmandUsed = used;
}

function consumeCommandQueue() {
  if (commandQueue.length > 0) {
    const storedCommand = commandQueue.shift();
    const commmand = storedCommand.command;
    const commandMessage = storedCommand.commandMsg;

    if (commandMessage) {
      queueMessage(commandMessage);
    }

    setCommandUsed(true);
    commmand(storedCommand.data);
    setTimeout(consumeCommandQueue, commandTime);
  } else {
    setCommandUsed(false);
  }
}

function startCommandQueue() {
  if (!commmandUsed) {
    consumeCommandQueue();
  }
}

function getCommandAccessLevel(commandName) {
  return validCommands[commandName] ? validCommands[commandName].accessLevel : 1;
}

function getCommand(commandName) {
  const aliases = getAliases();
  let command;

  if (validCommands[commandName]) {
    command = validCommands[commandName];
  } else if (aliases[commandName]) {
    command = validCommands[aliases[commandName][0]];
  }

  return command;
}

function combineSequences(commandName, phrases) {
  const aliases = getAliases();

  return aliases[commandName] ? aliases[commandName].concat(phrases.slice(1)) : phrases.slice(1);
}

function expandPartialMatch(commands, partialMatch, sign) {
  const firstCommand = commands[0];
  let expanded = '';
  let matched = true;

  for (let i = partialMatch.length; i < firstCommand.length; i++) {
    const commandChar = firstCommand.charAt(i);

    for (let j = 0; j < commands.length; j++) {
      if (commands[j].charAt(i) !== commandChar) {
        matched = false;

        break;
      }
    }

    if (matched) {
      expanded += commandChar;
    } else {
      return commandChars.indexOf(sign) >= 0 ? sign + partialMatch + expanded : partialMatch + expanded;
    }
  }
}

function autoCompleteCommand() {
  const phrases = trimSpace(getInputText().toLowerCase()).split(' ');
  // TODO Change from Object.keys for compatibility with older Android
  const commands = Object.keys(validCommands).concat(Object.keys(getAliases()));
  const matched = [];
  const sign = phrases[0].charAt(0);
  let newText = '';
  let matches;
  let partialCommand = phrases[0];

  /**
   * Auto-complete should only trigger when one phrase is in the input
   * It will not auto-complete flags
   * If chat mode and the command is prepended or normal mode
   */
  if (phrases.length === 1 && partialCommand.length > 0 && (commandChars.indexOf(sign) >= 0 || (cmdMode === getMode()) || getUser() === null)) {
    // Removes prepend sign
    if (commandChars.indexOf(sign) >= 0) {
      partialCommand = partialCommand.slice(1);
    }

    for (let i = 0; i < commands.length; i++) {
      matches = false;

      for (let j = 0; j < partialCommand.length; j++) {
        const commandAccesssLevel = getCommandAccessLevel(commands[i]);

        if ((isNaN(commandAccesssLevel) || getAccessLevel() >= commandAccesssLevel) && partialCommand.charAt(j) === commands[i].charAt(j)) {
          matches = true;
        } else {
          matches = false;

          break;
        }
      }

      if (matches) {
        matched.push(commands[i]);
      }
    }

    if (matched.length === 1) {
      const commandIndex = commandChars.indexOf(sign);

      if (commandIndex >= 0) {
        newText += commandChars[commandIndex];
      }

      newText += matched[0] + ' ';

      clearInput();
      setCommandInput(newText);
    } else if (matched.length > 0) {
      setCommandInput(expandPartialMatch(matched, partialCommand, sign));
      queueMessage({ text: [matched.join('\t')] });
    }

    // No input? Show all available commands
  } else if (partialCommand.length === 0) {
    validCommands.help.func();
  }
}

function printHelpMessage(command) {
  const helpMsg = { text: [] };

  if (command.help) {
    helpMsg.text = helpMsg.text.concat(command.help);
  }

  if (command.instructions) {
    helpMsg.text = helpMsg.text.concat(command.instructions);
  }

  if (helpMsg.text.length > 0) {
    queueMessage(helpMsg);
  }
}

function printUsedCommand(clearAfterUse, inputText) {
  if (clearAfterUse) {
    return null;
  }

  /**
   * Print input if the command shouldn't clear
   * after use
   */
  return {
    text: [getInputStart() + getModeText() + '$ ' + inputText],
  };
}

/**
 * Returns found command based on sent command string
 * undefined means that no match was found
 */
function retrieveCommand(command) {
  const sign = command.charAt(0);
  let commandName;

  if (commandChars.indexOf(sign) >= 0) {
    commandName = command.slice(1).toLowerCase();
  } else if (cmdMode === getMode() || getUser() === null) {
    commandName = command.toLowerCase();
  }

  return {
    command: getCommand(commandName),
    commandName: commandName,
  };
}

function enterKeyHandler() {
  const commandObj = commandHelper;
  const commands = validCommands;
  const user = getUser();
  const inputText = getInputText();
  let phrases;
  keyPressed = true;

  if (!commandObj.keysBlocked) {
    if (commandObj.command !== null) {
      phrases = trimSpace(inputText).split(' ');

      // TODO Hard coded
      if (phrases[0] === 'exit' || phrases[0] === 'abort') {
        if (commands[commandObj.command].abortFunc) {
          commands[commandObj.command].abortFunc();
        }

        resetCommand(true);
      } else {
        if (!commandHelper.hideInput) {
          queueMessage({
            text: [inputText],
          });
        }

        commands[commandObj.command].steps[commandObj.onStep](phrases, socket);
      }
    } else {
      phrases = trimSpace(inputText).split(' ');

      if (phrases[0].length > 0) {
        const command = retrieveCommand(phrases[0]);

        if (command.command && (isNaN(command.command.accessLevel) || getAccessLevel() >= command.command.accessLevel)) {
          // Store the command for usage with up/down arrows
          pushCommandHistory(phrases.join(' '));

          /**
           * Print the help and instruction parts of the command
           */
          if (phrases[1] === '-help') {
            printHelpMessage(command.command);
          } else {
            if (command.command.steps) {
              commandObj.command = command.commandName;
              commandObj.maxSteps = command.command.steps.length;
            }

            if (command.command.clearBeforeUse) {
              validCommands.clear.func();
            }

            queueCommand(command.command.func, combineSequences(command.commandName, phrases), printUsedCommand(command.command.clearAfterUse, inputText));
            startCommandQueue();
          }
          /**
           * User is logged in and in chat mode
           */
        } else if (user !== null && chatMode === getMode() && phrases[0].length > 0) {
          if (commandChars.indexOf(phrases[0].charAt(0)) < 0) {
            queueCommand(commands.msg.func, phrases);
            startCommandQueue();

            /**
             * User input commandChar but didn't write
             * a proper command
             */
          } else {
            queueMessage({
              text: [phrases[0] + ': ' + commmandFailText.text],
            });
          }
        } else if (user === null) {
          queueMessage({ text: [phrases.toString()] });
          queueMessage({
            text: [
              'You must register a new user or login with an existing user to gain access to more commands',
              'Use command register or login',
              'example: register myname',
              'or login myname',
            ],
            text_se: [
              'Ni måste registrera en ny användare eller logga in med en existerande användare för att få tillgång till fler kommandon',
              'Använd kommando register eller login',
              'Exempel: register myname',
              'eller login myname',
            ],
          });

          /**
           * Sent command was not found.
           * Print the failed input
           */
        } else if (command.commandName.length > 0) {
          queueMessage({
            text: ['- ' + phrases[0] + ': ' + commmandFailText.text],
          });
        }
      } else {
        queueMessage(printUsedCommand(false, ' '));
      }
    }
  }

  resetPreviousCommandPointer();
  clearInput();
  clearModeText();
}

function specialKeyPress(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;
  const commandHistory = getCommandHistory();

  if (!keyPressed) {
    switch (keyCode) {
    // Backspace
    case 8:
      if (getInputText().length <= 1) {
        clearModeText();
      } else {
        changeModeText();
      }

      break;

    // Tab
    case 9:
      const phrases = getInputText().split(' ');

      keyPressed = true;

      if (!commandHelper.keysBlocked && commandHelper.command === null && phrases.length === 1) {
        autoCompleteCommand();
        changeModeText();
      } else if (commandHelper.allowAutoComplete || phrases.length === 2) {
        const command = validCommands[commandHelper.command] || retrieveCommand(phrases[0]).command;
        const partial = commandHelper.command ? phrases[0] : phrases[1];

        if (command && command.autocomplete) {
          switch (command.autocomplete.type) {
          case 'users':
            socket.emit('matchPartialUser', { partialName: partial });

            break;
          case 'rooms':
            socket.emit('matchPartialRoom', { partialName: partial });

            break;
          default:
            break;
          }
        }
      }

      event.preventDefault();

      break;
    // Enter
    case 13:
      enterKeyHandler();

      event.preventDefault();

      break;
    // Ctrl
    case 17:
      triggerKeysPressed.ctrl = true;

      break;
    // Alt
    case 18:
      triggerKeysPressed.alt = true;

      break;
    // Delete
    case 46:
      if (getInputText().length === 0) {
        clearModeText();
      } else {
        changeModeText();
      }

      event.preventDefault();

      break;
    // Page up
    case 33:
      window.scrollBy(0, -window.innerHeight);

      event.preventDefault();

      break;
    // Page down
    case 34:
      window.scrollBy(0, window.innerHeight);

      event.preventDefault();

      break;
    // Up arrow
    case 38:
      keyPressed = true;

      if (triggerKeysPressed.ctrl) {
        window.scrollBy(0, -window.innerHeight);
      } else {
        if (!commandHelper.keysBlocked && commandHelper.command === null) {
          if (previousCommandPointer > 0) {
            clearInput();
            previousCommandPointer--;
            setCommandInput(commandHistory[previousCommandPointer]);
          }
        }
      }

      event.preventDefault();

      break;
    // Down arrow
    case 40:
      keyPressed = true;

      if (triggerKeysPressed.ctrl) {
        window.scrollBy(0, window.innerHeight);
      } else {
        if (!commandHelper.keysBlocked && commandHelper.command === null) {
          if (previousCommandPointer < commandHistory.length - 1) {
            clearInput();
            previousCommandPointer++;
            setCommandInput(commandHistory[previousCommandPointer]);
          } else if (previousCommandPointer === commandHistory.length - 1) {
            clearInput();
            previousCommandPointer++;
          } else {
            clearInput();
          }
        }
      }

      event.preventDefault();

      break;
    default:
      break;
    }
  } else {
    event.preventDefault();
  }
}

function keyPress(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;
  const textChar = String.fromCharCode(keyCode);

  if (!keyPressed) {
    switch (keyCode) {
    default:
      if (textChar) {
        changeModeText();
      }

      if (triggerAutoComplete(getInputText(), textChar) && commandHelper.command === null) {
        autoCompleteCommand();
        // Prevent new whitespace to be printed
        event.preventDefault();
      }

      break;
    }
  }
}

function attachMenuListener(menuItem, func, funcParam) {
  if (func) {
    menuItem.addEventListener('click', function menuListener(event) {
      func([funcParam]);
      clicked = true;
      commandInput.focus();
      event.stopPropagation();
    });
  }
}

function createMenuItem(menuItem) {
  const listItem = document.createElement('li');
  const span = document.createElement('span');

  if (menuItem.extraClass) {
    span.classList.add(menuItem.extraClass);
  }

  listItem.classList.add('link');
  span.appendChild(document.createTextNode(menuItem.itemName));
  listItem.appendChild(span);

  return listItem;
}

function populateMenu() {
  const menuItems = {
    runCommand: {
      itemName: 'EXEC',
      extraClass: 'menuButton',
      func: enterKeyHandler,
    },
    commands: {
      itemName: 'CMDS',
      func: validCommands.help.func,
    },
    users: {
      itemName: 'USERS',
      func: validCommands.list.func,
      funcParam: 'users',
    },
    rooms: {
      itemName: 'ROOMS',
      func: validCommands.list.func,
      funcParam: 'rooms',
    },
  };

  const menuList = document.getElementById('menuList');
  const menuItemsKeys = Object.keys(menuItems);

  for (let i = 0; i < menuItemsKeys.length; i++) {
    const key = menuItemsKeys[i];
    const menuItem = menuItems[key];
    const listItem = createMenuItem(menuItem);

    attachMenuListener(listItem, menuItem.func, menuItem.funcParam);
    menuList.appendChild(listItem);
  }
}

function createCommandStart(commandName) {
  return [
    createLine(lineLength),
    ' ' + commandName.toUpperCase(),
    createLine(lineLength),
  ];
}

function createCommandEnd() {
  return createLine(lineLength);
}

function printWelcomeMessage() {
  const organicaLogo = copyMessage(storedMessages.organica);
  const razorLogo = copyMessage(storedMessages.razor);

  queueMessage(organicaLogo);
  queueMessage({
    text: [
      'Welcome, employee ' + getUser(),
      'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
      'Learn this valuable skill to increase your productivity!',
      'May you have a productive day',
    ],
    text_se: [
      'Välkommen, uppdragstagare ' + getUser(),
      'Visste ni att ni kan autoifylla kommandon genom att trycka på tab-knappen eller skriva min två mellanslag i rad?',
      'Lär dig denna värdefulla teknik för att öka din produktivitet!',
      'Ha en produktiv dag',
    ],
  });
  queueMessage({
    text: [
      '## This terminal has been cracked by your friendly Razor team. Enjoy! ##',
    ],
    text_se: [
      '## Denna terminal låstes upp av er vänliga Razor-grupp. Ha så kul! ##',
    ],
  });
  queueMessage(razorLogo);
}

function printStartMessage() {
  const organicaLogo = copyMessage(storedMessages.organica);
  const randomRelay = createRandString(randomString, 4, true);

  queueMessage(organicaLogo);
  queueMessage({
    text: [
      createLine(lineLength),
      'Connecting... Could not establish connection to HQ',
      'Rerouting... Secondary relay ' + randomRelay + ' found',
      'Connecting to relay ' + randomRelay + '... Connection established',
      createLine(lineLength),
    ],
    text_se: [
      createLine(lineLength),
      'Ansluter... Kunde inte etablera en anslutning mot HQ',
      'Omdirigerar... Sekundär relä ' + randomRelay + ' funnen',
      'Ansluter till relä ' + randomRelay + '... Anslutning etablerad',
      createLine(lineLength),
    ],
    extraClass: 'upperCase',
  });
  queueMessage({
    text: [
      'Welcome to the Oracle of Organica',
      'Please login to start your productive day!',
      'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
      'You can also use it to show all available commands!',
      'Learn this valuable skill to increase your productivity!',
    ],
    text_se: [
      'Välkommen till Oraklet av Organica',
      'Var vänlig och logga in för att starta in produktiva dag!',
      'Visste ni att ni kan autoifylla kommandon genom att trycka på tab-knappen eller skriva in två mellanslag i rad?',
      'Lär dig denna värdefulla teknik för att öka din produktivtet!',
      'Ha en bra och produktiv dag',
    ],
  });
}

function resetAllLocalVals() {
  removeCommandHistory();
  removeRoom();
  removeUser();
  setAccessLevel(0);
  setInputStart(defaultInputStart);
  previousCommandPointer = 0;
}

function hideMessageProperties(message = { }) {
  const roomName = message.roomName;

  // TODO Change blank user and room to booleans instead of string removal
  if (message.extraClass === 'importantMsg') {
    message.roomName = '';
    message.userName = '';
    message.skipTime = true;
  } else if (message.extraClass === 'broadcastMsg') {
    message.roomName = '';
    message.userName = '';
  }

  if (roomName && roomName !== null) {
    const whisperIndex = roomName.indexOf('-whisper');

    if (whisperIndex >= 0) {
      if (message.userName === getUser()) {
        message.roomName = roomName.substring(0, whisperIndex);
      } else {
        message.roomName = 'whisper';
      }
    } else if (roomName.indexOf('-device') >= 0) {
      message.roomName = 'device';
    }
  }

  return message;
}

function appendLanguageString(varName) {
  return getDefaultLanguage() ? varName + '_' + getDefaultLanguage() : varName;
}

function prependBroadcastMessage(data = {}) {
  const title = {};

  if (data.sender) {
    title.text = 'broadcast from: ' + data.sender;
    title.text_se = 'allmänt meddelande från: ' + data.sender;
  } else {
    title.text = 'broadcast';
    title.text_se = 'allmänt meddelande';
  }

  return createCommandStart(title[appendLanguageString('text')]);
}

function addMessageSpecialProperties(message = {}) {
  if (message.extraClass === 'broadcastMsg') {
    message.text = prependBroadcastMessage({ sender: message.customSender }).concat(message.text);
    message.text.push(createLine(lineLength));
  }

  return message;
}

function onMessage(data = { message: {} }) {
  const message = addMessageSpecialProperties(hideMessageProperties(data.message));

  queueMessage(message);
}

function onMessages(data = { messages: [] }) {
  const messages = data.messages;

  for (let i = 0; i < messages.length; i++) {
    const message = addMessageSpecialProperties(hideMessageProperties(messages[i]));

    queueMessage(message);
  }
}

function onImportantMsg(data = {}) {
  const message = data.message;

  if (message) {
    message.extraClass = 'importantMsg';
    message.skipTime = true;

    queueMessage(message);

    if (message.morse) {
      validCommands.morse.func(message.text.slice(0, 1), message.morse.local);
    }
  }
}

/*
 * Triggers when the connection is lost and then re-established
 */
function onReconnect() {
  reconnect();
}

function onDisconnect() {
  queueMessage({
    text: ['Lost connection'],
    text_se: ['Förlorat anslutningen'],
    extraClass: 'importantMsg',
  });
}

function onFollow(data = { room: {} }) {
  const room = data.room;

  if (room.entered) {
    enterRoom(room.roomName);
  } else {
    queueMessage({
      text: ['Following ' + room.roomName],
      text_se: ['Följer ' + room.roomName],
    });
  }
}

function onUnfollow(data = { room: { roomName: '' } }) {
  const room = data.room;

  queueMessage({
    text: ['Stopped following ' + room.roomName],
    text_se: ['Slutade följa ' + room.roomName],
  });

  if (room.exited) {
    socket.emit('follow', {
      room: {
        roomName: 'public',
        entered: true,
      },
    });
  }
}

function onLogin(data = {}) {
  const user = data.user;
  const mode = user.mode ? user.mode : cmdMode;

  validCommands.clear.func();
  setUser(user.userName);
  setAccessLevel(user.accessLevel);
  queueMessage({
    text: ['Successfully logged in as ' + user.userName],
    text_se: ['Lyckades logga in som ' + user.userName],
  });
  printWelcomeMessage();
  validCommands.mode.func([mode]);

  socket.emit('updateDeviceSocketId', {
    device: {
      deviceId: getDeviceId(),
    },
    user: {
      socketId: socket.id,
      userName: getUser(),
    },
  });
  socket.emit('follow', {
    room: {
      roomName: 'public',
      entered: true,
    },
  });
}

function onCommandSuccess(data = {}) {
  if (!data.noStepCall) {
    if (!data.freezeStep) {
      commandHelper.onStep++;
    }

    validCommands[commandHelper.command].steps[commandHelper.onStep](data, socket);
  } else {
    resetCommand(false);
  }
}

function onCommandFail() {
  if (commandHelper.command !== null) {
    const abortFunc = validCommands[commandHelper.command].abortFunc;

    if (abortFunc) {
      abortFunc();
    }

    resetCommand(true);
  }
}

function onReconnectSuccess(data) {
  if (!data.anonUser) {
    const mode = data.user.mode ? data.user.mode : cmdMode;
    const room = getRoom();

    validCommands.mode.func([mode], false);
    setAccessLevel(data.user.accessLevel);

    if (!data.firstConnection) {
      queueMessage({
        text: ['Re-established connection'],
        text_se: ['Lyckades återansluta'],
        extraClass: 'importantMsg',
      });
    } else {
      printWelcomeMessage();

      if (room) {
        validCommands.room.func([room]);
      }
    }

    queueMessage({
      text: ['Retrieving missed messages (if any)'],
      text_se: ['Hämtar missade meddelanden (om det finns några)'],
    });

    socket.emit('updateDeviceSocketId', {
      device: {
        deviceId: getDeviceId(),
      },
      user: {
        socketId: socket.id,
        userName: getUser(),
      },
    });
  } else {
    if (!data.firstConnection) {
      queueMessage({
        text: ['Re-established connection'],
        text_se: ['Lyckades återansluta'],
        extraClass: 'importantMsg',
      });
    }
  }

  reconnecting = false;
}

function onDisconnectUser() {
  const currentUser = getUser();

  // There is no saved local user. We don't need to print this
  if (currentUser && currentUser !== null) {
    queueMessage({
      text: [
        'Didn\'t find user ' + currentUser + ' in database',
        'Resetting local configuration',
      ],
      text_se: [
        'Kunde inte hitta användaren ' + currentUser + ' i databasen',
        'Återställer lokala konfigurationen',
      ],
    });
  }

  resetAllLocalVals();
}

function onMorse(data = {}) {
  playMorse(data.morseCode);
}

function onTime(data = {}) {
  queueMessage({
    text: ['Time: ' + generateTimeStamp(data.time, true, true)],
    text_en: ['Tid: ' + generateTimeStamp(data.time, true, true)],
  });
}

function onLocationMsg(locationData) {
  // TODO Change from Object.keys for compatibility with older Android
  const locationKeys = Object.keys(locationData);

  for (let i = 0; i < locationKeys.length; i++) {
    let text = '';
    const user = locationKeys[i];
    const userLocation = locationData[user];
    const latitude = userLocation.latitude.toFixed(6);
    const longitude = userLocation.longitude.toFixed(6);
    const heading = userLocation.heading !== null ? Math.round(userLocation.heading) : null;
    const accuracy = userLocation.accuracy < 1000 ? Math.ceil(userLocation.accuracy) : 'BAD';
    const mapLocation = locateOnMap(latitude, longitude);

    text += 'User: ' + user + '\t';
    text += 'Time: ' + generateTimeStamp(userLocation.timestamp, true) + '\t';
    text += 'Location: ' + mapLocation + '\t';

    if (mapLocation !== '---') {
      text += 'Accuracy: ' + accuracy + ' meters\t';
      text += 'Coordinates: ' + latitude + ', ' + longitude + '\t';

      if (heading !== null) {
        text += 'Heading: ' + heading + ' deg.';
      }
    }

    queueMessage({ text: [text] });
  }
}

function onBan() {
  queueMessage({
    text: [
      'You have been banned from the system',
      'Contact your nearest Organica IT Support ' +
      'Center for re-education',
      '## or your nearest friendly Razor member. ' +
      'Bring a huge bribe ##',
    ],
    text_se: [
      'Ni har blivit bannade från systemet',
      'Kontakta ert närmaste Organica IT-supportcenter för omskolning',
      '## eller er närmaste vänliga Razor-medlem. Ta med en stor mängd mutor ##',
    ],
    extraClass: 'importantMsg',
  });
  resetAllLocalVals();
}

function onLogout() {
  validCommands.clear.func();
  resetAllLocalVals();
  socket.emit('followPublic');
  printStartMessage();
}

function onUpdateCommands(data = { commands: [] }) {
  const commands = data.commands;

  for (let i = 0; i < commands.length; i++) {
    const newCommand = commands[i];
    const oldCommand = validCommands[newCommand.commandName];

    if (oldCommand) {
      oldCommand.accessLevel = newCommand.accessLevel;
      oldCommand.category = newCommand.category;
      oldCommand.visibility = newCommand.visibility;
      oldCommand.authGroup = newCommand.authGroup;
    }
  }
}

function onWeather(report) {
  const weather = [];
  let weatherString = '';

  for (let i = 0; i < report.length; i++) {
    const weatherInstance = report[i];
    const time = new Date(weatherInstance.time);
    const hours = beautifyNumb(time.getHours());
    const day = beautifyNumb(time.getDate());
    const month = beautifyNumb(time.getMonth() + 1);
    const temperature = Math.round(weatherInstance.temperature);
    const windSpeed = Math.round(weatherInstance.gust);
    const precipitation = weatherInstance.precipitation === 0 ? 'Light ' : weatherInstance.precipitation + 'mm ';
    let coverage;
    let precipType;
    weatherString = '';

    switch (weatherInstance.precipType) {
    // None
    case 0:
      break;
    // Snow
    case 1:
      precipType = 'snow';
      break;
    // Snow + rain
    case 2:
      precipType = 'snow and rain';
      break;
    // Rain
    case 3:
      precipType = 'acid rain';
      break;
    // Drizzle
    case 4:
      precipType = 'drizzle';
      break;
    // Freezing rain
    case 5:
      precipType = 'freezing rain';
      break;
    // Freezing drizzle
    case 6:
      precipType = 'freezing drizzle';
      break;
    default:
      break;
    }

    switch (weatherInstance.cloud) {
    case 0:
    case 1:
    case 2:
    case 3:
      coverage = 'Light';

      break;
    case 4:
    case 5:
    case 6:
      coverage = 'Moderate';

      break;
    case 7:
    case 8:
    case 9:
      coverage = 'High';

      break;
    default:
      break;
    }

    weatherString += day + '/' + month + ' ' + hours + ':00' + '\t';
    weatherString += 'Temperature: ' + temperature + '\xB0C\t';
    weatherString += 'Visibility: ' + weatherInstance.visibility + 'km \t';
    weatherString += 'Wind direction: ' + weatherInstance.windDirection + '\xB0\t';
    weatherString += 'Wind speed: ' + windSpeed + 'm/s\t';
    weatherString += 'Blowout risk: ' + weatherInstance.thunder + '%\t';
    weatherString += 'Pollution coverage: ' + coverage + '\t';

    if (precipType) {
      weatherString += precipitation;
      weatherString += precipType;
    }

    weather.push(weatherString);
  }

  queueMessage({ text: weather });
}

function onUpdateDeviceId(newId) {
  setDeviceId(newId);
}

function onWhoami(data) {
  const team = data.user.team || '';
  const text = createCommandStart('whoami').concat([
    'User: ' + data.user.userName,
    'Access level: ' + data.user.accessLevel,
    'Team: ' + team,
    'Device ID: ' + getDeviceId(),
    createCommandEnd('whoami'),
  ]);

  queueMessage({ text: text });
}

function onList(data = { itemList: [] }) {
  const itemList = data.itemList.itemList;
  const title = data.itemList.listTitle;

  if (title) {
    onMessage({ message: { text: createCommandStart(title) } });
  }

  onMessage({
    message: {
      text: itemList,
      linkable: data.itemList.linkable || true,
      keepInput: data.itemList.keepInput || true,
      replacePhrase: data.itemList.replacePhrase || false,
    },
  });
}

function onMatchFound(data = { matchedName: '', defaultLanguage: '' }) {
  replaceLastInputPhrase(data.matchedName + ' ');
}

function onStartup(data = { storedMessages: {} }) {
  const keys = Object.keys(data.storedMessages);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    storedMessages[key] = data.storedMessages[key];
  }

  setLocalVal('storedMessages', JSON.stringify(storedMessages));
  setLocalVal('defaultLanguage', data.defaultLanguage);
  printStartMessage();
}

// function onMissions(data = []) {
  // for (let i = 0; i < data.length; i++) {
  //
  // }
// }

function startSocket() {
  if (socket) {
    socket.on('message', onMessage);
    socket.on('messages', onMessages);
    socket.on('importantMsg', onImportantMsg);
    socket.on('reconnect', onReconnect);
    socket.on('disconnect', onDisconnect);
    socket.on('follow', onFollow);
    socket.on('unfollow', onUnfollow);
    socket.on('login', onLogin);
    socket.on('commandSuccess', onCommandSuccess);
    socket.on('commandFail', onCommandFail);
    socket.on('reconnectSuccess', onReconnectSuccess);
    socket.on('disconnectUser', onDisconnectUser);
    socket.on('morse', onMorse);
    socket.on('time', onTime);
    socket.on('locationMsg', onLocationMsg);
    socket.on('ban', onBan);
    socket.on('logout', onLogout);
    socket.on('updateCommands', onUpdateCommands);
    socket.on('weather', onWeather);
    socket.on('updateDeviceId', onUpdateDeviceId);
    socket.on('whoAmI', onWhoami);
    socket.on('list', onList);
    socket.on('matchFound', onMatchFound);
    socket.on('startup', onStartup);
    // socket.on('missions', onMissions);
  }
}

function keyReleased(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;

  switch (keyCode) {
  // Ctrl
  case 17:
    triggerKeysPressed.ctrl = false;

    break;
  // Alt
  case 18:
    triggerKeysPressed.alt = false;

    break;
  default:
    keyPressed = false;

    break;
  }
}

function isFullscreen() {
  return (!window.screenTop && !window.screenY);
}

/**
 * Goes into full screen with sent element
 * This is not supported in iOS Safari
 * @param {object} element - The element which should be maximized to full screen
 * @returns {undefined} Returns nothing
 */
function goFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

function fullscreenResize(keyboardShown) {
  /**
   * Used for Android when it shows/hides the keyboard
   * The soft keyboard will block part of the site without this fix
   */
  if (isFullscreen() && navigator.userAgent.match(/Android/i)) {
    background.classList.add('fullscreen');

    if (keyboardShown) {
      spacer.classList.add('keyboardFix');
      spacer.classList.remove('fullFix');
    } else {
      spacer.classList.remove('keyboardFix');
      spacer.classList.add('fullFix');
    }

    scrollView();
  }
}

function generateDeviceId() {
  const randomLength = randomString.length;
  let deviceId = '';

  for (let i = 0; i < 15; i++) {
    const randomVal = Math.random() * (randomLength - 1);
    deviceId += randomString[Math.round(randomVal)];
  }

  return deviceId;
}

/*
 * Removes some visual effects for better performance on older devices
 */
function downgradeOlderDevices() {
  if (/iP(hone|ad|od)\sOS\s[0-7]/.test(navigator.userAgent) || oldAndroid || /Vita/.test(navigator.userAgent)) {
    document.getElementById('overlay').className = '';
    document.getElementById('background').className = '';
  }
}

function isOldAndroid() {
  return /Android\s[0-3]/.test(navigator.userAgent);
}

function isTouchDevice() {
  return ((/iP(hone|ad|od)/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)));
}

function attachCommands() {
  validCommands.help = {
    func: function helpCommand(phrases) {
      function getCommands() {
        const commands = [];
        // TODO Change from Object.keys for compatibility with older Android
        const keys = Object.keys(validCommands);
        let command;
        let commandAccessLevel;

        for (let i = 0; i < keys.length; i++) {
          command = validCommands[keys[i]];
          commandAccessLevel = command.accessLevel;

          if (isNaN(commandAccessLevel) || commandAccessLevel <= getAccessLevel()) {
            commands.push(keys[i]);
          }
        }

        return commands.concat(Object.keys(getAliases())).sort();
      }

      function getAll() {
        const allCommands = getCommands();

        if (getUser() === null) {
          queueMessage({
            text: [
              createLine(lineLength),
              ' Use register to register a new user',
              ' Use login to log in to an existing user',
              ' You have to log in to access most of the system',
              createLine(lineLength),
            ],
            text_se: [
              createLine(lineLength),
              ' Använd register för att registrera en ny användare',
              ' Använd login för att logga in som en existerande användare',
              ' Ni måste logga in för att få tillgång till majoriteten av systemet',
              createLine(lineLength),
            ],
          });
        }

        queueMessage({
          text: allCommands,
          linkable: true,
        });
      }

      if (undefined === phrases || phrases.length === 0) {
        queueMessage({
          text: createCommandStart('help').concat([
            'Instructions',
            '  Add -help after a command to get instructions on how to use it. Example: uploadkey -help',
            'Shortcuts',
            '  Use page up/down to scroll the view',
            '  Press arrow up/down to go through your previous used commands',
            '  Pressing tab or space twice will auto-complete any command you have begun writing.',
            '  Example: "he" and a tab / double space will automatically turn into "help"',
          ]),
          text_se: createCommandStart('help').concat([
            'Instruktioner',
            '  Lägg till -help efter ett kommando för att få instruktioner på hur det kan användas. Exempel: uploadkey -help',
            'Genvägar',
            '  Använd page up/down för att skrolla vyn',
            '  Använd pil upp/ner för att gå igenom tidigare använda kommandon',
            '  Tryck på tab-knappen eller två mellanslag i rad för att autoifylla kommandon som ni har börjat skriva',
            '  Exempel: "he" och en tabbning / två mellanslag i rad kommer automatiskt ändra det till "help"',
          ]),
        });
      }

      getAll();
    },
    help: [
      'Shows a list of available commands',
    ],
    help_se: [
      'Visa en lista av tillgängliga kommandon',
    ],
    instructions: [
      ' Usage:',
      '  help',
      ' Example:',
      '  help',
    ],
    instructions_se: [
      ' Användning:',
      '  help',
      ' Exempel:',
      '  help',
    ],
    accessLevel: 1,
    category: 'basic',
  };
  validCommands.clear = {
    func: function clearCommand() {
      while (mainFeed.childNodes.length > 1) {
        mainFeed.removeChild(mainFeed.lastChild);
      }
    },
    help: ['Clears the terminal view'],
    help_se: ['Rensar terminalvyn'],
    clearAfterUse: true,
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.whoami = {
    func: function whoamiCommand() {
      socket.emit('whoAmI');
    },
    help: ['Shows information about the current user'],
    help_se: ['Visar information om nuvarande användaren'],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.msg = {
    func: function msgCommand(phrases) {
      let writtenMsg;

      if (phrases && phrases.length > 0) {
        writtenMsg = phrases.join(' ');

        socket.emit('chatMsg', {
          message: {
            text: [writtenMsg],
            userName: getUser(),
            roomName: getRoom(),
          },
        });
      } else {
        queueMessage({
          text: ['You forgot to write the message!'],
          text_se: ['Ni glömde skriva in ett meddelande!'],
        });
      }
    },
    help: [
      'Sends a message to your current room',
      'The room you are in is written out to the left of the marker',
    ],
    help_se: [
      'Skickar ett meddelande till ert nuvarande rum',
      'Rummet ni är inne i står skrivet längst ner till vänster om markören',
    ],
    instructions: [
      ' Usage:',
      '  msg *message',
      ' Example:',
      ' msg Hello!',
    ],
    instructions_se: [
      ' Användning:',
      '  msg *meddelande*',
      ' Exempel:',
      '  msg Hej!',
    ],
    clearAfterUse: true,
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.broadcast = {
    func: function broadcastCommand() {
      commandHelper.data = {
        message: {
          text: [],
          title: [],
          hideName: true,
        },
      };

      queueMessage({
        text: [
          'Who is the broadcast from?',
          'You can also leave it empty and just press enter',
        ],
        text_se: [
          'Vem är detta meddelande från?',
          'Ni kan också lämna det tomt och trycka på enter-knappen',
        ],
      });
      queueMessage(copyMessage(abortInfo));
      setInputStart('broadcast');
    },
    steps: [
      function broadcastStepOne(phrases) {
        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');
          commandHelper.data.message.customSender = phrase;
        }

        queueMessage({
          text: [
            'Write a line and press enter',
            'Press enter without any input when you are completely done with the message',
          ],
          text_se: [
            'Skriv en rad och tryck på enter-knappen',
            'Tryck på enter-knappen utan något i inmatningsfältet när ni är helt klara med meddelandet',
          ],
        });
        commandHelper.onStep++;
      },
      function broadcastStepTwo(phrases) {
        const message = commandHelper.data.message;
        let dataText;

        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');

          message.text.push(phrase);
        } else {
          dataText = copyString(message.text);
          commandHelper.onStep++;

          queueMessage({
            text: ['Preview of the message:'],
            text_se: ['Förhandsgranskning av meddelandet'],
          });
          queueMessage({ text: prependBroadcastMessage({ sender: message.customSender }).concat(dataText, createLine(lineLength)) });
          queueMessage({
            text: ['Is this OK? "yes" to accept the message'],
            text_se: ['Är detta meddelande OK? Skriv "yes" för att acceptera meddelandet'],
          });
        }
      },
      function broadcastStepThree(phrases) {
        if (phrases.length > 0 && phrases[0].toLowerCase() === 'yes') {
          socket.emit('broadcastMsg', commandHelper.data);
          resetCommand();
        } else {
          resetCommand(true);
        }
      },
    ],
    help: [
      'Sends a message to all users in all rooms',
      'It will prepend the message with "[ALL]"',
    ],
    help_se: [
      'Skicka ett meddelande till alla användare i alla rum',
      '"[ALL"] kommer att läggas till i början av meddelandet',
    ],
    instructions: [
      'Follow the on-screen instructions',
    ],
    instructions_se: [
      'Följ instruktionerna som ges',
    ],
    accessLevel: 13,
    clearAfterUse: true,
    category: 'admin',
  };
  validCommands.follow = {
    func: function followCommand(phrases) {
      if (phrases.length > 0) {
        const room = {
          roomName: phrases[0].toLowerCase(),
        };

        commandHelper.data = { room: room };
        commandHelper.hideInput = true;
        hideInput(true);

        queueMessage({
          text: ['Enter the password for the room. Leave empty and press enter if the room is not protected'],
          text_se: ['Skriv in rummets lösenord. Lämna det tomt och tryck på enter-knappen om rummet inte är skyddat'],
        });
        setInputStart('password');
      } else {
        queueMessage({
          text: ['You have to specify which room to follow'],
          text_se: ['Ni måste specificera vilket rum ni vill följa'],
        });
        resetCommand(false);
      }
    },
    steps: [
      function followStepOne(phrases) {
        if (phrases.length > 0) {
          commandHelper.data.room.password = phrases[0];
        }

        socket.emit('follow', { room: commandHelper.data.room });
      },
    ],
    help: [
      'Follows a room and shows you all messages posted in it.',
      'You will get the messages from this room even if it isn\'t your currently selected one',
    ],
    help_se: [
      'Följer ett rum och visar alla meddelande som skrivs i det',
      'Ni kommer att få alla meddelande som skickas i detta rum även om ni har ett annat valt som ert nuvarande rum',
    ],
    instructions: [
      ' Usage:',
      '  follow *room name*',
      ' Example:',
      '  follow room1',
    ],
    instructions_se: [
      ' Användning:',
      '  follow *rumsnamn*',
      ' Exempel:',
      '  follow rum1',
      '  follow rum2',
    ],
    autocomplete: { type: 'rooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.unfollow = {
    func: function unfollowCommand(phrases) {
      if (phrases.length > 0) {
        const room = {
          roomName: phrases[0].toLowerCase(),
        };

        if (room.roomName === getRoom()) {
          room.exited = true;
        }

        socket.emit('unfollow', { room: room });
      } else {
        queueMessage({
          text: ['You have to specify which room to unfollow'],
          text_se: ['Ni måste specificera vilket rum ni vill sluta följa'],
        });
      }
    },
    help: ['Stops following a room.'],
    help_se: ['Slutar följa ett rum'],
    instructions: [
      ' Usage:',
      '  unfollow *room name*',
      ' Example:',
      '  unfollow room1',
    ],
    instructions_se: [
      ' Användning:',
      '  unfollow *rumsnamn*',
      ' Exempel:',
      '  unfollow rum1',
    ],
    autocomplete: { type: 'myRooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.list = {
    func: function listCommand(phrases = []) {
      if (phrases.length > 0) {
        const listOption = phrases[0].toLowerCase();

        if (listOption === 'rooms') {
          socket.emit('listRooms');
        } else if (listOption === 'users') {
          socket.emit('listUsers');
        } else if (listOption === 'devices') {
          socket.emit('listDevices');
        } else {
          queueMessage({
            text: [listOption + ' is not a valid type'],
            text_se: [listOption + ' är inte en giltig typ'],
          });
        }
      } else {
        queueMessage({
          text: [
            'You have to input which type you want to list',
            'Available types: users, rooms, devices',
            'Example: list rooms',
          ],
          text_se: [
            'Ni måste skriva in vilken typ ni vill lista',
            'Tillgängliga typer: users, rooms, devices',
            'Exempel: list rooms',
          ],
        });
      }
    },
    help: [
      'Shows a list of users, rooms or devices which you are allowed to see',
      'You have to input which option you want to list',
    ],
    help_se: [
      'Visar en list över användare, rum eller enheter som ni har tillåtelse att se',
      'Ni måste skriva in vilken typ ni vill lista',
    ],
    instructions: [
      ' Usage:',
      '  list *type*',
      ' Example',
      '  list rooms',
      '  list users',
      '  list devices',
    ],
    instructions_se: [
      ' Användning:',
      '  list *typ*',
      ' Exempel',
      '  list rooms',
      '  list users',
      '  list devices',
    ],
    autocomplete: { type: 'lists' },
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.mode = {
    func: function modeCommand(phrases, verbose) {
      let commandString;

      if (phrases.length > 0) {
        const newMode = phrases[0].toLowerCase();

        // TODO Refactoring. Lots of duplicate code
        if (chatMode === newMode) {
          setMode(newMode);

          if (verbose === undefined || verbose) {
            commandString = 'Chat mode activated';

            queueMessage({
              text: createCommandStart(commandString).concat([
                'Prepend commands with ' + commandChars.join('" or "') + ', example: "' + commandChars[0] + 'mode"',
                'Everything else written and sent will be intepreted as a chat message',
                'You will no longer need to use msg command to write chat messages',
                createCommandEnd(commandString.length),
              ]),
              text_se: createCommandStart(commandString).concat([
                'Lägg till ' + commandChars.join('" eller "') + ' i början av varje kommando, exempel: "' + commandChars[0] + 'mode"',
                'Allt annat ni skriver kommer att tolkas som chatmeddelanden',
                'Ni kommer inte längre behöva använda msg-kommandot för att skriva chatmeddelanden',
                createCommandEnd(commandString.length),
              ]),
            });
          }

          socket.emit('updateMode', { mode: newMode });
        } else if (cmdMode === newMode) {
          setMode(newMode);

          if (verbose === undefined || verbose) {
            commandString = 'Command mode activated';

            queueMessage({
              text: createCommandStart(commandString).concat([
                'Commands can be used without "' + commandChars[0] + '"',
                'You have to use command "msg" to send messages',
                createCommandEnd(commandString.length),
              ]),
              text_se: createCommandStart(commandString).concat([
                'Kommandon kan användas utan "' + commandChars[0] + '"',
                'Ni måste använda msg-kommandot för att skriva chatmeddelanden',
                createCommandEnd(commandString.length),
              ]),
            });
          }

          socket.emit('updateMode', { mode: newMode });
        } else {
          queueMessage({
            text: [newMode + 'is not a valid mode'],
            text_se: [newMode + ' är inte ett giltigt alternativ'],
          });
        }
      } else {
        queueMessage({
          text: ['Current mode: ' + getMode()],
          text_se: ['Nuvarande läge: ' + getMode()],
        });
      }
    },
    help: [
      'Change the input mode. The options are chat or cmd',
      '--Chat mode--',
      'Everything written will be interpreted as chat messages',
      'All commands have to be prepended with "' + commandChars.join('" or "') + '" Example: ' + commandChars[0] + 'uploadkey',
      '--Cmd mode--',
      'Chat mode is the default mode',
      'Text written will not be automatically be intepreted as chat messages',
      'You have to use "msg" command to write messages Example: msg hello',
      'Commands do not have to be prepended with anything. Example: uploadkey',
    ],
    instructions: [
      ' Usage:',
      '  mode *mode*',
      ' Example:',
      '  mode chat',
      '  mode cmd',
    ],
    instructions_se: [
      ' Användning:',
      '  mode *läge*',
      ' Exempel:',
      '  mode chat',
      '  -mode cmd',
    ],
    autocomplete: { type: 'modes' },
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.register = {
    func: function registerCommand(phrases) {
      const data = {};

      if (getUser() === null) {
        const userName = phrases ? phrases[0] : undefined;

        if (userName && userName.length >= 3 && userName.length <= 6 && isTextAllowed(userName)) {
          data.user = {
            userName: userName,
            registerDevice: getDeviceId(),
          };
          commandHelper.data = data;
          commandHelper.hideInput = true;
          hideInput(true);
          socket.emit('userExists', commandHelper.data);
        } else {
          resetCommand(true);
          queueMessage({
            text: [
              'Name has to be 3 to 6 characters long',
              'The name can only contain letters and numbers (a-z, 0-9)',
              'Don\'t use whitespace in your name!',
              'example: register myname',
            ],
            text_se: [
              'Namnet behöver vara 3 till 6 tecken långt',
              'Namnet får endast innehålla bokstäver och nummer (a-z, 0-9)',
              'Använd inte blanksteg i ert namn!',
              'Exempel: register myname',
            ],
          });
        }
      } else {
        resetCommand(true);
        queueMessage({
          text: [
            'You have already registered a user',
            getUser() + ' is registered and logged in',
          ],
          text_se: [
            'Ni har redan registrerat en användare',
            getUser() + ' är registrerad och inloggad',
          ],
        });
      }
    },
    steps: [
      function registerStepOne() {
        queueMessage({
          text: [
            'Input a password and press enter',
            'Your password won\'t appear on the screen as you type it',
            'Don\'t use whitespaces in your password!',
          ],
          text_se: [
            'Skriv in ert lösenord och tryck på enter-knappen',
            'Ert lösenord kommer inte visas på skärmen',
            'Använd inte blanksteg i ert lösenord!',
          ],
        });
        queueMessage(copyMessage(abortInfo));
        setInputStart('password');
        commandHelper.onStep++;
      },
      function registerStepTwo(phrases) {
        const password = phrases ? phrases[0] : undefined;

        if (phrases && password.length >= 3 && isTextAllowed(password)) {
          commandHelper.data.user.password = password;
          queueMessage({
            text: ['Repeat your password one more time'],
            text_se: ['Skriv in ert lösenord en gång till'],
          });
          commandHelper.onStep++;
        } else {
          queueMessage({
            text: [
              'Password is too short!',
              'It has to be at least 3 characters (a-z, 0-9. Password can mix upper/lowercase)',
              'Please, input a password and press enter',
            ],
            text_se: [
              'Lösenordet är för kort!',
              'Det måste vara minst 3 tecken långt (a-z, 0-9. Lösenordet kan ha en blandning av gemener och versaler)',
              'Skriv in ert lösenord och tryck på enter-knappen',
            ],
          });
        }
      },
      function registerStepThree(phrases) {
        const password = phrases ? phrases[0] : undefined;

        if (password === commandHelper.data.user.password) {
          queueMessage({
            text: [
              'Congratulations, employee #' + Math.floor(Math.random() * 120503),
              'Welcome to the Organica Oracle department',
            ],
            text_se: [
              'Gratulerar, uppdragstagare #' + Math.floor(Math.random() * 120503),
              'Välkommen till Organica Orakelavdelningen',
            ],
          });
          socket.emit('register', commandHelper.data);
          validCommands[commandHelper.command].abortFunc();
          resetCommand(false);
        } else {
          queueMessage({
            text: [
              'Passwords don\'t match. Please try again',
              'Input a password and press enter',
            ],
            text_se: [
              'Lösenorden matchar inte. Försök igen',
              'Skriv in ert lösenord och tryck på enter-knappen',
            ],
          });
          commandHelper.onStep--;
        }
      },
    ],
    abortFunc: function registerAbort() {
      hideInput(false);
    },
    help: [
      'Registers your user name on the server',
      'This user name will be your identity in the system',
      'The name can only contain letters and numbers (a-z, 0-9)',
      'Don\'t use whitespaces in your name or password!',
    ],
    help_se: [
      'Registrerar ert användarnamn på servern',
      'Detta användarnamn kommer vara er identitet i systemet',
      'Namnet kan endast innehålla bokstäver och siffror (a-z, 0-9)',
      'Använd inte blankstegi ert namn eller lösenord!',
    ],
    instructions: [
      ' Usage:',
      '  register *user name*',
      ' Example:',
      '  register myname',
    ],
    instructions_se: [
      ' Användning:',
      '  register *användarnamn*',
      ' Exempel:',
      '  register myname',
    ],
    accessLevel: 0,
    category: 'login',
  };
  validCommands.createroom = {
    func: function createroomCommand(phrases = ['']) {
      const roomName = phrases[0].toLowerCase();

      if (roomName.length > 0 && roomName.length <= 6 && isTextAllowed(roomName)) {
        const data = { room: {} };
        data.room.roomName = roomName;
        data.room.owner = getUser();
        commandHelper.data = data;
        commandHelper.hideInput = true;

        queueMessage({
          text: [
            'Enter a password for the room',
            'Leave it empty if you don\'t want to password protect the room',
          ],
          text_se: [
            'Skriv in ett lösenord för rummet',
            'Ni kan lämna det tomt om ni inte vill skydda rummet med ett lösenord',
          ],
        });
        setInputStart('Set passwd');
        hideInput(true);
      } else {
        resetCommand(true);
        queueMessage({
          text: [
            'Failed to create room',
            'Room name has to be 1 to 6 characters long',
            'The room name can only contain letters and numbers (a-z, 0-9)',
            'Example: createroom myroom',
          ],
          text_se: [
            'Misslyckades att skapa rummet',
            'Rummets namn måste vara 1 till 6 tecken långt',
            'Rummets namn kan endast innehålla bokstäver och siffror (a-z, 0-9)',
            'Exempel: createroom myroom',
          ],
        });
      }
    },
    steps: [
      function createroomStepOne(phrases = ['']) {
        const password = phrases[0];
        commandHelper.onStep++;

        if (password.length > 0) {
          commandHelper.data.room.password = password;

          setInputStart('Repeat passwd');
          queueMessage({
            text: ['Repeat the password'],
            text_se: ['Skriv in lösenordet igen'],
          });
        } else {
          commandHelper.onStep++;
          socket.emit('createRoom', commandHelper.data);
          resetCommand(false);
        }
      },
      function createroomStepTwo(phrases = ['']) {
        const password = phrases[0];

        if (password === commandHelper.data.room.password) {
          socket.emit('createRoom', commandHelper.data);
          resetCommand(false);
        } else {
          commandHelper.onStep--;

          queueMessage({
            text: [
              'Passwords don\'t match. Try again',
              'Enter a password for the room',
              'Leave it empty if you don\'t want password-protect the room',
            ],
            text_se: [
              'Lösenorden matchar inte. Försök igen',
              'Skriv in lösenordet för rummet',
              'Lämna det tomt om ni inte vill skydda rummet med ett lösenord',
            ],
          });
          setInputStart('Set passwd');
        }
      },
    ],
    help: [
      'Creates a chat room',
      'The rooms name has to be 1 to 6 characters long',
      'The password is optional',
      'The name can only contain letters and numbers (a-z, 0-9)',
    ],
    help_se: [
      'Skapar ett chatrum',
      'Rummets namn måste vara 1 till 6 tecken långt',
      'Namnet får endast innehålla bokstäver och siffror (a-z, 0-9)',
    ],
    instructions: [
      ' Usage:',
      '  createroom *room name*',
      ' Example:',
      '  createroom myroom banana',
    ],
    instructions_se: [
      ' Användning:',
      '  createroom *rumsnamn*',
      ' Exempel:',
      '  createroom myroom',
    ],
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.myrooms = {
    func: function myroomsCommand() {
      const data = { user: {}, device: {} };

      data.user.userName = getUser();
      data.device.deviceId = getDeviceId();

      socket.emit('myRooms', data);
    },
    help: ['Shows a list of all rooms you are following'],
    help_se: ['Visar en lista över alla rum som ni följer'],
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.login = {
    func: function loginCommand(phrases) {
      const data = { user: {} };

      if (getUser() !== null) {
        queueMessage({
          text: [
            'You are already logged in',
            'You have to be logged out to log in',
          ],
          text_se: [
            'Ni har redan loggat in',
            'Ni måste vara utloggade för att kunna logga in',
          ],
        });
        resetCommand();
      } else if (phrases.length > 0) {
        data.user.userName = phrases[0].toLowerCase();
        commandHelper.data = data;
        commandHelper.hideInput = true;
        queueMessage({
          text: ['Input your password'],
          text_se: ['Skriv in ert lösenord'],
        });
        setInputStart('password');
        hideInput(true);
      } else {
        queueMessage({
          text: [
            'You need to input a user name',
            'Example: login best',
          ],
          text_se: [
            'Ni måste skriva in ert användarnamn',
            'Exempel: login best',
          ],
        });
        resetCommand();
      }
    },
    steps: [
      function loginStepOne(phrases) {
        commandHelper.data.user.password = phrases[0].toLowerCase();
        socket.emit('login', commandHelper.data);
        validCommands[commandHelper.command].abortFunc();
        validCommands.clear.func();
        resetCommand();
      },
    ],
    abortFunc: function loginAbort() {
      hideInput(false);
    },
    help: [
      'Logs in as a user on this device',
      'You have to be logged out to login as another user',
    ],
    help_se: [
      'Loggar in som en användare på denna enhet',
      'Ni måste vara utloggade för att kunna logga in som en annan användare',
    ],
    instructions: [
      ' Usage:',
      '  login *user name*',
      ' Example:',
      '  login user11',
    ],
    instructions_se: [
      ' Användning:',
      '  login *användarnamn*',
      ' Exempel:',
      '  login user11',
    ],
    clearAfterUse: true,
    accessLevel: 0,
    category: 'login',
  };
  validCommands.time = {
    func: function timeCommand() {
      socket.emit('time');
    },
    help: ['Shows the current time'],
    help_se: ['Visar nuvarande tiden'],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.locate = {
    func: function locateCommand(phrases) {
      if (!isTracking) {
        queueMessage({
          text: [
            'Tracking not available',
            'You are not connected to the satellites',
          ],
          text_se: [
            'Spårning är inte tillgänglig',
            'Ni är inte uppkopplade mot satelliterna',
          ],
        });
      } else if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();

        socket.emit('locate', { user: { userName: userName } });
      } else {
        socket.emit('locate', { user: { userName: getUser() } });
      }
    },
    help: [
      'Shows the last known location of the user',
      '* is a shortcut for all users. Example: locate *',
      'Just writing the command without a user name will show your current location. Example: locate',
      'You need to be connected to the satellites to access this command',
    ],
    help_se: [
      'Visar senaste identifierade position för användaren',
      '* är en genväg för alla användare. Exempel: locate *',
      'Om ni bara skriver kommandot utan ett användarnamn så kommer det visa er nuvarande position. Exempel: locate',
      'Ni måste vara uppkopplade mot satelliterna för att ha tillgång till detta kommando',
    ],
    instructions: [
      ' Usage:',
      '  locate *optional user name OR "*"*',
      ' Example:',
      '  locate user1',
      '  locate *',
      '  locate',
    ],
    instructions_se: [
      ' Användning:',
      '  locate *frivilligt användarnamn ELLER "*"*',
      ' Exempel:',
      '  locate user1',
      '  locate *',
      '  locate',
    ],
    autocomplete: { type: 'users' },
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.history = {
    func: function historyCommand(phrases) {
      const data = {};

      if (phrases.length > 0) {
        if (!isNaN(phrases[0])) {
          data.lines = phrases[0];
        } else {
          data.room = { roomName: phrases[0] };

          if (phrases.length > 1 && !isNaN(phrases[1])) {
            data.lines = phrases[1];
          }
        }
      }

      socket.emit('history', data);
    },
    help: [
      'Clears the screen and retrieves chat messages from server',
      'The amount you send with the command is the amount of messages that will be returned from each room you follow',
      'You can retrieve history from a specific room by adding the room name to the input. Example: history room1',
    ],
    help_se: [
      'Rensar skärmen och hämtar chatmeddelanden från servern',
      'Om ni skriver med ett värde så kommer servern skicka tillbaka så många meddelanden från varje rum ni följer',
      'Ni kan hämta meddelanden från ett specifikt rum om ni skriver med namnet. Exempel: history rum1',
    ],
    instructions: [
      ' Usage:',
      '  history *optional number*',
      '  history *optional room name* *optional number*',
      ' Example:',
      '  history',
      '  history 25',
      '  history aroom 25',
      '  history aroom',
    ],
    instructions_se: [
      ' Användning:',
      '  history *frivilligt nummer*',
      '  history *frivilligt rumsnamn* *frivilligt nummer*',
      ' Exempel:',
      '  history',
      '  history 25',
      '  history aroom',
      '  history aroom 25',
    ],
    clearAfterUse: true,
    clearBeforeUse: true,
    accessLevel: 1,
    category: 'advanced',
  };
  validCommands.morse = {
    func: function morseCommand(phrases, local) {
      if (phrases && phrases.length > 0) {
        const morseCodeText = parseMorse(phrases.join(' ').toLowerCase());

        if (morseCodeText.length > 0) {
          socket.emit('morse', {
            morseCode: morseCodeText,
            local: local,
          });
        }
      }
    },
    help: ['Sends a morse encoded message (sound) to all users'],
    help_se: ['Skicka ett meddelande via morse (ljud) till alla användare'],
    instructions: [
      ' Usage:',
      '  morse *message*',
      ' Example:',
      '  morse sos',
    ],
    instructions_se: [
      ' Användning:',
      '  morse *meddelande*',
      ' Exempel:',
      '  morse sos',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.password = {
    func: function passwordCommand() {
      commandHelper.hideInput = true;

      hideInput(true);
      setInputStart('Old passwd');
      queueMessage(copyMessage(abortInfo));
      queueMessage({
        text: ['Enter your current password'],
        text_se: ['Skriv in ert nuvarande lösenord'],
      });
    },
    steps: [
      function passwordStepOne(phrases = ['']) {
        const data = {};
        const oldPassword = phrases[0];
        data.oldPassword = oldPassword;
        commandHelper.data = data;
        commandHelper.onStep++;

        setInputStart('New pass');
        socket.emit('checkPassword', data);
      },
      function passwordStepTwo(phrases = []) {
        commandHelper.data.newPassword = phrases[0];
        commandHelper.onStep++;

        setInputStart('Repeat passwd');
        queueMessage({
          text: ['Repeat your new password'],
          text_se: ['Skriv in ert nya lösenord igen'],
        });
      },
      function passwordStepThree(phrases = []) {
        const repeatedPassword = phrases[0];

        if (repeatedPassword === commandHelper.data.newPassword) {
          socket.emit('changePassword', commandHelper.data);
          resetCommand(false);
        } else {
          commandHelper.onStep--;

          setInputStart('New pass');
          queueMessage({
            text: [
              'Password doesn\'t match. Please try again',
              'Enter your new password',
            ],
            text_se: [
              'Lösenorden matchar inte. Försök igen',
              'Skriv in ert nya lösenord',
            ],
          });
        }
      },
    ],
    abortFunc: function passwordAbort() {
      hideInput(false);
    },
    help: [
      'Allows you to change the user password',
      'Don\'t use whitespace in your password!',
    ],
    help_se: [
      'Tillåter er att ändra ert lösenord',
      'Använd inte blanksteg i lösenordet!',
    ],
    instructions: ['Follow the instructions on the screen'],
    instructions_se: ['Följ instruktionerna på skärmen'],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.logout = {
    func: function logoutCommand() {
      socket.emit('logout');
    },
    help: ['Logs out from the current user on this device'],
    help_se: ['Loggar ut din nuvarande användare från denna enhet'],
    accessLevel: 13,
    category: 'basic',
    clearAfterUse: true,
  };
  validCommands.reboot = {
    func: function rebootCommand() {
      refreshApp();
    },
    help: ['Reboots terminal'],
    help_se: ['Startar om terminalen'],
    accessLevel: 1,
    category: 'basic',
  };
  validCommands.verifyuser = {
    func: function verifyuserCommand(phrases) {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();

        if (userName === '*') {
          socket.emit('verifyAllUsers');
        } else {
          const data = { user: { userName: userName } };

          socket.emit('verifyUser', data);
        }
      } else {
        socket.emit('unverifiedUsers');
      }
    },
    help: [
      'Verifies a user and allows it to connect to the system',
      'verifyuser without any additional input will show a list of all unverified users. Exempel: verifyuser',
      'Use "*" to verify all users',
    ],
    help_se: [
      'Verifiera en användare och tillåter denne att koppla upp sig mot systemet',
      'verifyuser utan några andra tillägg visara en lista över alla icke-verifierade användare. Exempel: verifyuser',
      'Använd "*" för att verifiera alla icke-verifierade användare',
    ],
    instructions: [
      ' Usage:',
      '  verifyuser',
      '  verifyuser *username*',
      '  verifyuser *',
      ' Example:',
      '  verifyuser',
      '  verifyuser appl1',
      '  verifyuser *',
    ],
    instructions_se: [
      ' Användning:',
      '  verifyuser *frivilligt användarnamn ELLER "*"*',
      ' Exempel:',
      '  verifyuser',
      '  verifyuser appl1',
      '  verifyuser *',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.banuser = {
    func: function banuserCommand(phrases) {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();
        const data = { user: { userName: userName } };

        socket.emit('ban', data);
      } else {
        socket.emit('bannedUsers');
      }
    },
    help: [
      'Bans a user and disconnects it from the system',
      'The user will not be able to log on again',
    ],
    help_se: [
      'Bannar användaren och kopplar från denne från systemet',
      'Användaren kommer inte kunna logga in igen',
    ],
    instructions: [
      ' Usage:',
      '  banuser *username*',
      ' Example:',
      '  banuser evil1',
    ],
    instructions_se: [
      ' Användning:',
      '  banuser *användarnamn*',
      ' Exempel:',
      '  banuser evil1',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.unbanuser = {
    func: function unbanuserCommand(phrases) {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();
        const data = { user: { userName: userName } };

        socket.emit('unban', data);
      } else {
        socket.emit('bannedUsers');
      }
    },
    help: [
      'Removes ban on user',
      'The user will be able to log on again',
      'unbanuser without any additional input will show a list of all banned users. Example: unbanuser',
    ],
    help_se: [
      'Tar bort en banning från en användare',
      'Användaren kommer kunna logga in igen',
      'unbanuser utan tillägg visar en lista över alla bannade användare. Example: unbanuser',
    ],
    instructions: [
      ' Usage:',
      '  unbanuser *optional username*',
      ' Example:',
      '  unbanuser',
      '  unbanuser evil1',
    ],
    instructions_se: [
      ' Användning:',
      '  unbanuser *frivilligt användarnamn*',
      ' Exempel:',
      '  unbanuser',
      '  unbanuser evil1',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.whisper = {
    func: function whisperCommand(phrases) {
      const data = {};

      if (phrases.length > 1) {
        data.message = {};
        data.message.roomName = phrases[0].toLowerCase();
        data.message.text = [phrases.slice(1).join(' ')];
        data.message.userName = getUser();
        data.message.whisper = true;

        socket.emit('whisperMsg', data);
      } else {
        queueMessage({
          text: ['You forgot to write the message!'],
          text_se: ['Ni glömde skriva in ett meddelande!'],
        });
      }
    },
    help: [
      'Send a private message to a user',
      'The first word that you write will be interpreted as a user name',
      'The rest of the input will be sent to only that user',
    ],
    help_se: [
      'Skicka ett privat meddelande till en användare',
      'Det första ni skriver in kommer att tolkas som användarnamnet',
      'The rest of the input will be sent to only that user',
    ],
    instructions: [
      ' Usage:',
      '  whisper *user name* *message*',
      ' Example:',
      '  whisper adam hello, adam!',
      '  whisper user1 sounds good!',
    ],
    instructions_se: [
      ' Användning:',
      '  whisper *användarnamn* *meddelande*',
      ' Exempel:',
      '  whisper ada Hej, Ada!',
      '  whisper user1 Låter bra!',
    ],
    clearAfterUse: true,
    autocomplete: { type: 'users' },
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.hackroom = {
    func: function hackroomCommand(phrases) {
      const data = {};
      const razLogoCopy = copyMessage(storedMessages.razor);

      if (phrases.length > 0) {
        data.roomName = phrases[0].toLowerCase();
        data.timesCracked = 0;
        data.timesRequired = 3;
        commandHelper.data = data;

        // TODO: razorLogo should be moved to DB or other place
        queueMessage(razLogoCopy);
        // TODO: Message about abort should be sent from a common function for all commands
        queueMessage({
          text: [
            'Razor proudly presents:',
            'Room Access Hacking! (RAH)',
            '/8iybEVaC1yc2EAAAADAQABAAABAQDS//2ag4/',
            'D6Rsc8OO/6wFUVDdpdAItvSCLCrc/dcE/8iybE',
            'w3OtlVFnfNkOVAvhObuWO/6wFUVDdkr2yYTaDE',
            'i5mB3Nz1aC1yc2buWr6QKLvfZVczAxAHPKLvfZ',
            'dK2zXrxGOmOFllxiCbpGOmOFlcJy1/iCbpmA4c',
            'MFvEEiKXrxGlxiCbp0miONAAvhObuWO/6ujMJH',
            'JHa88/x1DVOFl/yujOMJHa88/x1DVwWl6lsjvS',
            'wDDVwWl6el88/x1j5C+k/aadtg1lcvcz7Tdtve',
            'k/aadtghxv595Xqw2qrvyp6GrdX/FrhObuWr6Q',
            ' ',
            'Please wait.......',
            'Command interception.........ACTIVATED',
            'Oracle defense systems.......DISABLED',
            'Overriding locks.............DONE',
            'Connecting to database ......DONE',
            ' ',
          ],
        });
        queueMessage(copyMessage(abortInfo));
        queueMessage({
          text: ['Press enter to continue'],
          text_se: ['Tryck på enter för att fortsätta'],
        });

        setInputStart('Start');
      } else {
        queueMessage({
          text: ['You forgot to input the room name!'],
          text_se: ['Ni glömde att skriva in rumsnamnet!'],
        });
        resetCommand(true);
      }
    },
    steps: [
      function hackroomStepOne() {
        queueMessage({
          text: ['Checking room access...'],
          text_se: ['Undersöker rummet...'],
        });
        socket.emit('roomHackable', commandHelper.data.roomName);
      },
      function hackroomStepTwo() {
        const commandObj = commandHelper;
        const timeout = 28000;
        const timerEnded = function timerEnded() {
          queueMessage({
            text: [
              'Your hacking attempt has been detected',
              'Users of the room have been notified of your intrusion attempt',
            ],
            text_se: [
              'Ditt hackningsförsök har upptäckts',
              'Användarna i rummet har blivit notifierad om ditt försök att bryta dig in',
            ],
          });
          // TODO Move to server side
          socket.emit('chatMsg', {
            message: {
              text: [
                'WARNING! Intrustion attempt detected!',
                'User ' + getUser() + ' tried breaking in',
              ],
              user: 'SYSTEM',
            },
            roomName: commandObj.data.roomName,
          });
          resetCommand(true);
        };

        queueMessage({
          text: [
            'Activating cracking bot....',
            'Warning. Intrusion defense system activated',
            'Time until detection: ' + (timeout / 1000) + ' seconds',
            'Level 3 security protection detected',
            '3 sequences required',
          ],
          text_se: [
            'Aktiverar botten....',
            'Varning. Försvarssystem mot intrång har aktiverats',
            'Antal sekunder innan intråget upptäcks: ' + (timeout / 1000) + ' sekunder',
            'Level 3 försvarssystem upptäckt',
            '3 sekvenser krävs',
          ],
        });
        setInputStart('Verify seq');
        commandObj.data.code = createRandString(randomString.slice(9), 10, true);
        commandObj.data.timer = setTimeout(timerEnded, timeout);
        commandObj.onStep++;
        queueMessage({
          text: ['Sequence: ' + commandObj.data.code],
          text_en: ['Sekvens: ' + commandObj.data.code],
        });
      },
      function hackroomStepThree(phrases) {
        const commandObj = commandHelper;
        const phrase = phrases.join(' ').trim();

        if (phrase.toUpperCase() === commandObj.data.code) {
          queueMessage({
            text: ['Sequence accepted'],
            text_se: ['Sekvens accepterad'],
          });

          commandObj.data.timesCracked++;
        } else {
          queueMessage({
            text: ['Incorrect sequence. Counter measures have been released'],
            text_se: ['Felaktiv sekvens. Motåtgärder har blivit aktivetade'],
          });
        }

        if (commandObj.data.timesCracked < commandObj.data.timesRequired) {
          commandObj.data.code = createRandString(randomString.slice(9), 10, true);
          queueMessage({
            text: ['Sequence: ' + commandObj.data.code],
            text_se: ['Sekvens: ' + commandObj.data.code],
          });
        } else {
          const data = {
            room: {
              roomName: commandObj.data.roomName,
            },
          };

          clearTimeout(commandObj.data.timer);
          socket.emit('hackRoom', data);
          queueMessage(({
            text: [
              'Cracking complete',
              'Intrusion defense system disabled',
              'Suppressing notification and following room',
              'Thank you for using RAH',
            ],
            text_se: [
              'Crackningen har lyckats',
              'Försvarsystemet har inaktiverats',
              'Stävjar notifikationen och börjar följa rummet',
              'Tack for att ni använde RAH',
            ],
          }));
          resetCommand();
        }
      },
    ],
    abortFunc: function hackroomAbort() {
      clearTimeout(commandHelper.data.timer);
    },
    help: [
      'ERROR. UNAUTHORIZED COMMAND... AUTHORIZATION OVERRIDDEN. PRINTING INSTRUCTIONS',
      'This command lets you follow a room without knowing the password',
      'It will also supress the following notification',
      'Failing the hack will warn everyone in the room',
    ],
    help_se: [
      'FEL. EJ BEHÖRIGT KOMMANDO... KRINGÅR BEHÖRIGHET. SKRIVER UT INSTRUKTIONER',
      'Detta kommando låter dig följa rum utan att veta dess lösenord',
      'Det kommer att stoppa notifikationen som vanligtvis skickas till rum',
      'Alla i rummet kommer bli notifierade om ni misslyckas med hackningen',
    ],
    instructions: [
      ' Usage:',
      '  hackroom *room name*',
      ' Example:',
      '  hackroom secret',
    ],
    instructions_se: [
      ' Användning:',
      '  hackroom *rumsnamn*',
      ' Exempel:',
      '  hackroom secret',
    ],
    clearBeforeUse: true,
    accessLevel: 13,
    category: 'hacking',
  };
  validCommands.importantmsg = {
    func: function importantmsgCommand() {
      const data = {
        message: {
          text: [],
          userName: getUser(),
          hideName: true,
        },
      };
      commandHelper.data = data;

      queueMessage(copyMessage(abortInfo));
      queueMessage({
        text: [
          'Do you want to send it to a specific device?',
          'Enter the device ID or alias to send it to a specific device',
          'Leave it empty and press enter if you want to send it to all users',
        ],
        text_se: [
          'Vill ni skicka meddelandet till en specifik enhet?',
          'Skriv in ID eller alias till en enhet för att skicka meddelandet till endast den enheten',
          'Lämna det tomt och tryck på enter-knappen om ni vill skicka det till alla användare',
        ],
      });
      setInputStart('imprtntMsg');
    },
    steps: [
      function importantmsgStepOne(phrases) {
        if (phrases.length > 0) {
          const deviceId = phrases[0];

          if (deviceId.length > 0) {
            commandHelper.data.device = { deviceId: deviceId };
            queueMessage({
              text: ['Searching for device...'],
              text_se: ['Letar efter enheten...'],
            });
            socket.emit('verifyDevice', commandHelper.data);
          } else {
            commandHelper.onStep++;
            validCommands[commandHelper.command].steps[commandHelper.onStep]();
          }
        }
      },
      function importantmsgStepTwo() {
        commandHelper.onStep++;
        queueMessage({
          text: [
            'Write a line and press enter',
            'Press enter without any input when you are completely done with the message',
            'Try to keep the first line short if you want to send it as morse',
          ],
          text_se: [
            'Skriv en rad och tryck på enter-knappen',
            'Tryck på enter-knappen utan någon text när ni är helt klara med meddelandet',
            'Försök att hålla första raden kort om ni vill skicka meddelandet som morse',
          ],
        });
      },
      function importantmsgStepThree(phrases) {
        const message = commandHelper.data.message;

        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');

          message.text.push(phrase);
        } else {
          const dataText = copyString(message.text);
          commandHelper.onStep++;

          queueMessage({
            text: ['Preview of the message:'],
            text_se: ['Förhandsvisning av meddelandet:'],
          });
          queueMessage({
            text: dataText,
            extraClass: 'importantMsg',
          });
          queueMessage({
            text: ['Is this OK? "yes" to accept the message'],
            text_se: ['Är detta OK? Skriv in "yes" för att acceptera meddelandet'],
          });
        }
      },
      function importantmsgStepFour(phrases) {
        if (phrases.length > 0) {
          if (phrases[0].toLowerCase() === 'yes') {
            commandHelper.onStep++;

            queueMessage({
              text: [
                'Do you want to send it as morse code too? "yes" to send it as morse too',
                'Note! Only the first line will be sent as morse',
              ],
              text_se: [
                'Vill ni också skicka det som morse? Skriv "yes" för att skicka det som morse',
                'Notera att endast första raden skickas som morse',
              ],
            });
          } else {
            resetCommand(true);
          }
        }
      },
      function importantmsgStepFive(phrases) {
        if (phrases.length > 0) {
          if (phrases[0].toLowerCase() === 'yes') {
            commandHelper.data.morse = {
              morseCode: parseMorse(commandHelper.data.message.text[0]),
              local: true,
            };
          }

          socket.emit('importantMsg', commandHelper.data);
          resetCommand();
        }
      },
    ],
    help: ['Send an important message to a single device or all users'],
    help_se: ['Skicka ett viktigt meddelande till en enheter eller alla användare'],
    instructions: [
      'Follow the on-screen instructions',
      'Note! Only the first line can be sent as morse code (optional)',
    ],
    instructions_se: [
      'Följ instruktionerna på skärmen',
      'Notera att endast första raden skickas som morse (frivilligt)',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.chipper = {
    func: function chipperCommand() {
      queueMessage({
        text: [
          createLine(lineLength),
          '- DEACTIVATE -',
          createLine(lineLength),
        ],
        extraClass: 'importantMsg large',
      });
      queueMessage({
        text: [
          'CONTROL COMMAND SENT',
          'AWAITING CONFIRMATION',
        ],
        text_se: [
          'KONTROLLKOMMANDOT HAR SKICKATS',
          'VÄNTAR PÅ KONFIRMATION',
        ],
        extraClass: 'importantMsg',
      });
      queueMessage(copyMessage(abortInfo));
      queueMessage({
        text: ['Press Enter to continue'],
        text_se: ['Tryck på enter-knappen för att fortsätta'],
      });
      setInputStart('Chipper');
    },
    steps: [
      function chipperStepOne() {
        const commandObj = commandHelper;
        commandObj.data = {};
        commandObj.onStep++;
        queueMessage({
          text: [
            'Chipper has been activated',
            'Connecting to external system .....',
          ],
          text_se: [
            'Chipper har blivit aktiverad',
            'Ansluter till externt system .....',
          ],
        });
        setTimeout(validCommands[commandObj.command].steps[commandObj.onStep], 2000);
      },
      function chipperStepTwo() {
        const commandObj = commandHelper;
        const stopFunc = function stopFunc() {
          queueMessage({
            text: [
              'WARNING',
              'CONTROL IS BEING RELEASED',
              'CHIPPER POWERING DOWN',
            ],
            text_se: [
              'VARNING',
              'ANSLUTNINGEN STÄNGD',
              'CHIPPER AVSLUTAS',
            ],
            extraClass: 'importantMsg',
          });

          validCommands[commandObj.command].abortFunc();
        };

        if (commandObj.data.timer === undefined) {
          commandObj.data.timer = setTimeout(stopFunc, 20000, false);
        }

        queueMessage({
          text: [createRandString(randomBinary, 36)],
        });

        commandObj.data.printTimer = setTimeout(validCommands[commandObj.command].steps[commandObj.onStep], 250);
      },
    ],
    abortFunc: function chipperAbort() {
      const commandObj = commandHelper;

      if (commandObj.data) {
        clearTimeout(commandObj.data.printTimer);
        clearTimeout(commandObj.data.timer);
      }

      validCommands.clear.func();
      queueMessage({
        text: [
          'Control has been released',
          'Chipper has powered down',
        ],
        text_se: [
          'Anslutningen har stängts',
          'Chipper har avslutas',
        ],
      });
      resetCommand();
    },
    help: [
      'Activate chipper function',
      'Press enter when you have retrieved confirmation from the external system',
    ],
    help_se: [
      'Aktivera chipperfunktionen',
      'Tryck på enter-knappen när ni har fått konfirmation från externa systemet',
    ],
    instructions: ['Follow the instructions on the screen'],
    instructions_se: ['Följ instruktionerna på skärmen'],
    accessLevel: 13,
    category: 'hacking',
    clearBeforeUse: true,
  };
  validCommands.room = {
    func: function roomCommand(phrases) {
      const data = { room: {} };

      if (phrases.length > 0) {
        const roomName = phrases[0].toLowerCase();

        if (roomName) {
          data.room.roomName = roomName;
          /**
           * Flag that will be used in .on function locally to
           * show user they have entered
           */
          data.room.entered = true;

          socket.emit('switchRoom', data);
        }
      } else {
        queueMessage({
          text: ['You have to specify which room to switch to'],
          text_se: ['Ni måste specificera vilket ni vill byta till'],
        });
      }
    },
    help: [
      'Switches your current room to another',
      'You have to already be following the room to switch to it',
    ],
    help_se: [
      'Byter nuvrande rum till ett annat',
      'Ni måste redan följa rummet för att kunna byta till det',
    ],
    instructions: [
      ' Usage:',
      '  room *room you are following*',
      ' Example:',
      '  room room1',
    ],
    instructions_se: [
      ' Användning:',
      '  room *rumsnamn på ett rum ni följer',
      ' Exempel:',
      '  room room1',
    ],
    autocomplete: { type: 'myRooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.removeroom = {
    func: function removeroomCommand(phrases) {
      const data = { room: {} };

      if (phrases.length > 0) {
        data.room.roomName = phrases[0].toLowerCase();
        commandHelper.data = data;

        queueMessage({
          text: [
            'Do you really want to remove the room?',
            'Confirm by writing "yes"',
          ],
          text_se: [
            'Vill ni verkligen ta bort rummet?',
            'Skriv "ja" om ni är säkra',
          ],
        });

        setInputStart('removeroom');
      } else {
        resetCommand(true);

        queueMessage({
          text: ['You forgot to input the room name'],
          text_se: ['Ni glömde bort att skriva in ett rumsnamn'],
        });
      }
    },
    steps: [
      function removeroomStepOne(phrases) {
        if (phrases[0].toLowerCase() === 'yes') {
          socket.emit('removeRoom', commandHelper.data);
        }

        resetCommand();
      },
    ],
    help: [
      'Removes a room',
      'You have to be either the owner or an admin of the room to remove it',
    ],
    help_se: [
      'Tar bort ett rum',
      'Ni måste vara antingen ägaren eller en administratör av rummet för att kunna ta bort det',
    ],
    instructions: [
      ' Usage:',
      '  removeroom *room name*',
      ' Example:',
      '  removeroom room1',
    ],
    instructions_se: [
      ' Användning:',
      '  removeroom *rumsnamn*',
      ' Exempel:',
      '  removeroom room1',
    ],
    accessLevel: 13,
    category: 'advanced',
  };
  validCommands.updateuser = {
    func: function updateuserCommand(phrases) {
      const data = { user: {} };

      if (phrases.length > 2) {
        data.user.userName = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateUser', data);
      } else {
        queueMessage({
          text: [
            'You need to write a user name, field name and value',
            'Example: updateuser user1 accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett användarnamn, fältnamn och värde',
            'Exempel: updateuser user1 accesslevel 3',
          ],
        });
      }
    },
    help: [
      'Change fields on a user',
      'You can change visibility, accesslevel, password or add/remove a group',
      'Valid fields: visibility, accesslevel, addgroup, removegroup, password',
    ],
    help_se: [
      'Ändra ett fält hos en användare',
      'Ni kan ändra visibility, accesslevel, password eller lägga till/ta bort en grupp',
      'Giltiga fält: visibility, accesslevel, addgroup, removegroup, password',
    ],
    instructions: [
      ' Usage:',
      '  updateuser *user name* *field name* *value*',
      ' Example:',
      '  updateuser user1 accesslevel 3',
      '  updateuser user1 group hackers',
    ],
    instructions_se: [
      ' Användning:',
      '  updateuser *användarnamn* *fältnamn* *värde',
      ' Exempel:',
      '  updateuser user1 accesslevel 3',
      '  update user1 group hackers',
    ],
    autocomplete: { type: 'users' },
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.updatecommand = {
    func: function updatecommandCommand(phrases) {
      const data = {};

      if (phrases.length > 2) {
        data.command = { commandName: phrases[0] };
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateCommand', data);
      } else {
        queueMessage({
          text: [
            'You need to write a command name, field name and value',
            'Example: updatecommand help accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett kommandonamn, fältnamn och värde',
            'Exempel: updatecommand help accesslevel 3',
          ],
        });
      }
    },
    help: [
      'Change fields on a command',
      'You can currently change visibility or accesslevel',
      'Valid fields: visibility, accesslevel',
    ],
    help_se: [
      'Ändra ett fält i ett kommando',
      'Ni kan ändra visibility eller accesslevel',
      'Giltiga fält: visibility, accesslevel',
    ],
    instructions: [
      ' Usage:',
      '  updatecommand *command name* *field name* *value*',
      ' Example:',
      '  updatecommand help accesslevel 3',
      '  updatecommand help visibility 6',
    ],
    instructions_se: [
      ' Användning:',
      '  updatecommand *kommandonamn* *fältnamn* *värde*',
      ' Exempel:',
      '  updatecommand help accesslevel 3',
      '  updatecommand help visibility 6',
    ],
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.updateroom = {
    func: function updateroomCommand(phrases) {
      const data = { room: {} };

      if (phrases.length > 2) {
        data.room.roomName = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateRoom', data);
      } else {
        queueMessage({
          text: [
            'You need to write a room name, field name and value',
            'Example: updateroom room1 accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett rumsnamn, fältnamn och värde',
            'Exempel: updateroom room1 accesslevel 3',
          ],
        });
      }
    },
    help: [
      'Change fields on a room',
      'You can change visibility, accesslevel',
      'Valid fields: visibility, accesslevel',
    ],
    help_se: [
      'Ändra ett fält på ett rum',
      'Ni kan ändra visibility, accesslevel',
      'Giltiga fält: visibility, accesslevel',
    ],
    instructions: [
      ' Usage:',
      '  updateroom *room name* *field name* *value*',
      ' Example:',
      '  updateroom user1 accesslevel 3',
    ],
    instructions_se: [
      ' Användning:',
      '  updateroom *rumsnamn* *fältnamn* *värde*',
      ' Exempel:',
      '  updateroom user1 accesslevel 3',
    ],
    autocomplete: { type: 'rooms' },
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.weather = {
    func: function weatherCommand() {
      socket.emit('weather');
    },
    accessLevel: 1,
    category: 'basic',
  };
  validCommands.updatedevice = {
    func: function updatedeviceCommand(phrases) {
      const data = { device: {} };

      if (phrases.length > 2) {
        data.device.deviceId = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateDevice', data);
      } else {
        queueMessage({
          text: [
            'You need to write a device Id, field name and value',
            'Example: updatedevice 11jfej433 id betteralias',
          ],
          text_se: [
            'Ni måste skriva in ett enhets-ID, fältnamn och värde',
            'Exempel: updatedevice 11jfej433 id betteralias',
          ],
        });
      }
    },
    help: [
      'Change fields on a device',
      'You can currently change the alias',
      'Valid fields: alias',
    ],
    help_se: [
      'Ändra fält på en enhet',
      'Ni kan ändra alias',
      'Giltiga fält: alias',
    ],
    instructions: [
      ' Usage:',
      '  updatedevice *device ID* *field name* *value*',
      ' Example:',
      '  updatedevice 32r23rj alias betteralias',
    ],
    instructions_se: [
      ' Användning:',
      '  updatedevice *enhets-ID* *fältnamn* *värde*',
      ' Exempel:',
      '  updatedevice 32r23rj alias betteralias',
    ],
    autocomplete: { type: 'devices' },
    accessLevel: 13,
    category: 'admin',
  };
  validCommands.createteam = {
    func: function createteamCommand(phrases) {
      const data = { team: { teamName: '' } };

      if (phrases.length > 0) {
        data.team.teamName = phrases.join(' ');
        commandHelper.data = data;
        queueMessage(copyMessage(abortInfo));
        setInputStart('owner');
        socket.emit('teamExists', commandHelper.data);
      } else {
        queueMessage({
          text: ['You have to enter a name. Example: createteam My Team Name'],
          text_se: ['Ni måste skriva in ett namn. Exempel: createteam Mitt Team'],
        });
        resetCommand(false);
      }
    },
    steps: [
      function creeateTeamStepOne() {
        queueMessage({
          text: [
            'Are you the owner of the team? Leave it empty and press enter, if you are. Enter the name of the user that is the owner, if you are not',
            'You can press tab or double space to see available users',
          ],
          text_se: [
            'Är ni ägaren av teamet? Lämna fältet tomt och tryck på Enter-knappen om ni är det. Skriv annars in användarnamnet som är ägaren om inte ni är det',
            'Ni kan trycka på tab-knappen eller skriva in dubbelblanksteg för att se tillgängliga användare',
          ],
        });
        commandHelper.allowAutoComplete = true;
        commandHelper.onStep++;
      },
      function createTeamStepTwo(phrases) {
        if (phrases[0] !== '') {
          const owner = phrases[0];

          commandHelper.data.team.owner = owner;
          commandHelper.data.team.admins = [getUser()];
        } else {
          commandHelper.data.team.owner = getUser();
        }

        socket.emit('createTeam', commandHelper.data);
        resetCommand(false);
      },
    ],
    help: [
      'Create a new team',
      'You will be able to invite new members to the team',
    ],
    help_se: [
      'Skapa ett nytt team',
      'Ni kommer att kunna bjuda in nya medlemmar till teamet',
    ],
    instructions: [
      ' Usage:',
      '  createteam *name*',
      ' Example:',
      '  createteam team1',
    ],
    instructions_se: [
      ' Användning:',
      '  createteam *namn*',
      ' Exempel:',
      '  createteam team1',
    ],
    accessLevel: 13,
    category: 'basic',
    autocomplete: { type: 'users' },
  };
  validCommands.invitations = {
    func: function invitationsCommand() {
      socket.emit('getInvitations');
    },
    steps: [
      function invitationsCommandStepOne(data) {
        const sentInvitations = data.invitations;
        const text = [];
        commandHelper.data = data;

        if (sentInvitations.length > 0) {
          for (let i = 0; i < sentInvitations.length; i++) {
            const invitation = sentInvitations[i];
            const itemNumber = i + 1;

            text.push('<' + itemNumber + '> Join ' + invitation.invitationType + ' ' + invitation.itemName + '. Sent by ' + invitation.sender);
          }

          queueMessage({ text: createCommandStart('Invitations').concat(text, createCommandEnd()) });
          queueMessage({
            text: [
              'Answer the invite with accept or decline. Example: 1 decline',
            ],
            text_se: [
              'Besvara inbjudan med accept eller decline. Exempel: 1 decline',
            ],
          });
          queueMessage(copyMessage(abortInfo));
          setInputStart('answer');
          commandHelper.onStep++;
        } else {
          queueMessage({
            text: ['You have no invitations'],
            text_se: ['Ni har inga inbjudan'],
          });
          resetCommand(false);
        }
      },
      function invitationsCommandStepTwo(phrases) {
        if (phrases.length > 1) {
          const itemNumber = phrases[0] - 1;
          const answer = phrases[1].toLowerCase();
          const invitation = commandHelper.data.invitations[itemNumber];

          if (['accept', 'a', 'decline', 'd'].indexOf(answer) > -1) {
            const accepted = ['accept', 'a'].indexOf(answer) > -1 ? true : false;
            const data = { accepted: accepted, invitation: invitation };

            switch (invitation.invitationType) {
            case 'team':
              socket.emit('teamAnswer', data);

              break;
            case 'room':
              socket.emit('roomAnswer', data);

              break;
            default:
              break;
            }

            resetCommand(false);
          } else {
            queueMessage({
              text: ['You have to either accept or decline the invitation'],
              text_se: ['Ni måste antingen acceptera eller avböja inbjudan'],
            });
          }
        } else {
          resetCommand(true);
        }
      },
    ],
    help: [
      'Shows a list of all your invitations and lets you accept or decline them',
      'Note that "d" is a shorthand for "decline" and "a" is a shorthand for "accept" Either version is allowed',
    ],
    help_se: [
      'Visar en lista över dina inbjudan och låter dig acceptera eller avböja dem',
      'Notera att "d" är en förkortning av "decline" och "a" är en förkortning "accept" Bägge är tillåtna',
    ],
    instructions: [
      ' Usage:',
      '  invitations',
      '  *number of the invitation* *accept OR a OR decline OR d*',
      ' Example:',
      '  invitations',
      '  1 accept',
    ],
    instructions_se: [
      ' Användning:',
      '  invitations',
      '  *nummer på inbjudan* *accept ELLR a ELLER decline ELLER d*',
      ' Exampel:',
      '  invitations',
      '  1 accept',
    ],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.inviteteam = {
    func: function inviteteamCommand(phrases) {
      const data = { user: { userName: phrases[0] } };

      if (data.user.userName) {
        socket.emit('inviteToTeam', data);
      } else {
        queueMessage({
          text: ['You have to enter a user name. Example: inviteteam bob'],
          text_se: ['Ni måste skriva in ett användarnamn. Exempel: inviteteam bob'],
        });
      }
    },
    help: [
      'Invites another user to your team',
      'You have to be the team leader or an team administrator to invite new members',
    ],
    help_se: [
      'Bjuder in andra användare till ditt team',
      'Ni måste vara ledare för teamet eller en administratör för teamet för att kunna bjuda in nya medlemmar',
    ],
    instructions: [
      ' Usage:',
      '  inviteteam *user name*',
      ' Example:',
      '  inviteteam user1',
    ],
    instructions_se: [
      ' Användning:',
      '  inviteteam *användarnamn*',
      ' Exempel:',
      '  inviteteam user1',
    ],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.inviteroom = {
    func: function inviteroomCommand(phrases) {
      const data = {
        user: { userName: phrases[0] },
        room: { roomName: phrases[1] },
      };

      if (data.user.userName && data.room.roomName) {
        socket.emit('inviteToRoom', data);
      } else {
        queueMessage({
          text: ['You have to enter a user name and a room name. Example: inviteroom bob room1'],
          text_se: ['Ni måste skriva in ett användarnamn och ett rumsnamn. Exempel: inviteroom bob rum1'],
        });
      }
    },
    help: [
      'Invites another user to a room you are following',
    ],
    help_se: [
      'Bjuder in en annan användare till ett rum ni följer',
    ],
    instructions: [
      ' Usage:',
      '  inviteroom *user name* *room name*',
      ' Example:',
      '  inviteroom user1 room1',
    ],
    instructions_se: [
      ' Användning:',
      '  inviteroom *användarnamn* *rumsnamn*',
      ' Exempel:',
      '  inviteroom user1 room1',
    ],
    accessLevel: 13,
    category: 'basic',
  };
  validCommands.alias = {
    func: function aliasCommand(phrases) {
      const aliasName = phrases.shift();
      const sequence = phrases;
      const aliases = getAliases();
      const commandKeys = Object.keys(validCommands);

      if (aliasName && sequence && commandKeys.indexOf(aliasName) === -1) {
        aliases[aliasName] = sequence;
        setAliases(aliases);
      } else if (commandKeys.indexOf(aliasName) > -1) {
        queueMessage({
          text: [aliasName + ' is a built-in command. You may not override built-in commands'],
          text_se: [aliasName + ' är ett inbyggt kommando. Inbyggda kommandon kan inte ersättas'],
        });
      } else {
        queueMessage({
          text: [
            'You have to input a name and sequence',
            'Example: alias goodalias msg hello',
          ],
          text_se: [
            'Ni måste skriva in ett namn och sekvens',
            'Exempel: alias goodalias msg hello',
          ],
        });
      }
    },
    help: [
      'Create a new shortcut for a command and sequence',
      'The shortcut will appear among other commands when you auto-complete',
      'The below example "hello" will use command "msg" to send the chat message "Greetings to all!"',
    ],
    help_se: [
      'Skapa en ny genväg för ett kommando och en sekvens',
      'Genvägen kommer att synas tillsammans med andra kommandon när ni använder autoifyllning',
      'Nedan kan ni se ett exempel som skickar ett meddelande (via kommandot "msg") när "hello" körs',
    ],
    instructions: [
      ' Usage:',
      '  alias *alias name* *command name* *sequence*',
      ' Example:',
      '  alias hello msg Greetings to all!',
    ],
    instructions_se: [
      ' Användning:',
      '  alias *namn* *kommandonamn* *sekvens*',
      ' Exempel:',
      '  alias hello msg God dag, folket!',
    ],
    accessLevel: 13,
    category: 'basic',
  };
}

// Sets everything relevant when a user enters the site
function startBoot() {
  oldAndroid = isOldAndroid();
  storedMessages = getLocalVal('storedMessages') !== null ? JSON.parse(getLocalVal('storedMessages')) : {};

  downgradeOlderDevices();
  attachCommands();
  populateMenu();
  socket.emit('getCommands');

  if (!isTouchDevice()) {
    commandInput.focus();
  }

  // TODO: Move this
  if (!getDeviceId()) {
    setDeviceId(generateDeviceId());
  }

  document.getElementById('background').addEventListener('click', function clickHandler(event) {
    clicked = !clicked;

    if (clicked) {
      commandInput.focus();
    } else {
      commandInput.blur();
    }

    // Set whole document to full screen
    goFullScreen(document.documentElement);
    fullscreenResize(clicked);

    event.preventDefault();
  });

  startSocket();
  addEventListener('keypress', keyPress);
  // Needed for some special keys. They are not detected with keypress
  addEventListener('keydown', specialKeyPress);
  addEventListener('keyup', keyReleased);
  window.addEventListener('focus', setIntervals);

  resetPreviousCommandPointer();
  generateMap();
  setIntervals();
  startAudio();

  // TODO: Move this
  if (!getAccessLevel()) {
    setAccessLevel(0);
  }

  if (!getUser()) {
    setInputStart(defaultInputStart);
    socket.emit('updateDeviceSocketId', {
      device: { deviceId: getDeviceId() },
      user: {
        socketId: socket.id,
        userName: 'NO_USER_LOGGED_IN',
      },
    });
  }

  socket.emit('updateId', {
    user: { userName: getUser() },
    firstConnection: true,
    device: { deviceId: getDeviceId() },
  });
}

startBoot();
