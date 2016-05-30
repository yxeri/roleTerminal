'use strict';

const labels = require('./labels');
const textTools = require('./textTools');
const audio = require('./audio');
const zalgoGenerator = require('./zalgoGenerator');

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
const cmdInput = document.getElementById('cmdInput');
const inputStart = document.getElementById('inputStart');
const modeField = document.getElementById('mode');
const spacer = document.getElementById('spacer');
const background = document.getElementById('background');
const menu = document.getElementById('menu');
const menuList = document.getElementById('menuList');
// Socket.io
const socket = io(); // eslint-disable-line no-undef
// Queue of all the sounds that will be handled and played
const soundQueue = [];
const commandTime = 1000;
const dot = '.';
const dash = '-';
const morseSeparator = '#';
// TODO Convert to arrays with amounts pointing to either - or .
const morseCodes = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',
  // Symbolizes space betwen words
  '#': morseSeparator,
};
const commandHelper = {
  maxSteps: 0,
  onStep: 0,
  command: null,
  keysBlocked: false,
  data: null,
  hideInput: false,
};
const triggerKeysPressed = [];
const commands = {};
// Timeout between print of rows (milliseconds)
const rowTimeout = 40;
// Class names of animations in css
const animations = [
  'subliminal',
  'subliminalFast',
  'subliminalSlow',
];
const mapMarkers = {};
// Index of the animation to be retrieved from animations array
let animationPosition = 0;
let audioCtx;
let oscillator;
let gainNode;
let soundTimeout = 0;
let previousCommandPointer;
let watchId = null;
// Is geolocation tracking on?
let isTracking = false;
let firstConnection = true;
let viewIsSplit = false;
let secondView = null;
let map;
let isLandscape = window.innerWidth > window.innerHeight;
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
let serverDownTimeout = null;

function setLocalVal(name, item) {
  localStorage.setItem(name, item);
}

function removeLocalVal(name) {
  localStorage.removeItem(name);
}

function isTextAllowed(text) {
  return /^[a-zA-Z0-9]+$/g.test(text);
}

function getLocalVal(name) {
  return localStorage.getItem(name);
}

function getDefaultLanguage() {
  return getLocalVal('defaultLanguage');
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
  return number > 9 ? number : `0${number}`;
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
    spanObj.addEventListener('click', (event) => {
      clicked = true;

      if (replacePhrase) {
        replaceLastInputPhrase(`${text} `);
      } else if (keepInput) {
        appendInputText(`${text} `);
      } else {
        setCommandInput(`${text} `);
      }

      cmdInput.focus();
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
    text,
    className,
  });
  spanObj.classList.add('link');

  spanObj.addEventListener('click', (event) => {
    clicked = true;

    func(this);
    cmdInput.focus();
    event.stopPropagation();
  });

  return spanObj;
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

function linkUser(elem) {
  setCommandInput(`whisper ${elem.textContent} `);
}

function linkRoom(elem) {
  commands.room.func([elem.textContent]);
}

function scrollView() {
  if (!oldAndroid) {
    spacer.scrollIntoView();
  } else {
    // Compatibility fix for old Android
    window.scrollTo(0, document.body.scrollHeight);
  }
}

// Adds time stamp and room name to a string from a message if they are set
function createRow(message, subText) {
  const rowObj = document.createElement('li');
  const roomName = message.roomName;
  const extraClass = message.extraClass;

  if (extraClass) {
    rowObj.classList.add(extraClass);
  }

  if (message.msgAnimation) {
    if (message.msgAnimation.instantAnimation) {
      rowObj.classList.add('subliminalInstant');
    } else {
      rowObj.classList.add(animations[animationPosition]);

      if (message.msgAnimation.fixedAnimationSpeed === true) {
        animationPosition = 0;
      } else {
        animationPosition = (animationPosition >= animations.length) ? 0 : animationPosition + 1;
      }
    }

    if (subText) {
      rowObj.setAttribute('subMsg', subText);
    }
  }

  if (!getHideTimeStamp() && message.time && !message.skipTime) {
    rowObj.appendChild(generateSpan({
      text: generateTimeStamp(message.time),
      extraClass: 'timestamp',
    }));
  }

  if (!getHideRoomNames() && roomName && hideRooms.indexOf(roomName.toLowerCase()) === -1) {
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

  return rowObj;
}

function addText(text, row, message) {
  row.appendChild(generateSpan({
    text,
    linkable: message.linkable,
    keepInput: message.keepInput,
    replacePhrase: message.replacePhrase,
  }));
}

function addRow(message) {
  const defaultLanguage = getDefaultLanguage();
  const columns = message.columns || 1;
  // Set text depending on default language set. Empty means English
  let currentText = defaultLanguage === '' ? message.text : message[`text_${defaultLanguage}`];
  let currentSubText = defaultLanguage === '' ? message.subText : message[`subText_${defaultLanguage}`];

  // Fallback to English if there is no text in the default language
  if (!currentText) {
    currentText = message.text;
  }

  // Fallback to English if there is no text in the default language
  if (!currentSubText) {
    currentSubText = message.subText;
  }

  if (currentText && currentText.length > 0) {
    let subText;

    if (currentSubText && currentSubText.length > 0) {
      subText = currentSubText.shift();
    }

    const row = createRow(message, subText);
    let timeout;

    if (getFastMode()) {
      timeout = 20;
    } else if (message.timeout) {
      timeout = message.timeout;
    } else {
      timeout = rowTimeout;
    }

    for (let i = 0; i < columns; i++) {
      const text = currentText.shift();

      addText(text, row, message);

      if (currentText.length <= 0) {
        break;
      }
    }

    mainFeed.appendChild(row);
    scrollView();
    setTimeout(addRow, timeout, message);
  } else {
    if (message.morseCode) {
      const row = createRow(message.morseCode, { time: message.time });

      mainFeed.appendChild(row);
      scrollView();
    }

    consumeMessageShortQueue(); // eslint-disable-line no-use-before-define
  }
}

function consumeMessageShortQueue() {
  if (shortMessageQueue.length > 0) {
    const message = shortMessageQueue.shift();

    addRow(message, consumeMessageShortQueue);
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
    cmdInput.setAttribute('type', 'password');
  } else {
    cmdInput.setAttribute('type', 'text');
  }
}

function queueMessage(message) {
  messageQueue.push(message);
  consumeMessageQueue();
}

function copyString(text) {
  return text && text !== null ? JSON.parse(JSON.stringify(text)) : '';
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
  if (isHidden) {
    background.classList.add('hideCursor');
  } else {
    background.classList.remove('hideCursor');
  }

  setLocalVal('hiddenCursor', isHidden);
}

function isHiddenMenu() {
  return getLocalVal('hiddenMenu') === 'true';
}

function shouldHideMenu(isHidden) {
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

function setModeText(text) {
  modeField.textContent = `[${text}]`;
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

function getStaticInputStart() {
  return getLocalVal('staticInputStart') === 'true';
}

function shouldStaticInputStart(isStatic) {
  setLocalVal('staticInputStart', isStatic);
}

function setDefaultInputStart(value) {
  setLocalVal('defaultInputStart', value);
}

function setDefaultLanguage(languageCode) {
  setLocalVal('defaultLanguage', languageCode);
  labels.setLanguage(languageCode);
}

// TODO: Change name to setInputStartText or similar
function setInputStart(text) {
  inputStart.textContent = text.replace(/\s/g, '-').toLowerCase();
}

function setCoordinates(longitude, latitude) {
  setLocalVal('longitude', longitude);
  setLocalVal('latitude', latitude);

  if (map) {
    map.setCenter(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
  }
}

function getCoordinates() {
  return {
    latitude: parseFloat(getLocalVal('latitude')),
    longitude: parseFloat(getLocalVal('longitude')),
  };
}

function setDefaultZoomLevel(zoomLevel) {
  setLocalVal('defaultZoomLevel', zoomLevel);
}

function getDefaultZoomLevel() {
  return parseInt(getLocalVal('defaultZoomLevel'), 10);
}

function getDefaultInputStart() {
  return getLocalVal('defaultInputStart');
}

function resetCommand(aborted) {
  const room = getStaticInputStart() ? getDefaultInputStart() : (getRoom() || getDefaultInputStart());
  commandHelper.command = null;
  commandHelper.onStep = 0;
  commandHelper.maxSteps = 0;
  commandHelper.keysBlocked = false;
  commandHelper.data = null;
  commandHelper.hideInput = false;
  commandHelper.allowAutoComplete = false;

  if (aborted) {
    queueMessage({ text: labels.getText('errors', 'aborted') });
  }

  setInputStart(room);
  hideInput(false);
}

function refreshApp() {
  window.location.reload();
}

function queueCommand(command, data, commandMsg) {
  commandQueue.push({
    command,
    data,
    commandMsg,
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

  if (!getStaticInputStart()) {
    setInputStart(roomName);
  }

  queueMessage({
    text: [`Entered ${roomName}`],
    text_se: [`Gick in i ${roomName}`],
  });
}

function resetPreviousCommandPointer() {
  const commandHistory = getCommandHistory();

  previousCommandPointer = commandHistory ? commandHistory.length : 0;
}

function setGain(value) {
  gainNode.gain.value = value;
}

function playMorse(morseCode, silent) {
  function finishSoundQueue(timeouts) {
    const cleanMorse = morseCode.replace(/#/g, '');

    soundQueue.splice(0, timeouts);

    if (!silent) {
      queueMessage({
        text: [`Morse code message received: ${cleanMorse}`],
        text_se: [`Morse mottaget: ${cleanMorse}`],
      });
    }
  }

  let duration;
  let shouldPlay;

  if (soundQueue.length === 0) {
    soundTimeout = 0;
  }

  for (const code of morseCode) {
    shouldPlay = false;
    duration = 0;

    if (dot === code) {
      duration = 50;
      shouldPlay = true;
    } else if (dash === code) {
      duration = 150;
      shouldPlay = true;
    } else if (morseSeparator === code) {
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
      morseCodeText += `${morseCode[j]} `;
    }

    morseCodeText += '   ';
  }

  return morseCodeText;
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

function retrievePosition() {
  const clearingWatch = () => {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    trackingInterval = setTimeout(sendLocation, pausePositionTime); // eslint-disable-line no-use-before-define
  };

  watchId = navigator.geolocation.watchPosition((position) => {
    if (position !== undefined) {
      isTracking = true;
      positions.push(position);

      if (!mapMarkers.I) {
        mapMarkers.I = new google.maps.Marker({
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          title: '!',
          label: '!',
        });
      } else {
        mapMarkers.I.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      }
    }
  }, (err) => {
    console.log(err);
  }, { enableHighAccuracy: true });

  if (isTracking) {
    trackingInterval = setTimeout(clearingWatch, watchPositionTime);
  }
}

function sendLocation() {
  let mostAccuratePos;

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

    socket.emit('updateLocation', {
      type: 'user',
      position: preparePosition(mostAccuratePos),
    });
  }

  retrievePosition();
}

/**
 * Some devices disable Javascript when screen is off (iOS)
 * They also fail to notice that they have been disconnected
 * We check the time between heartbeats and if the time i
 * over 10 seconds (example: when screen is turned off and then on)
 * we force them to reconnect
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
 */
function setIntervals() {
  if (trackingInterval !== null) {
    clearTimeout(trackingInterval);
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  if (getGpsTracking() && navigator.geolocation) {
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

/**
 * Resets intervals and keyPressed (to not have it true after a user tabbed out and into the site)
 */
function refocus() {
  keyPressed = false;
  triggerKeysPressed.ctrl = false;
  triggerKeysPressed.alt = false;
  setIntervals();
}

function buildMorsePlayer() {
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
  return commands[commandName] ? commands[commandName].accessLevel : 1;
}

function getCommandVisibility(commandName) {
  return commands[commandName] ? commands[commandName].visibility : 1;
}

function getCommand(commandName) {
  const aliases = getAliases();
  let command;

  if (commands[commandName]) {
    command = commands[commandName];
  } else if (aliases[commandName]) {
    command = commands[aliases[commandName][0]];
  }

  return command;
}

function combineSequences(commandName, phrases) {
  const aliases = getAliases();

  return aliases[commandName] ? aliases[commandName].concat(phrases.slice(1)) : phrases.slice(1);
}

function expandPartialMatch(matchedCommands, partialMatch, sign) {
  const firstCommand = matchedCommands[0];
  let expanded = '';
  let matched = true;

  for (let i = partialMatch.length; i < firstCommand.length; i++) {
    const commandChar = firstCommand.charAt(i);

    for (let j = 0; j < matchedCommands.length; j++) {
      if (matchedCommands[j].charAt(i) !== commandChar) {
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

  return '';
}

function autoCompleteCommand() {
  const phrases = trimSpace(getInputText().toLowerCase()).split(' ');
  // TODO Change from Object.keys for compatibility with older Android
  const allCommands = Object.keys(commands).concat(Object.keys(getAliases()));
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

    for (const command of allCommands) {
      matches = false;

      for (let j = 0; j < partialCommand.length; j++) {
        const commandAccesssLevel = getCommandAccessLevel(command);
        const commandVisibility = getCommandVisibility(command);

        if ((isNaN(commandAccesssLevel) || getAccessLevel() >= commandAccesssLevel) && getAccessLevel() >= commandVisibility && partialCommand.charAt(j) === command.charAt(j)) {
          matches = true;
        } else {
          matches = false;

          break;
        }
      }

      if (matches) {
        matched.push(command);
      }
    }

    if (matched.length === 1) {
      const commandIndex = commandChars.indexOf(sign);

      if (commandIndex >= 0) {
        newText += commandChars[commandIndex];
      }

      newText += `${matched[0]} `;

      clearInput();
      setCommandInput(newText);
    } else if (matched.length > 0) {
      setCommandInput(expandPartialMatch(matched, partialCommand, sign));
      queueMessage({ text: [matched.join('\t')] });
    }

    // No input? Show all available commands
  } else if (partialCommand.length === 0) {
    commands.help.func();
  }
}

function printHelpMessage(command) {
  const helpMsg = { text: [] };
  const helpText = labels.getText('help', command);
  const instructionsText = labels.getText('instructions', command);

  if (helpText) {
    helpMsg.text = helpMsg.text.concat(helpText);
  }

  if (instructionsText) {
    helpMsg.text = helpMsg.text.concat(instructionsText);
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
    text: [`${getInputStart()}${getModeText()}$ ${inputText}`],
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
    commandName,
  };
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

function enterKeyHandler() {
  const commandObj = commandHelper;
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
          queueMessage({ text: [inputText] });
        }

        commands[commandObj.command].steps[commandObj.onStep](phrases, socket);
      }
    } else {
      phrases = trimSpace(inputText).split(' ');

      if (phrases[0].length > 0) {
        const command = retrieveCommand(phrases[0]);

        if (!getDisableCommands() && (command.command && (isNaN(command.command.accessLevel) || getAccessLevel() >= command.command.accessLevel))) {
          // Store the command for usage with up/down arrows
          pushCommandHistory(phrases.join(' '));

          /**
           * Print the help and instruction parts of the command
           */
          if (phrases[1] === '-help') {
            printHelpMessage(command.commandName);
          } else {
            if (command.command.steps) {
              commandObj.command = command.commandName;
              commandObj.maxSteps = command.command.steps.length;
            }

            if (command.command.clearBeforeUse) {
              commands.clear.func();
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
             * User input commandChar but didn't type
             * a proper command
             */
          } else {
            queueMessage({
              text: [`${phrases[0]}: ${labels.getText('errors', 'commandFail')}`],
            });
          }
        } else if (user === null) {
          queueMessage({ text: [phrases.toString()] });
          queueMessage({ text: labels.getText('info', 'mustRegister') });

          /**
           * Sent command was not found.
           * Print the failed input
           */
        } else if (command.commandName.length > 0) {
          pushCommandHistory(phrases.join(' '));
          queueMessage({
            text: [`- ${phrases[0]}: ${labels.getText('errors', 'commandFail')}`],
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
      case 8: {
        if (getInputText().length <= 1) {
          clearModeText();
        } else {
          changeModeText();
        }

        break;
      }
      // Tab
      case 9: {
        const phrases = getInputText().split(' ');

        keyPressed = true;

        if (!commandHelper.keysBlocked && commandHelper.command === null && phrases.length === 1) {
          autoCompleteCommand();
          changeModeText();
        } else if (commandHelper.allowAutoComplete || phrases.length === 2) {
          const command = commands[commandHelper.command] || retrieveCommand(phrases[0]).command;
          const partial = commandHelper.command ? phrases[0] : phrases[1];

          if (command && command.autocomplete) {
            switch (command.autocomplete.type) {
              case 'users': {
                socket.emit('matchPartialUser', { partialName: partial });

                break;
              }
              case 'rooms': {
                socket.emit('matchPartialRoom', { partialName: partial });

                break;
              }
              case 'myRooms': {
                socket.emit('matchPartialMyRoom', { partialName: partial });

                break;
              }
              default: {
                break;
              }
            }
          }
        }

        event.preventDefault();

        break;
      }
      // Enter
      case 13: {
        enterKeyHandler();

        event.preventDefault();

        break;
      }
      // Ctrl
      case 17: {
        triggerKeysPressed.ctrl = true;

        break;
      }
      // Alt
      case 18: {
        triggerKeysPressed.alt = true;

        break;
      }
      // Left Command key in OS X
      case 91: {
        triggerKeysPressed.ctrl = true;

        break;
      }
      // Right Command key in OS X
      case 93: {
        triggerKeysPressed.ctrl = true;

        break;
      }
      // Command key in OS X (Firefox)
      case 224: {
        triggerKeysPressed.ctrl = true;

        break;
      }
      // Delete
      case 46: {
        if (getInputText().length === 0) {
          clearModeText();
        } else {
          changeModeText();
        }

        event.preventDefault();

        break;
      }
      // Page up
      case 33: {
        background.scrollTop -= window.innerHeight;

        event.preventDefault();

        break;
      }
      // Page down
      case 34: {
        background.scrollTop += window.innerHeight;

        event.preventDefault();

        break;
      }
      // Up arrow
      case 38: {
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          background.scrollTop -= window.innerHeight;
        } else if (!commandHelper.keysBlocked && commandHelper.command === null && previousCommandPointer > 0) {
          clearInput();
          previousCommandPointer--;
          setCommandInput(commandHistory[previousCommandPointer]);
        }

        event.preventDefault();

        break;
      }
      // Down arrow
      case 40: {
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          background.scrollTop += window.innerHeight;
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
      }
      default: {
        break;
      }
    }
  } else {
    event.preventDefault();
  }
}

function defaultKeyPress(textChar, event) {
  if (textChar) {
    changeModeText();
  }

  if (triggerAutoComplete(getInputText(), textChar) && commandHelper.command === null) {
    autoCompleteCommand();
    // Prevent new whitespace to be printed
    event.preventDefault();
  }
}

function keyPress(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;
  const textChar = String.fromCharCode(keyCode);

  if (!keyPressed) {
    switch (keyCode) {
      case 102: {
        if (triggerKeysPressed.ctrl) {
          goFullScreen(document.documentElement);
          fullscreenResize(false);
          event.preventDefault();
        } else {
          defaultKeyPress(textChar, event);
        }

        break;
      }
      default: {
        defaultKeyPress(textChar, event);

        break;
      }
    }
  }
}

/**
 * Indicates that a key has been released and sets the corresponding flag
 * @param event key event from JS
 */
function keyReleased(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;

  switch (keyCode) {
    // Ctrl
    case 17: {
      triggerKeysPressed.ctrl = false;

      break;
    }
    // Alt
    case 18: {
      triggerKeysPressed.alt = false;

      break;
    }
    default: {
      keyPressed = false;

      break;
    }
  }
}

function attachMenuListener(menuItem, func, funcParam) {
  if (func) {
    menuItem.addEventListener('click', (event) => {
      func([funcParam]);
      clicked = true;
      cmdInput.focus();
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
      func: commands.help.func,
    },
    users: {
      itemName: 'USERS',
      func: commands.list.func,
      funcParam: 'users',
    },
    rooms: {
      itemName: 'ROOMS',
      func: commands.list.func,
      funcParam: 'rooms',
    },
  };

  for (const key of Object.keys(menuItems)) {
    const menuItem = menuItems[key];
    const listItem = createMenuItem(menuItem);

    attachMenuListener(listItem, menuItem.func, menuItem.funcParam);
    menuList.appendChild(listItem);
  }
}

function createCommandStart(commandName) {
  return [
    textTools.createFullLine(),
    ` ${commandName.toUpperCase()}`,
    textTools.createFullLine(),
  ];
}

function createCommandEnd() {
  return textTools.createFullLine();
}

function printWelcomeMessage() {
  if (!getFastMode()) {
    const mainLogo = labels.getMessage('logos', 'mainLogo');
    const razorLogo = labels.getMessage('logos', 'razor');

    queueMessage(mainLogo);
    queueMessage({ text: labels.getText('info', 'welcomeLoggedIn') });
    queueMessage({ text: labels.getText('info', 'razorHacked') });
    queueMessage(razorLogo);
  }
}

function printStartMessage() {
  if (!getFastMode()) {
    const mainLogo = labels.getMessage('logos', 'mainLogo');

    queueMessage(mainLogo);
    queueMessage({
      text: labels.getText('info', 'establishConnection'),
      extraClass: 'upperCase',
    });
    queueMessage({ text: labels.getText('info', 'welcome') });
  }
}

function attachFullscreenListener() {
  background.addEventListener('click', (event) => {
    clicked = !clicked;

    if (clicked) {
      cmdInput.focus();
    } else {
      cmdInput.blur();
    }

    if (getForceFullscreen() === true) {
      // Set whole document to full screen
      goFullScreen(document.documentElement);
      fullscreenResize(clicked);
    }

    event.preventDefault();
  });
}

function resetAllLocalVals() {
  removeCommandHistory();
  removeRoom();
  removeUser();
  setAccessLevel(0);
  setInputStart(getDefaultInputStart());
  previousCommandPointer = 0;
}

function hideMessageProperties(message = { }) {
  const modifiedMessage = message;
  const roomName = message.roomName;

  // TODO Change blank user and room to booleans instead of string removal
  if (message.extraClass === 'importantMsg') {
    modifiedMessage.roomName = '';
    modifiedMessage.userName = '';
    modifiedMessage.skipTime = true;
  } else if (message.extraClass === 'broadcastMsg') {
    modifiedMessage.roomName = '';
    modifiedMessage.userName = '';
  }

  if (roomName && roomName !== null) {
    const whisperIndex = roomName.indexOf('-whisper');

    if (whisperIndex >= 0) {
      if (message.userName === getUser()) {
        modifiedMessage.roomName = roomName.substring(0, whisperIndex);
      } else {
        modifiedMessage.roomName = 'whisper';
      }
    } else if (roomName.indexOf('-device') >= 0) {
      modifiedMessage.roomName = 'device';
    } else if (roomName.indexOf('team') >= 0) {
      modifiedMessage.roomName = 'team';
    }
  }

  return modifiedMessage;
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
    modifiedMessage.text.push(textTools.createFullLine());
  }

  return modifiedMessage;
}

// TODO Not all Android devices have touch screens
/**
 * @returns {boolean} Returns true if userAgent contains iPhone, iPad, iPod or Android
 */
function isTouchDevice() {
  return ((/iP(hone|ad|od)/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)));
}

function splitView(shouldSplit, secondDiv) {
  if (shouldSplit) {
    secondDiv.classList.remove('hide');
    background.classList.add('halfView');

    if (!isLandscape) {
      background.classList.add('halfHeight');
      secondDiv.classList.add('halfHeight');
    } else {
      background.classList.add('halfWidth');
      secondDiv.classList.add('halfWidth');
    }
  } else {
    secondDiv.classList.add('hide');
    background.classList.remove('halfView');
    background.classList.remove('halfWidth');
    background.classList.remove('halfHeight');
    secondDiv.classList.remove('halfWidth');
    secondDiv.classList.remove('halfHeight');
  }

  viewIsSplit = shouldSplit;
  secondView = secondDiv;
}

// TODO Major refactoring needed to break up legacy structure. It is not very pretty or understandable right now
function attachCommands() {
  commands.help = {
    func: (phrases) => {
      function getCommands() {
        const allCommands = [];
        // TODO Change from Object.keys for compatibility with older Android
        const keys = Object.keys(commands);

        for (let i = 0; i < keys.length; i++) {
          const commandName = keys[i];
          const commandAccessLevel = getCommandAccessLevel(commandName);
          const commandVisibility = getCommandVisibility(commandName);

          if (getAccessLevel() >= commandAccessLevel && getAccessLevel() >= commandVisibility) {
            allCommands.push(commandName);
          }
        }

        return allCommands.concat(Object.keys(getAliases())).sort();
      }

      function getAll() {
        const allCommands = getCommands();

        if (getUser() === null) {
          queueMessage({ text: labels.getText('info', 'useRegister') });
        }

        queueMessage({
          text: allCommands,
          linkable: true,
        });
      }

      if (undefined === phrases || phrases.length === 0) {
        queueMessage({ text: createCommandStart('help').concat(labels.getText('instructions', 'helpExtra')) });
      }

      getAll();
    },
    accessLevel: 1,
    category: 'basic',
  };
  commands.clear = {
    func: () => {
      while (mainFeed.childNodes.length > 1) {
        mainFeed.removeChild(mainFeed.lastChild);
      }
    },
    clearAfterUse: true,
    accessLevel: 13,
    category: 'basic',
  };
  commands.whoami = {
    func: () => {
      socket.emit('whoAmI');
    },
    accessLevel: 13,
    category: 'basic',
  };
  commands.msg = {
    func: (phrases) => {
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
          text: ['You forgot to type the message!'],
          text_se: ['Ni glömde skriva in ett meddelande!'],
        });
      }
    },
    clearAfterUse: true,
    accessLevel: 13,
    category: 'advanced',
  };
  commands.broadcast = {
    func: () => {
      commandHelper.data = {
        message: {
          text: [],
          title: [],
          hideName: true,
        },
      };

      queueMessage({ text: labels.getText('info', 'whoFrom') });
      queueMessage({ text: labels.getText('info', 'cancel') });
      setInputStart('broadcast');
    },
    steps: [
      (phrases) => {
        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');
          commandHelper.data.message.customSender = phrase;
        }

        queueMessage({ text: labels.getText('info', 'typeLineEnter') });
        commandHelper.onStep++;
      },
      (phrases) => {
        const message = commandHelper.data.message;
        let dataText;

        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');

          message.text.push(phrase);
        } else {
          dataText = copyString(message.text);
          commandHelper.onStep++;

          queueMessage({ text: labels.getText('info', 'preview') });
          queueMessage({ text: prependBroadcastMessage({ sender: message.customSender }).concat(dataText, textTools.createFullLine()) });
          queueMessage({ text: labels.getText('info', 'isThisOk') });
        }
      },
      (phrases) => {
        if (phrases.length > 0 && phrases[0].toLowerCase() === 'yes') {
          socket.emit('broadcastMsg', commandHelper.data);
          resetCommand();
        } else {
          resetCommand(true);
        }
      },
    ],
    accessLevel: 13,
    clearAfterUse: true,
    category: 'admin',
  };
  commands.follow = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const room = {
          roomName: phrases[0].toLowerCase(),
        };

        commandHelper.data = { room };
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
      (phrases) => {
        if (phrases.length > 0) {
          commandHelper.data.room.password = phrases[0];
        }

        socket.emit('follow', { room: commandHelper.data.room });
      },
    ],
    autocomplete: { type: 'rooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  commands.unfollow = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const room = {
          roomName: phrases[0].toLowerCase(),
        };

        if (room.roomName === getRoom()) {
          room.exited = true;
        }

        socket.emit('unfollow', { room });
      } else {
        queueMessage({
          text: ['You have to specify which room to unfollow'],
          text_se: ['Ni måste specificera vilket rum ni vill sluta följa'],
        });
      }
    },
    autocomplete: { type: 'myRooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  commands.list = {
    func: (phrases = []) => {
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
            text: [`${listOption} is not a valid type`],
            text_se: [`${listOption} är inte en giltig typ`],
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
    autocomplete: { type: 'lists' },
    accessLevel: 13,
    category: 'basic',
  };
  commands.mode = {
    func: (phrases, verbose) => {
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
                `Prepend commands with ${commandChars.join(' or ')}, example: ${commandChars[0]}mode`,
                'Everything else written and sent will be intepreted as a chat message',
                'You will no longer need to use msg command to type chat messages',
                'Use tab or type double space to see available commands and instructions',
                createCommandEnd(commandString.length),
              ]),
              text_se: createCommandStart(commandString).concat([
                `Lägg till ${commandChars.join(' eller ')} i början av varje kommando, exempel: ${commandChars[0]}mode`,
                'Allt annat ni skriver kommer att tolkas som chatmeddelanden',
                'Ni kommer inte längre behöva använda msg-kommandot för att skriva chatmeddelanden',
                'Använd tab-knappen eller skriv in två blanksteg för att se tillgängliga kommandon och instruktioner',
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
                `Commands can be used without ${commandChars[0]}`,
                'You have to use command msg to send messages',
                createCommandEnd(commandString.length),
              ]),
              text_se: createCommandStart(commandString).concat([
                `Kommandon kan användas utan ${commandChars[0]}`,
                'Ni måste använda msg-kommandot för att skriva chatmeddelanden',
                createCommandEnd(commandString.length),
              ]),
            });
          }

          socket.emit('updateMode', { mode: newMode });
        } else {
          queueMessage({
            text: [`${newMode} is not a valid mode`],
            text_se: [`${newMode} är inte ett giltigt alternativ`],
          });
        }
      } else {
        queueMessage({
          text: [`Current mode: ${getMode()}`],
          text_se: [`Nuvarande läge: ${getMode()}`],
        });
      }
    },
    autocomplete: { type: 'modes' },
    accessLevel: 13,
    category: 'advanced',
  };
  commands.register = {
    func: (phrases = []) => {
      const data = {};

      if (getUser() === null) {
        const userName = phrases[0];

        if (userName && userName.length >= 2 && userName.length <= 6 && isTextAllowed(userName)) {
          data.user = {
            userName,
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
              'Name has to be 2 to 6 characters long',
              'The name can only contain letters and numbers (a-z, 0-9)',
              'Don\'t use whitespace in your name!',
              'example: register myname',
            ],
            text_se: [
              'Namnet behöver vara 2 till 6 tecken långt',
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
            `${getUser()} is registered and logged in`,
          ],
          text_se: [
            'Ni har redan registrerat en användare',
            `${getUser()} är registrerad och inloggad`,
          ],
        });
      }
    },
    steps: [
      () => {
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
        queueMessage({ text: labels.getText('info', 'cancel') });
        setInputStart('password');
        commandHelper.onStep++;
      },
      (phrases = []) => {
        const password = phrases[0];

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
      (phrases = []) => {
        const password = phrases[0];

        if (password === commandHelper.data.user.password) {
          queueMessage({ text: labels.getText('info', 'congratulations') });
          socket.emit('register', commandHelper.data);
          commands[commandHelper.command].abortFunc();
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
    abortFunc: () => {
      hideInput(false);
    },
    accessLevel: 0,
    category: 'login',
  };
  commands.createroom = {
    func: (phrases = ['']) => {
      if (phrases.length > 0) {
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
          queueMessage({ text: labels.getText('errors', 'failedRoom') });
        }
      } else {
        resetCommand(true);
        queueMessage({ text: labels.getText('errors', 'failedRoom') });
      }
    },
    steps: [
      (phrases = ['']) => {
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
      (phrases = ['']) => {
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
    accessLevel: 13,
    category: 'advanced',
  };
  commands.myrooms = {
    func: () => {
      const data = { user: {}, device: {} };

      data.user.userName = getUser();
      data.device.deviceId = getDeviceId();

      socket.emit('myRooms', data);
    },
    accessLevel: 13,
    category: 'advanced',
  };
  commands.login = {
    func: (phrases) => {
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
      (phrases) => {
        commandHelper.data.user.password = phrases[0];
        socket.emit('login', commandHelper.data);
        commands[commandHelper.command].abortFunc();
        commands.clear.func();
        resetCommand();
      },
    ],
    abortFunc: () => {
      hideInput(false);
    },
    clearAfterUse: true,
    accessLevel: 0,
    category: 'login',
  };
  commands.time = {
    func: () => {
      socket.emit('time');
    },
    accessLevel: 13,
    category: 'basic',
  };
  commands.history = {
    func: (phrases) => {
      const data = {};

      if (phrases.length > 0) {
        if (!isNaN(phrases[0]) || phrases[0] === '*') {
          data.lines = phrases[0];
        } else {
          data.room = { roomName: phrases[0] };

          if (phrases.length > 1 && (!isNaN(phrases[1]) || phrases[1] === '*')) {
            data.lines = phrases[1];
          }
        }
      }

      socket.emit('history', data);
    },
    clearAfterUse: true,
    clearBeforeUse: true,
    accessLevel: 1,
    category: 'advanced',
  };
  commands.morse = {
    func: (phrases, local) => {
      if (phrases && phrases.length > 0) {
        const data = {
          local,
        };
        const morsePhrases = phrases;

        for (let i = 0; i < phrases.length; i++) {
          if (phrases[i] === '-s' || phrases[i] === '-silent') {
            morsePhrases.splice(i, 1);
            data.silent = true;
          }
        }

        const morseCodeText = parseMorse(morsePhrases.join(' ').toLowerCase());

        if (morseCodeText.length > 0) {
          data.morseCode = morseCodeText;

          socket.emit('morse', data);
        }
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.password = {
    func: () => {
      commandHelper.hideInput = true;

      hideInput(true);
      setInputStart('Old passwd');
      queueMessage({ text: labels.getText('info', 'cancel') });
      queueMessage({
        text: ['Enter your current password'],
        text_se: ['Skriv in ert nuvarande lösenord'],
      });
    },
    steps: [
      (phrases = ['']) => {
        const data = {};
        const oldPassword = phrases[0];
        data.oldPassword = oldPassword;
        commandHelper.data = data;
        commandHelper.onStep++;

        setInputStart('New pass');
        socket.emit('checkPassword', data);
      },
      (phrases = []) => {
        commandHelper.data.newPassword = phrases[0];
        commandHelper.onStep++;

        setInputStart('Repeat passwd');
        queueMessage({
          text: ['Repeat your new password'],
          text_se: ['Skriv in ert nya lösenord igen'],
        });
      },
      (phrases = []) => {
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
    abortFunc: () => {
      hideInput(false);
    },
    accessLevel: 13,
    category: 'basic',
  };
  commands.logout = {
    func: () => {
      socket.emit('logout');
    },
    accessLevel: 13,
    category: 'basic',
    clearAfterUse: true,
  };
  commands.reboot = {
    func: () => {
      refreshApp();
    },
    accessLevel: 1,
    category: 'basic',
  };
  commands.verifyuser = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();

        if (userName === '*') {
          socket.emit('verifyAllUsers');
        } else {
          const data = { user: { userName } };

          socket.emit('verifyUser', data);
        }
      } else {
        socket.emit('unverifiedUsers');
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.verifyteam = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const teamName = phrases[0].toLowerCase();

        if (teamName === '*') {
          socket.emit('verifyAllTeams');
        } else {
          const data = { team: { teamName } };

          socket.emit('verifyTeam', data);
        }
      } else {
        socket.emit('unverifiedTeams');
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.banuser = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();
        const data = { user: { userName } };

        socket.emit('ban', data);
      } else {
        socket.emit('bannedUsers');
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.unbanuser = {
    func: (phrases) => {
      if (phrases.length > 0) {
        const userName = phrases[0].toLowerCase();
        const data = { user: { userName } };

        socket.emit('unban', data);
      } else {
        socket.emit('bannedUsers');
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.whisper = {
    func: (phrases) => {
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
          text: ['You forgot to type the message!'],
          text_se: ['Ni glömde skriva in ett meddelande!'],
        });
      }
    },
    clearAfterUse: true,
    autocomplete: { type: 'users' },
    accessLevel: 13,
    category: 'basic',
  };
  commands.hackroom = {
    func: (phrases) => {
      const data = {};
      const razorLogo = labels.getMessage('logos', 'razor');

      if (phrases.length > 0) {
        data.roomName = phrases[0].toLowerCase();
        data.timesCracked = 0;
        data.timesRequired = 3;
        commandHelper.data = data;

        // TODO: razorLogo should be moved to DB or other place
        queueMessage(razorLogo);
        // TODO: Message about abort should be sent from a common function for all commands
        queueMessage({ text: labels.getText('info', 'hackRoomIntro') });
        queueMessage({ text: labels.getText('info', 'cancel') });
        queueMessage({ text: labels.getText('info', 'pressEnter') });

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
      () => {
        const data = {
          room: { roomName: commandHelper.data.roomName },
        };

        queueMessage({
          text: ['Checking room access...'],
          text_se: ['Undersöker rummet...'],
        });
        socket.emit('roomHackable', data);
      },
      () => {
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
                `User ${getUser()} tried breaking in`,
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
            `Time until detection: ${timeout / 1000} seconds`,
            'Level 3 security protection detected',
            '3 sequences required',
          ],
          text_se: [
            'Aktiverar botten....',
            'Varning. Försvarssystem mot intrång har aktiverats',
            `Antal sekunder innan intråget upptäcks: ${timeout / 1000} sekunder`,
            'Level 3 försvarssystem upptäckt',
            '3 sekvenser krävs',
          ],
        });
        setInputStart('Verify seq');
        commandObj.data.code = textTools.createCharString(10);
        commandObj.data.timer = setTimeout(timerEnded, timeout);
        commandObj.onStep++;
        queueMessage({
          text: [`Sequence: ${commandObj.data.code}`],
          text_en: [`Sekvens: ${commandObj.data.code}`],
        });
      },
      (phrases) => {
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
          commandObj.data.code = textTools.createCharString(10);
          queueMessage({
            text: [`Sequence: ${commandObj.data.code}`],
            text_se: [`Sekvens: ${commandObj.data.code}`],
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
    abortFunc: () => {
      clearTimeout(commandHelper.data.timer);
    },
    clearBeforeUse: true,
    accessLevel: 13,
    category: 'hacking',
  };
  commands.importantmsg = {
    func: () => {
      const data = {
        message: {
          text: [],
          userName: getUser(),
          hideName: true,
        },
      };
      commandHelper.data = data;

      queueMessage({ text: labels.getText('info', 'cancel') });
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
      (phrases) => {
        if (phrases.length > 0) {
          const deviceId = phrases[0];

          if (deviceId.length > 0) {
            commandHelper.data.device = { deviceId };
            queueMessage({
              text: ['Searching for device...'],
              text_se: ['Letar efter enheten...'],
            });
            socket.emit('verifyDevice', commandHelper.data);
          } else {
            commandHelper.onStep++;
            commands[commandHelper.command].steps[commandHelper.onStep]();
          }
        }
      },
      () => {
        commandHelper.onStep++;
        queueMessage({ text: labels.getText('info', 'typeLineEnter') });
        queueMessage({ text: labels.getText('info', 'keepShortMorse') });
      },
      (phrases) => {
        const message = commandHelper.data.message;

        if (phrases.length > 0 && phrases[0] !== '') {
          const phrase = phrases.join(' ');

          message.text.push(phrase);
        } else {
          const dataText = copyString(message.text);
          commandHelper.onStep++;

          queueMessage({ text: labels.getText('info', 'preview') });
          queueMessage({
            text: dataText,
            extraClass: 'importantMsg',
          });
          queueMessage({ text: labels.getText('info', 'isThisOk') });
        }
      },
      (phrases) => {
        if (phrases.length > 0) {
          if (phrases[0].toLowerCase() === 'yes') {
            commandHelper.onStep++;

            queueMessage({ text: labels.getText('info', 'sendMorse') });
          } else {
            resetCommand(true);
          }
        }
      },
      (phrases) => {
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
    accessLevel: 13,
    category: 'admin',
  };
  commands.chipper = {
    func: () => {
      queueMessage({
        text: [
          textTools.createFullLine(),
          '- DEACTIVATE -',
          textTools.createFullLine(),
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
      queueMessage({ text: labels.getText('info', 'cancel') });
      queueMessage({ text: labels.getText('info', 'pressEnter') });
      setInputStart('Chipper');
    },
    steps: [
      () => {
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
        setTimeout(commands[commandObj.command].steps[commandObj.onStep], 2000);
      },
      () => {
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

          commands[commandObj.command].abortFunc();
        };

        if (commandObj.data.timer === undefined) {
          commandObj.data.timer = setTimeout(stopFunc, 20000, false);
        }

        queueMessage({ text: [textTools.createBinaryString(36)] });

        commandObj.data.printTimer = setTimeout(commands[commandObj.command].steps[commandObj.onStep], 250);
      },
    ],
    abortFunc: () => {
      const commandObj = commandHelper;

      if (commandObj.data) {
        clearTimeout(commandObj.data.printTimer);
        clearTimeout(commandObj.data.timer);
      }

      commands.clear.func();
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
    accessLevel: 13,
    category: 'hacking',
    clearBeforeUse: true,
  };
  commands.room = {
    func: (phrases) => {
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
    autocomplete: { type: 'myRooms' },
    accessLevel: 13,
    category: 'advanced',
  };
  commands.removeroom = {
    func: (phrases) => {
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
      (phrases) => {
        if (phrases[0].toLowerCase() === 'yes') {
          socket.emit('removeRoom', commandHelper.data);
        }

        resetCommand();
      },
    ],
    accessLevel: 13,
    category: 'advanced',
  };
  commands.updateuser = {
    func: (phrases) => {
      const data = { user: {} };

      if (phrases.length > 2) {
        data.user.userName = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateUser', data);
      } else {
        queueMessage({
          text: [
            'You need to type a user name, field name and value',
            'Example: updateuser user1 accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett användarnamn, fältnamn och värde',
            'Exempel: updateuser user1 accesslevel 3',
          ],
        });
      }
    },
    autocomplete: { type: 'users' },
    accessLevel: 13,
    category: 'admin',
  };
  commands.updatecommand = {
    func: (phrases) => {
      const data = {};

      if (phrases.length > 2) {
        data.command = { commandName: phrases[0] };
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateCommand', data);
      } else {
        queueMessage({
          text: [
            'You need to type a command name, field name and value',
            'Example: updatecommand help accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett kommandonamn, fältnamn och värde',
            'Exempel: updatecommand help accesslevel 3',
          ],
        });
      }
    },
    accessLevel: 13,
    category: 'admin',
  };
  commands.updateroom = {
    func: (phrases) => {
      const data = { room: {} };

      if (phrases.length > 2) {
        data.room.roomName = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateRoom', data);
      } else {
        queueMessage({
          text: [
            'You need to type a room name, field name and value',
            'Example: updateroom room1 accesslevel 3',
          ],
          text_se: [
            'Ni måste skriva in ett rumsnamn, fältnamn och värde',
            'Exempel: updateroom room1 accesslevel 3',
          ],
        });
      }
    },
    autocomplete: { type: 'rooms' },
    accessLevel: 13,
    category: 'admin',
  };
  commands.weather = {
    func: () => {
      socket.emit('weather');
    },
    accessLevel: 1,
    category: 'basic',
  };
  commands.updatedevice = {
    func: (phrases) => {
      const data = { device: {} };

      if (phrases.length > 2) {
        data.device.deviceId = phrases[0];
        data.field = phrases[1];
        data.value = phrases[2];

        socket.emit('updateDevice', data);
      } else {
        queueMessage({
          text: [
            'You need to type a device Id, field name and value',
            'Example: updatedevice 11jfej433 id betteralias',
          ],
          text_se: [
            'Ni måste skriva in ett enhets-ID, fältnamn och värde',
            'Exempel: updatedevice 11jfej433 id betteralias',
          ],
        });
      }
    },
    autocomplete: { type: 'devices' },
    accessLevel: 13,
    category: 'admin',
  };
  commands.createteam = {
    func: (phrases) => {
      const data = { team: { teamName: '' } };

      if (phrases.length > 0) {
        data.team.teamName = phrases.join(' ');
        commandHelper.data = data;
        queueMessage({ text: labels.getText('info', 'cancel') });
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
      () => {
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
      (phrases) => {
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
    accessLevel: 13,
    category: 'basic',
    autocomplete: { type: 'users' },
  };
  commands.invitations = {
    func: () => {
      socket.emit('getInvitations');
    },
    steps: [
      (data) => {
        const sentInvitations = data.invitations;
        const text = [];
        commandHelper.data = data;

        if (sentInvitations.length > 0) {
          for (let i = 0; i < sentInvitations.length; i++) {
            const invitation = sentInvitations[i];
            const itemNumber = i + 1;

            text.push(`<${itemNumber}> Join ${invitation.invitationType} ${invitation.itemName}. Sent by ${invitation.sender}`);
          }

          queueMessage({ text: createCommandStart('Invitations').concat(text, createCommandEnd()) });
          queueMessage({
            text: ['Answer the invite with accept or decline. Example: 1 decline'],
            text_se: ['Besvara inbjudan med accept eller decline. Exempel: 1 decline'],
          });
          queueMessage({ text: labels.getText('info', 'cancel') });
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
      (phrases) => {
        if (phrases.length > 1) {
          const itemNumber = phrases[0] - 1;
          const answer = phrases[1].toLowerCase();
          const invitation = commandHelper.data.invitations[itemNumber];

          if (['accept', 'a', 'decline', 'd'].indexOf(answer) > -1) {
            const accepted = ['accept', 'a'].indexOf(answer) > -1;
            const data = { accepted, invitation };

            switch (invitation.invitationType) {
              case 'team': {
                socket.emit('teamAnswer', data);

                break;
              }
              case 'room': {
                socket.emit('roomAnswer', data);

                break;
              }
              default: {
                break;
              }
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
    accessLevel: 13,
    category: 'basic',
  };
  commands.inviteteam = {
    func: (phrases) => {
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
    accessLevel: 13,
    category: 'basic',
  };
  commands.inviteroom = {
    func: (phrases) => {
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
    accessLevel: 13,
    category: 'basic',
  };
  commands.alias = {
    func: (phrases) => {
      const aliasName = phrases.shift();
      const sequence = phrases;
      const aliases = getAliases();
      const commandKeys = Object.keys(commands);

      if (aliasName && sequence && commandKeys.indexOf(aliasName) === -1) {
        aliases[aliasName] = sequence;
        setAliases(aliases);
      } else if (commandKeys.indexOf(aliasName) > -1) {
        queueMessage({
          text: [`${aliasName} is a built-in command. You may not override built-in commands`],
          text_se: [`${aliasName} är ett inbyggt kommando. Inbyggda kommandon kan inte ersättas`],
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
    accessLevel: 13,
    category: 'basic',
  };
  commands.settings = {
    func: (phrases = []) => {
      if (phrases.length > 1) {
        const setting = phrases[0];
        const value = phrases[1] === 'on';

        switch (setting) {
          case 'fastmode': {
            setFastMode(value);

            if (value) {
              queueMessage({ text: labels.getText('info', 'fastModeOn') });
            } else {
              queueMessage({ text: labels.getText('info', 'fastModeOff') });
            }

            break;
          }
          case 'hiddencursor': {
            shouldHideCursor(value);

            if (value) {
              queueMessage({ text: labels.getText('info', 'hiddenCursorOn') });
            } else {
              queueMessage({ text: labels.getText('info', 'hiddenCursorOff') });
            }

            break;
          }
          case 'hiddenmenu': {
            shouldHideMenu(value);

            if (value) {
              queueMessage({ text: labels.getText('info', 'hiddenMenuOn') });
            } else {
              queueMessage({ text: labels.getText('info', 'hiddenMenuOff') });
            }

            break;
          }
          case 'hiddencmdinput': {
            shouldHideCmdInput(value);

            if (value) {
              queueMessage({ text: labels.getText('info', 'hiddenCmdInputOn') });
            } else {
              queueMessage({ text: labels.getText('info', 'hiddenCmdInputOff') });
            }

            break;
          }
          case 'thinnerview': {
            shouldThinView(value);

            if (value) {
              queueMessage({ text: labels.getText('info', 'thinnerViewOn') });
            } else {
              queueMessage({ text: labels.getText('info', 'thinnerViewOff') });
            }

            break;
          }
          default: {
            queueMessage({ text: labels.getText('errors', 'invalidSetting') });

            break;
          }
        }
      } else {
        queueMessage({ text: labels.getText('errors', 'settingUsage') });
      }
    },
    accessLevel: 1,
    visibility: 13,
    category: 'admin',
  };
  commands.radio = {
    func: (phrases = []) => {
      if (phrases.length === 0) {
        queueMessage({
          text: labels.getText('instructions', 'radio'),
        });

        return;
      }

      const channels = {
        metal: 'http://69.4.232.118:80/live;',
      };
      const choice = phrases[0];
      let path;

      switch (choice) {
        case 'on': {
          const chosenChannel = phrases[1];
          path = channels[chosenChannel];

          break;
        }
        case 'list': {
          queueMessage({ text: Object.keys(channels) });

          break;
        }
        case 'off': {
          audio.resetAudio();

          break;
        }
        default: {
          break;
        }
      }

      if (path) {
        audio.playAudio({ path });
      } else {
        queueMessage({
          text: labels.getText('instructions', 'radio'),
        });
      }
    },
    visibility: 0,
    accessLevel: 0,
    category: 'basic',
  };
  commands.map = {
    func: (phrases = []) => {
      const gameCoords = getCoordinates();

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {
            lat: gameCoords.latitude,
            lng: gameCoords.longitude,
          },
          zoom: getDefaultZoomLevel(),
          disableDefaultUI: true,
          draggable: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
          mapTypeControl: false,
          noClear: true,
          zoomControl: false,
          disableDoubleClickZoom: true,
          panControl: false,
          overviewMapControl: false,
          rotateControl: false,
          scaleControl: false,
          scrollwheel: false,
          streetViewControl: false,
          backgroundColor: '#001e15',
          styles: [
            {
              featureType: 'all',
              elementType: 'all',
              stylers: [
                { color: '#001e15' },
              ],
            }, {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [
                { color: '#00ffcc' },
              ],
            }, {
              featureType: 'road',
              elementType: 'labels',
              stylers: [
                { visibility: 'off' },
              ],
            }, {
              featureType: 'poi',
              elementType: 'all',
              stylers: [
                { visibility: 'off' },
              ],
            }, {
              featureType: 'administrative',
              elementType: 'all',
              stylers: [
                { visibility: 'off' },
              ],
            }, {
              featureType: 'water',
              elementType: 'all',
              stylers: [
                { color: '#00ffcc' },
              ],
            },
          ],
        });

        for (const markerName of Object.keys(mapMarkers)) {
          mapMarkers[markerName].setMap(map);
        }
      }

      if (phrases.length > 0) {
        const choice = phrases[0];
        const mapDiv = document.getElementById('map');

        switch (choice) {
          case 'on': {
            splitView(true, mapDiv);

            break;
          }
          case 'off': {
            splitView(false, mapDiv);

            break;
          }
          default: {
            break;
          }
        }

        scrollView();

        if (!map) {
          initMap();
          socket.emit('getMapPositions', { types: ['static', 'users'] });
        }
      }
    },
    accessLevel: 1,
    visibility: 1,
    category: 'advanced',
  };
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
      commands.morse.func(message.text.slice(0, 1), message.morse.local);
    }
  }
}

/*
 * Triggers when the connection is lost and then re-established
 */
function onReconnect() {
  clearTimeout(serverDownTimeout);
  reconnect();
}

function onDisconnect() {
  const serverDown = () => {
    if (getUser()) {
      printWelcomeMessage();
    } else {
      printStartMessage();
    }
  };

  queueMessage({
    text: labels.getText('info', 'lostConnection'),
  });
  serverDownTimeout = setTimeout(serverDown, 300000);
}

function onFollow(data = { room: {} }) {
  const room = data.room;

  if (room.entered) {
    enterRoom(room.roomName);
  } else {
    queueMessage({
      text: [`Following ${room.roomName}`],
      text_se: [`Följer ${room.roomName}`],
    });
  }
}

function onUnfollow(data = { room: { roomName: '' } }) {
  const room = data.room;

  queueMessage({
    text: [`Stopped following ${room.roomName}`],
    text_se: [`Slutade följa ${room.roomName}`],
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
  const mode = user.mode || cmdMode;

  commands.clear.func();
  setUser(user.userName);
  setAccessLevel(user.accessLevel);
  queueMessage({
    text: [`Successfully logged in as ${user.userName}`],
    text_se: [`Lyckades logga in som ${user.userName}`],
  });
  printWelcomeMessage();
  commands.mode.func([mode]);

  socket.emit('updateDeviceSocketId', {
    device: {
      deviceId: getDeviceId(),
    },
    user: {
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

    commands[commandHelper.command].steps[commandHelper.onStep](data, socket);
  } else {
    resetCommand(false);
  }
}

function onCommandFail() {
  if (commandHelper.command !== null) {
    const abortFunc = commands[commandHelper.command].abortFunc;

    if (abortFunc) {
      abortFunc();
    }

    resetCommand(true);
  }
}

function onReconnectSuccess(data) {
  if (!data.anonUser) {
    const mode = data.user.mode || cmdMode;
    const room = getRoom();

    commands.mode.func([mode], false);
    setAccessLevel(data.user.accessLevel);

    if (!data.firstConnection) {
      queueMessage({
        text: labels.getText('info', 'reestablished'),
      });
    } else {
      printWelcomeMessage();

      if (room) {
        commands.room.func([room]);
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
        userName: getUser(),
      },
    });
  } else {
    if (!data.firstConnection) {
      queueMessage({
        text: ['Re-established connection'],
        text_se: ['Lyckades återansluta'],
      });
    } else {
      printStartMessage();
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
        `Didn't find user ${currentUser} in database`,
        'Resetting local configuration',
      ],
      text_se: [
        `Kunde inte hitta användaren ${currentUser} i databasen`,
        'Återställer lokala konfigurationen',
      ],
    });
  }

  resetAllLocalVals();
}

function onMorse(data = {}) {
  playMorse(data.morseCode, data.silent);
}

function onTime(data = {}) {
  queueMessage({
    text: [`Time: ${generateTimeStamp(data.time, true, true)}`],
    text_en: [`Tid: ${generateTimeStamp(data.time, true, true)}`],
  });
}

function onLocationMsg(locationData) {
  for (const user of Object.keys(locationData)) {
    const position = locationData[user].position;
    const latitude = position.latitude;
    const longitude = position.longitude;
    const heading = !isNaN(position.heading) && position.heading !== null ? Math.round(position.heading) : null;
    const accuracy = position.accuracy < 1000 ? Math.ceil(position.accuracy) : 'BAD';
    let text = '';

    text += `User: ${user}${'\t'}`;
    text += `Time: ${generateTimeStamp(position.timestamp, true)}${'\t'}`;
    text += `Accuracy: ${accuracy} ${accuracy !== 'BAD' ? 'meters' : ''}${'\t'}`;
    text += `Coordinates: ${latitude}, ${longitude}${'\t'}`;

    if (heading !== null) {
      text += `Heading: ${heading} deg.`;
    }

    queueMessage({ text: [text] });
  }
}

function onBan() {
  queueMessage({
    text: labels.getText('info', 'youHaveBeenBanned'),
    extraClass: 'importantMsg',
  });
  resetAllLocalVals();
}

function onLogout() {
  commands.clear.func();
  resetAllLocalVals();
  socket.emit('followPublic');

  if (commands) {
    printStartMessage();
  }
}

function onUpdateCommands(data = { commands: [] }) {
  const newCommands = data.commands;

  for (let i = 0; i < newCommands.length; i++) {
    const newCommand = newCommands[i];
    const oldCommand = commands[newCommand.commandName];

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
    const precipitation = weatherInstance.precipitation === 0 ? 'Light ' : `${weatherInstance.precipitation}mm `;
    let coverage;
    let precipType;
    weatherString = '';

    switch (weatherInstance.precipType) {
      // None
      case 0: {
        break;
      }
      // Snow
      case 1: {
        precipType = labels.getString('weather', 'snow');

        break;
      }
      // Snow + rain
      case 2: {
        precipType = labels.getString('weather', 'snowRain');

        break;
      }
      // Rain
      case 3: {
        precipType = labels.getString('weather', 'rain');

        break;
      }
      // Drizzle
      case 4: {
        precipType = labels.getString('weather', 'drizzle');

        break;
      }
      // Freezing rain
      case 5: {
        precipType = labels.getString('weather', 'freezeRain');

        break;
      }
      // Freezing drizzle
      case 6: {
        precipType = labels.getString('weather', 'freezeDrizzle');

        break;
      }
      default: {
        break;
      }
    }

    switch (weatherInstance.cloud) {
      case 0:
      case 1:
      case 2:
      case 3: {
        coverage = labels.getString('weather', 'light');

        break;
      }
      case 4:
      case 5:
      case 6: {
        coverage = labels.getString('weather', 'moderate');

        break;
      }
      case 7:
      case 8:
      case 9: {
        coverage = labels.getString('weather', 'high');

        break;
      }
      default: {
        break;
      }
    }

    weatherString += `${day}/${month} ${hours}:00${'\t'}`;
    weatherString += `${labels.getString('weather', 'temperature')}: ${temperature}${'\xB0C\t'}`;
    weatherString += `${labels.getString('weather', 'visibility')}: ${weatherInstance.visibility}km ${'\t'}`;
    weatherString += `${labels.getString('weather', 'direction')}: ${weatherInstance.windDirection}${'\xB0\t'}`;
    weatherString += `${labels.getString('weather', 'speed')}: ${windSpeed}m/s${'\t'}`;
    weatherString += `${labels.getString('weather', 'pollution')}: ${coverage}${'\t'}`;

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
    `User: ${data.user.userName}`,
    `Access level: ${data.user.accessLevel}`,
    `Team: ${team}`,
    `Device ID: ${getDeviceId()}`,
    createCommandEnd('whoami'),
  ]);

  queueMessage({ text });
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
      columns: data.columns,
      extraClass: 'columns',
    },
  });
}

function onMatchFound(data = { matchedName: '', defaultLanguage: '' }) {
  replaceLastInputPhrase(`${data.matchedName} `);
}

function onMapPositions(mapPositions = []) {
  for (const mapPosition of mapPositions) {
    if (mapPosition.positionName.toLowerCase() === getUser().toLowerCase()) {
      continue;
    }

    const positionName = mapPosition.positionName;
    const latitude = parseFloat(mapPosition.position.latitude);
    const longitude = parseFloat(mapPosition.position.longitude);

    if (mapMarkers[positionName]) {
      mapMarkers[positionName].setPosition(new google.maps.LatLng(latitude, longitude));
    } else {
      mapMarkers[positionName] = new google.maps.Marker({
        position: {
          lat: latitude,
          lng: longitude,
        },
        title: positionName,
        label: positionName[0],
      });

      if (map) {
        mapMarkers[positionName].setMap(map);
      }
    }
  }
}

/**
 * Called from server on client connection
 * Sets configuration properties from server and starts the rest of the app
 */
function onStartup(params = { }) {
  setDefaultLanguage(params.defaultLanguage);
  shouldForceFullscreen(params.forceFullscreen);
  shouldGpsTrack(params.gpsTracking);
  shouldDisableCommands(params.disableCommands);
  shouldHideRoomNames(params.hideRoomNames);
  shouldHideTimeStamp(params.hideTimeStamp);
  shouldStaticInputStart(params.staticInputStart);
  setDefaultInputStart(params.defaultInputStart);
  shouldHideCursor(isHiddenCursor());
  shouldHideMenu(isHiddenMenu());
  shouldHideCmdInput(isHiddenCmdInput());
  shouldThinView(isThinView());
  setCoordinates(params.longitude, params.latitude);
  setDefaultZoomLevel(params.defaultZoomLevel);

  socket.emit('getCommands');
  labels.setLanguage(getDefaultLanguage());

  if (firstConnection) {
    attachCommands();
    populateMenu();

    if (!isTouchDevice()) {
      cmdInput.focus();
    } else {
      background.classList.add('fullscreen');
    }

    if (!getDeviceId()) {
      setDeviceId(textTools.createDeviceId());
    }

    setInterval(() => {
      socket.emit('updateDeviceLastAlive', { device: { deviceId: getDeviceId(), lastAlive: new Date() } });
    }, 5000);

    attachFullscreenListener();
    addEventListener('keypress', keyPress);
    // Needed for some special keys. They are not detected with keypress
    addEventListener('keydown', specialKeyPress);
    addEventListener('keyup', keyReleased);
    addEventListener('orientationchange', () => {
      isLandscape = !isLandscape;

      if (viewIsSplit) {
        if (!isLandscape) {
          background.classList.remove('halfWidth');
          secondView.classList.remove('halfWidth');
          background.classList.add('halfHeight');
          secondView.classList.add('halfHeight');
        } else {
          background.classList.remove('halfHeight');
          secondView.classList.remove('halfHeight');
          background.classList.add('halfWidth');
          secondView.classList.add('halfWidth');
        }
      }

      scrollView();
    });
    window.addEventListener('focus', refocus);

    resetPreviousCommandPointer();
    setIntervals();
    buildMorsePlayer();

    if (!getAccessLevel()) {
      setAccessLevel(0);
    }

    if (!getUser()) {
      setInputStart(getDefaultInputStart());
      socket.emit('updateDeviceSocketId', {
        device: { deviceId: getDeviceId() },
        user: {
          userName: 'NO_USER_LOGGED_IN',
        },
      });
    }

    socket.emit('updateId', {
      user: { userName: getUser() },
      firstConnection: true,
      device: { deviceId: getDeviceId() },
    });

    firstConnection = false;
  }
}

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
    socket.on('mapPositions', onMapPositions);
    // socket.on('missions', onMissions);
  }
}

startSocket();
