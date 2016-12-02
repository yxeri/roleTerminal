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

const labels = require('./labels');
const textTools = require('./textTools');
const mapTools = require('./mapTools');
const storage = require('./storage');
const layoutChanger = require('./layoutChanger');
const socketHandler = require('./socketHandler');
const messenger = require('./messenger');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');
const clickHandler = require('./clickHandler');
const videoPlayer = require('./videoPlayer');
const roomHandler = require('./roomHandler');

/**
 * Queue of all the commands used by the user that will be handled and printed
 * @type {Object[]}
 */
const commandQueue = [];
/**
 * Check every * amount of milliseconds to see if Javascript is still responding
 * It will trigger a function if the response is delayed
 * @type {Number}
 */
const screenOffTimeoutTime = 1000;
/**
 * Get GPS coordinates for * amount of milliseconds
 * @type {Number}
 */
const watchPositionTime = 15000;
/**
 * Get GPS coordinates every * milliseconds
 * @type {Number}
 */
const pausePositionTime = 20000;
/**
 * Queue of all sounds to be consumed and played
 * @type {Object[]}
 */
const soundQueue = [];
/**
 * Timeout between each command to be run
 * @type {Number}
 */
const commandTime = 1000;
const dot = '.';
const dash = '-';
const triggerKeysPressed = [];
/**
 * Symbolizes space between words in morse string
 * @type {string}
 */
const morseSeparator = '#';
/**
 * @type {AudioContext}
 */
let audioCtx;
let oscillator;
/**
 * @type {AudioNode}
 */
let gainNode;
let soundTimeout = 0;
let previousCommandPointer;
let watchId = null;
// Is geolocation tracking on?
let isTracking = false;
let firstConnection = true;
let positions = [];
/**
 * Used by isScreenOff() to force reconnect when phone screen is off
 * for a longer period of time
 */
let lastScreenOff = (new Date()).getTime();
let commmandUsed = false;
/**
 * Used to block repeat of key presses
 */
let keyPressed;
let trackingTimeout;
let isScreenOffTimeout;
let serverDownTimeout;

/**
 * Push command to queue
 * @static
 * @param {string} command - Name of the command
 * @param {string[]} data - Values, options to be used with the command
 * @param {string} [commandMsg] - String to be printed after command usage
 */
function queueCommand(command, data, commandMsg) {
  commandQueue.push({
    command,
    data,
    commandMsg,
  });
}

/**
 * Push used command to history
 * @param {string} command - Command with options
 */
function pushCommandHistory(command) {
  const commandHistory = storage.getCommandHistory();

  commandHistory.push(command);
  storage.setCommandHistory(commandHistory);
}

/**
 *
 */
function resetPreviousCommandPointer() {
  const commandHistory = storage.getCommandHistory();

  previousCommandPointer = commandHistory ? commandHistory.length : 0;
}

/**
 * Set new gain value
 * @param {number} value - New gain value
 */
function setGain(value) {
  gainNode.gain.value = value;
}

/**
 * Play and print morse code
 * @param {string} morseCode - Morse code to be played and printed
 * @param {boolean} silent - Should the morse code text be surpressed?
 */
function playMorse({ morseCode, silent }) {
  /**
   * Finish sound queue by clearing it and send morse code as text
   * @param {number} timeouts - Morse code array length
   */
  function finishSoundQueue(timeouts) {
    const cleanMorse = morseCode.replace(/#/g, '');

    soundQueue.splice(0, timeouts);

    if (!silent) {
      messenger.queueMessage({
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

  for (let i = 0; i < morseCode.length; i += 1) {
    const code = morseCode[i];

    shouldPlay = false;
    duration = 0;

    if (dot === code) {
      duration = 50;
      shouldPlay = true;
    } else if (dash === code) {
      duration = 150;
      shouldPlay = true;
    } else if (morseSeparator === code) {
      duration = 200;
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

/**
 * Geolocation object is empty when sent through Socket.IO
 * This is a fix for that
 * @param {object} position - Position
 * @returns {object} Position
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

/**
 * Checks client position, stores them and later sends the best one to the server
 */
function retrievePosition() {
  const clearingWatch = () => {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    trackingTimeout = setTimeout(sendLocation, pausePositionTime); // eslint-disable-line no-use-before-define
  };

  const staticPosition = storage.getStaticPosition();

  if (mapTools.getMap()) {
    if (staticPosition && staticPosition.latitude && staticPosition.longitude) {
      isTracking = true;

      positions.push({
        coords: {
          latitude: staticPosition.latitude,
          longitude: staticPosition.longitude,
          accuracy: 100,
        },
        timestamp: new Date(),
      });
      mapTools.setUserPosition({
        latitude: staticPosition.latitude,
        longitude: staticPosition.longitude,
      });
    } else {
      watchId = navigator.geolocation.watchPosition((position) => {
        if (position !== undefined) {
          isTracking = true;
          positions.push(position);

          mapTools.setUserPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      }, (err) => {
        console.log(err);
      }, { enableHighAccuracy: true });
    }
  }

  if (isTracking) {
    trackingTimeout = setTimeout(clearingWatch, watchPositionTime);
  }
}

/**
 * Send client position to server
 */
function sendLocation() {
  let mostAccuratePos;

  if (storage.getUser() !== null && positions.length > 0) {
    mostAccuratePos = positions[positions.length - 1];

    for (let i = positions.length - 2; i >= 0; i -= 1) {
      const position = positions[i];
      const accuracy = positions[i].coords.accuracy;

      if (mostAccuratePos.coords.accuracy > accuracy) {
        mostAccuratePos = position;
      }
    }

    positions = [];

    socketHandler.emit('updateLocation', {
      type: 'user',
      position: preparePosition(mostAccuratePos),
    }, () => {});
  }

  retrievePosition();
}

/**
 * Checks if the screen has been unresponsive for some time.
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
    socketHandler.reconnect();
  }

  isScreenOffTimeout = setTimeout(isScreenOff, screenOffTimeoutTime);
}

/**
 * Sets timeouts.
 * NOTE! NOTE! Intervals are unreliable in Chrome. Don't use them
 */
function setTimeouts() {
  if (trackingTimeout !== null) {
    clearTimeout(trackingTimeout);
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  if (storage.getGpsTracking() && navigator.geolocation) {
    // Gets new geolocation data
    sendLocation();
  }

  // Should not be recreated on focus
  if (isScreenOffTimeout === null) {
    /**
     * Checks time between when JS stopped and started working again
     * This will be most frequently triggered when a user turns off the
     * screen on their phone and turns it back on
     */
    isScreenOffTimeout = setTimeout(isScreenOff, screenOffTimeoutTime);
  }
}

/**
 * Resets intervals and keyPressed (to not have it true after a user tabbed out and into the site)
 */
function refocus() {
  keyPressed = false;
  triggerKeysPressed.ctrl = false;
  triggerKeysPressed.alt = false;
  setTimeouts();
}

/**
 * Create AudioContext needed for morse
 */
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

    oscillator.start(0);
  }
}

/**
 * Does the user agent contain Android?
 * @returns {boolean} Does the user agent contain Android?
 */
function isAndroid() {
  return navigator.userAgent.match(/Android/i) !== null;
}

/**
 * Is the site visited in standalone mode? (iOS, site started from home screen)
 * @returns {boolean} Is the site visited in standalone mode?
 */
function isStandalone() {
  return window.navigator.standalone;
}

/**
 * Does the user agent contain iPhone, iPad or iPad?
 * @returns {boolean} Does the user agent contain iPhone, iPad or iPad?
 */
function isIos() {
  return navigator.userAgent.match(/iP(hone|ad|od)/i) !== null;
}

/**
 * Adds padding to top, if iOS and in stand alone mode
 * Needed due to top menu row in iOS
 */
function padMenu() {
  if (isIos() && isStandalone()) {
    domManipulator.getMenu().classList.add('iosMenuPadding');
  }
}

/**
 * Should auto-completion trigger?
 * @param {string} text - Previous text in input
 * @param {string} textChar - Latest text char
 * @returns {boolean} Should auto-completion trigger?
 */
function triggerAutoComplete(text, textChar) {
  /**
   * Older versions of Android bugs on keypress/down, thus this check
   */
  if ((isAndroid() && text.match(/\s\s$/)) || (!isAndroid() && text.match(/\s$/) && textChar.match(/^\s$/))) {
    domManipulator.setCommandInput(text.slice(0, -1));

    return true;
  }

  return false;
}

/**
 * Set command used
 * @param {boolean} used - Has command been used?
 */
function setCommandUsed(used) {
  commmandUsed = used;
}

/**
 * Consume command queue. Runs the commands stored until empty
 */
function consumeCommandQueue() {
  if (commandQueue.length > 0) {
    const storedCommand = commandQueue.shift();
    const command = storedCommand.command;
    const commandMessage = storedCommand.commandMsg;

    if (commandMessage) {
      messenger.queueMessage(commandMessage);
    }

    setCommandUsed(true);
    commandHandler.triggerCommand({ cmd: command, cmdParams: storedCommand.data });
    setTimeout(consumeCommandQueue, commandTime);
  } else {
    setCommandUsed(false);
  }
}

/**
 * Start consumption of command queue
 */
function startCommandQueue() {
  if (!commmandUsed) {
    consumeCommandQueue();
  }
}

/**
 * @param {string} commandName - Command name
 * @param {string[]} phrases - Command input
 * @returns {string[]} Combined input
 */
function combineSequences(commandName, phrases) {
  const aliases = storage.getAliases();

  return aliases[commandName] ? aliases[commandName].concat(phrases.slice(1)) : phrases.slice(1);
}

/**
 * Expands sent partial string to a matched command, if any
 * @param {string[]} matchedCommands - Matched command names
 * @param {string} partialMatch - Partial string
 * @param {string} sign - Command character
 * @returns {string} Expanded match
 */
function expandPartialMatch(matchedCommands, partialMatch, sign) {
  const firstCommand = matchedCommands[0];
  let expanded = '';
  let matched = true;

  for (let i = partialMatch.length; i < firstCommand.length; i += 1) {
    const commandChar = firstCommand.charAt(i);

    for (let j = 0; j < matchedCommands.length; j += 1) {
      if (matchedCommands[j].charAt(i) !== commandChar) {
        matched = false;

        break;
      }
    }

    if (matched) {
      expanded += commandChar;
    }
  }

  return commandHandler.isCommandChar(sign) ? sign + partialMatch + expanded : partialMatch + expanded;
}

// TODO autoCompleteCommand should use this
/**
 * Match partial string against one to many strings and return matches
 * @param {string} partial - Partial string to match
 * @param {string[]} items - All matchable items
 * @returns {string[]} - Matched strings
 */
function match(partial, items) {
  const matched = [];
  let matches = false;

  for (let i = 0; i < items.length; i += 1) {
    const name = items[i];

    for (let j = 0; j < partial.length; j += 1) {
      if (partial.charAt(j) === name.charAt(j)) {
        matches = true;
      } else {
        matches = false;

        break;
      }
    }

    if (matches) {
      matched.push(name);
    }
  }

  return matched;
}

/**
 * Matches partial string against available options for a command.
 * Appends input with matched option or sends message with multiple matches
 * @param {string[]} phrases - Input from user
 * @param {Object} options - Options from command
 */
function autoCompleteOption(phrases = [], options = {}) {
  const option = options[phrases[1]];
  const partial = phrases[phrases.length - 1];
  /**
   * @type {string[]}
   */
  let matched = [];

  if (option && option.next) {
    const nextKeys = Object.keys(option.next);
    matched = match(partial, nextKeys);

    if (matched.length === 1) {
      domManipulator.replaceLastInputPhrase(`${matched[0]} `);
    } else if (matched.length > 0) {
      messenger.queueMessage({ text: [matched.join(' - ')] });
    } else if (nextKeys.length > 0) {
      messenger.queueMessage({ text: [nextKeys.join(' - ')] });
    }
  } else if (phrases.length <= 2) {
    const firstLevelOptions = Object.keys(options);
    matched = match(partial, firstLevelOptions);

    if (matched.length === 1) {
      domManipulator.replaceLastInputPhrase(`${matched[0]} `);
    } else if (matched.length > 0) {
      domManipulator.setCommandInput(textTools.trimSpace(domManipulator.getInputText()));
      messenger.queueMessage({ text: [matched.join(' - ')] });
    } else if (partial === '') {
      messenger.queueMessage({ text: [firstLevelOptions.join(' - ')] });
    }
  }
}

/**
 * Auto-completes command
 * @param {string[]} phrases - Full input
 */
function autoCompleteCommand(phrases) {
  const allCommands = commandHandler.getCommands({ aliases: true, filtered: true });
  const matched = [];
  const sign = phrases[0].charAt(0);
  let matches;
  let partialCommand = phrases[0];

  /**
   * Auto-complete should only trigger when one phrase is in the input
   * It will not auto-complete flags
   * If chat mode and the command is prepended or normal mode
   */
  if (phrases.length === 1 && partialCommand.length > 0 && (commandHandler.isCommandChar(sign) || (storage.getMode() === 'cmd') || storage.getUser() === null)) {
    // Removes prepend sign
    if (commandHandler.isCommandChar(sign)) {
      partialCommand = partialCommand.slice(1);
    }

    for (let i = 0; i < allCommands.length; i += 1) {
      const command = allCommands[i];
      matches = false;

      for (let j = 0; j < partialCommand.length; j += 1) {
        const commandAccesssLevel = commandHandler.getCommandAccessLevel(command);
        const commandVisibility = commandHandler.getCommandVisibility(command);

        if ((isNaN(commandAccesssLevel) || storage.getAccessLevel() >= commandAccesssLevel) && storage.getAccessLevel() >= commandVisibility && partialCommand.charAt(j) === command.charAt(j)) {
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
      const commandChars = commandHandler.getCommandChars();
      const commandIndex = commandChars.indexOf(sign);
      let newText = '';

      if (commandIndex >= 0) {
        newText += commandChars[commandIndex];
      }

      newText += `${matched[0]} `;

      domManipulator.clearInput();
      domManipulator.setCommandInput(newText);
    } else if (matched.length > 0) {
      domManipulator.setCommandInput(textTools.trimSpace(`${expandPartialMatch(matched, partialCommand, sign)}`));
      messenger.queueMessage({ text: [matched.join(' - ')] });
    }
  }
}

/**
 * Prints the command input used, unless clearAfterUse is true
 * @param {boolean} clearAfterUse - Should command usage be cleared after usage?
 * @param {string} inputText - The command input that will be printed
 * @returns {{text: string[]}} Full command row, with added visuals
 */
function printUsedCommand(clearAfterUse, inputText) {
  if (clearAfterUse) {
    return null;
  }

  /**
   * Print input if the command shouldn't clear
   * after use
   */
  return {
    text: [`${domManipulator.getInputStart()}${domManipulator.getModeText()}$ ${inputText}`],
  };
}

/**
 * Is the view in full screen?
 * @returns {boolean} Is the view in full screen?
 */
function isFullscreen() {
  return !window.screenTop && !window.screenY;
}

/**
 * Goes into full screen with sent element
 * This is not supported in iOS Safari
 * @param {Element} element - The element which should be maximized to full screen
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

/**
 * Fix for Android.
 * Expands the spacer so that the virtual keyboard doesn't block the rest of the site
 * @param {boolean} [keyboardShown] - Is the virtual keyboard visible?
 */
function fullscreenResize(keyboardShown) {
  /**
   * Used for Android when it shows/hides the keyboard
   * The soft keyboard will block part of the site without this fix
   */
  if (isFullscreen() && isAndroid()) {
    const spacer = domManipulator.getSpacer();

    domManipulator.getMainView().classList.add('fullscreen');

    if (keyboardShown) {
      spacer.classList.add('keyboardFix');
      spacer.classList.remove('fullFix');
    } else {
      spacer.classList.remove('keyboardFix');
      spacer.classList.add('fullFix');
    }

    domManipulator.scrollView();
  }
}

/**
 * Triggers on enter press. Runs command based on input
 */
function enterKeyHandler() {
  const commandHelper = commandHandler.commandHelper;
  const user = storage.getUser();
  const inputText = domManipulator.getInputText();
  let phrases;
  keyPressed = true;

  if (!commandHelper.keysBlocked) {
    if (commandHelper.command !== null) {
      phrases = textTools.trimSpace(inputText).split(' ');

      // TODO Hard coded
      if (phrases[0] === 'exit' || phrases[0] === 'abort') {
        commandHandler.abortCommand(commandHelper.command);
        commandHandler.resetCommand(true);
      } else {
        if (!commandHelper.hideInput) {
          messenger.queueMessage({ text: [inputText] });
        }

        commandHandler.triggerCommandStep(phrases);
      }
    } else {
      phrases = textTools.trimSpace(inputText).split(' ');

      if (phrases[0].length > 0) {
        const command = commandHandler.getCommand(phrases[0].toLowerCase());

        if (!storage.getDisableCommands() && (command && (isNaN(command.accessLevel) || storage.getAccessLevel() >= command.accessLevel))) {
          // Store the command for usage with up/down arrows
          pushCommandHistory(phrases.join(' '));

          if (command.clearBeforeUse) {
            commandHandler.triggerCommand({ cmd: 'clear' });
          }

          queueCommand(command.commandName, combineSequences(command.commandName, phrases), printUsedCommand(command.clearAfterUse, inputText));
          startCommandQueue();
          /**
           * User is logged in and in chat mode
           */
        } else if (user !== null && storage.getMode() === 'chat' && phrases[0].length > 0) {
          if (commandHandler.getCommandChars().indexOf(phrases[0].charAt(0)) < 0) {
            queueCommand(commandHandler.getCommand('msg').func, phrases);
            startCommandQueue();

            /**
             * User input commandChar but didn't type
             * a proper command
             */
          } else {
            messenger.queueMessage({
              text: [`${phrases[0]}: ${labels.getText('errors', 'commandFail')}`],
            });
          }
        } else if (user === null) {
          messenger.queueMessage({ text: [phrases.toString()] });
          messenger.queueMessage({ text: labels.getText('info', 'mustRegister') });

          /**
           * Sent command was not found.
           * Print the failed input
           */
        } else {
          pushCommandHistory(phrases.join(' '));
          messenger.queueMessage({
            text: [`- ${phrases[0]}: ${labels.getText('errors', 'commandFail')}`],
          });
        }
      } else {
        messenger.queueMessage(printUsedCommand(false, ' '));
      }
    }
  }

  domManipulator.removeSubMenu();
  resetPreviousCommandPointer();
  domManipulator.clearInput();
  domManipulator.clearModeText();
}

/**
 * Scrolls the view (with rows) a specific amount of pixels
 * Used to scroll the view with page up/down keys
 * @param {number} amount - Amount of pixels to scroll the view with
 */
function scrollText(amount) {
  domManipulator.getMainView().scrollTop += amount;
}

/**
 * Match found callback
 * @param {Object} error - Error. Will be set if something went wrong
 * @param {Object} params - Parameters
 * @param {Object} params.data - Data
 * @param {string[]} params.data.matched - Found match/matches
 */
function matchFound({ error, data: { matched = [''] } }) {
  if (error) {
    return;
  }

  if (matched.length > 1) {
    messenger.queueMessage({
      text: [matched.join(' - ')],
    });
  } else if (matched[0]) {
    domManipulator.replaceLastInputPhrase(`${matched[0]} `);
  }
}

/**
 * Auto-completes depending on current input
 */
function autoComplete() {
  const commandHelper = commandHandler.commandHelper;
  const phrases = textTools.trimSpace(domManipulator.getInputText().toLowerCase()).split(' ');
  const command = commandHandler.getCommand((commandHelper.command || phrases[0]).toLowerCase());

  if (command && phrases.length === 1) {
    phrases.push('');
  }

  if (phrases.length === 1 && phrases[0].length === 0) {
    commandHandler.triggerCommand({ cmd: 'help' });
  } else if (!command && !commandHelper.keysBlocked && commandHelper.command === null) {
    autoCompleteCommand(phrases);
    domManipulator.changeModeText();
  } else if (command) {
    if (command.autocomplete && phrases.length < 3) {
      const partial = phrases[1];

      switch (command.autocomplete.type) {
        case 'users': {
          socketHandler.emit('matchPartialUser', { partialName: partial }, matchFound);

          break;
        }
        case 'rooms': {
          socketHandler.emit('matchPartialRoom', { partialName: partial }, matchFound);

          break;
        }
        case 'myRooms': {
          socketHandler.emit('matchPartialMyRoom', { partialName: partial }, matchFound);

          break;
        }
        case 'myAliases': {
          socketHandler.emit('matchPartialAlias', { partialName: partial }, matchFound);

          break;
        }
        default: {
          break;
        }
      }
    } else if (command.options) {
      autoCompleteOption(phrases, command.options);
    }
  }
}

/**
 * All key presses that weren't caught in specialKeypress
 * @param {string} textChar - Character pressed on the keyboard
 */
function defaultKeyPress(textChar) {
  if (triggerAutoComplete(domManipulator.getInputText(), textChar) && commandHandler.commandHelper.command === null) {
    autoComplete();

    // Prevent new whitespace to be printed
    event.preventDefault();
  }
}

/**
 * Checks key event against a list of keys
 * @param {Object} event - Key event
 */
function specialKeyPress(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;
  const textChar = String.fromCharCode(keyCode);
  const commandHistory = storage.getCommandHistory();
  const commandHelper = commandHandler.commandHelper;

  domManipulator.focusInput();
  domManipulator.removeSubMenu();

  if (!keyPressed) {
    switch (keyCode) {
      case 9: { // Tab
        keyPressed = true;

        autoComplete();

        event.preventDefault();

        break;
      }
      case 13: { // Enter
        enterKeyHandler();

        event.preventDefault();

        break;
      }
      case 17: { // Ctrl
        triggerKeysPressed.ctrl = true;

        break;
      }
      case 18: { // Alt
        triggerKeysPressed.alt = true;

        break;
      }
      case 91: { // Left Command key in OS X
        triggerKeysPressed.ctrl = true;

        break;
      }
      case 93: { // Right Command key in OS X
        triggerKeysPressed.ctrl = true;

        break;
      }
      case 224: { // Command key in OS X (Firefox)
        triggerKeysPressed.ctrl = true;

        break;
      }
      case 33: { // Page up
        scrollText(-window.innerHeight * 0.5);

        event.preventDefault();

        break;
      }
      case 34: { // Page down
        scrollText(window.innerHeight * 0.5);

        event.preventDefault();

        break;
      }
      case 38: { // Up arrow
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          scrollText(-window.innerHeight);
        } else if (!commandHelper.keysBlocked && commandHelper.command === null && previousCommandPointer > 0) {
          domManipulator.clearInput();
          previousCommandPointer -= 1;
          domManipulator.setCommandInput(commandHistory[previousCommandPointer]);
        }

        event.preventDefault();

        break;
      }
      case 40: { // Down arrow
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          scrollText(window.innerHeight);
        } else if (!commandHelper.keysBlocked && commandHelper.command === null) {
          if (previousCommandPointer < commandHistory.length - 1) {
            domManipulator.clearInput();
            previousCommandPointer += 1;
            domManipulator.setCommandInput(commandHistory[previousCommandPointer]);
          } else if (previousCommandPointer === commandHistory.length - 1) {
            domManipulator.clearInput();
            previousCommandPointer += 1;
          } else {
            domManipulator.clearInput();
          }
        }

        event.preventDefault();

        break;
      }
      case 68: { // d
        if (triggerKeysPressed.ctrl) {
          commandHandler.triggerCommand({ cmd: 'logout' });
          event.preventDefault();
        } else {
          defaultKeyPress(textChar);
        }

        break;
      }
      case 85: { // u
        if (triggerKeysPressed.ctrl) {
          goFullScreen(document.documentElement);
          fullscreenResize(false);
          event.preventDefault();
          domManipulator.scrollView();
        } else {
          defaultKeyPress(textChar);
        }

        break;
      }
      default: {
        defaultKeyPress(textChar);

        break;
      }
    }
  } else {
    event.preventDefault();
  }
}

/**
 * Indicates that a key has been released and sets the corresponding flag
 * @param {KeyboardEvent} event - Keyboard event
 */
function keyReleased(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;

  /**
   * Older versions of Android bugs on keydown/press and sends incorrect keycodes,
   * thus defaultKeyPress has to be triggered on keyup
   */
  if (isAndroid()) {
    const textChar = domManipulator.getInputText().charAt(domManipulator.getInputText().length - 1);

    defaultKeyPress(textChar);
  }

  switch (keyCode) {
    case 9: // Tab
    case 16: // Shift
    case 20: // Caps lock
    case 33: // Page up
    case 34: // Page down
    case 37: // Left arrow
    case 39: { // Down arrow
      keyPressed = false;

      break;
    }
    case 91: // Left Command key in OS X
    case 93: // Right Command key in OS X
    case 224: // Command key in OS X (Firefox)
    case 17: { // Ctrl
      triggerKeysPressed.ctrl = false;

      break;
    }
    case 18: { // Alt
      triggerKeysPressed.alt = false;

      break;
    }
    default: {
      keyPressed = false;
      domManipulator.resizeInput();

      break;
    }
  }

  if (domManipulator.getInputText().length === 0) {
    domManipulator.clearModeText();
  } else {
    domManipulator.changeModeText();
  }

  domManipulator.updateThisCommandItem();
}

/**
 * Attach click listener to menu item
 * @param {Element} menuItem - Menu item that will get a click handler
 * @param {Function} func - Function on click
 * @param {string} [funcParam] - Function parameters
 */
function attachMenuListener(menuItem, func, funcParam) {
  if (func) {
    menuItem.addEventListener('click', (event) => {
      fullscreenResize();
      domManipulator.removeAllSubMenus();
      func([funcParam]);
      clickHandler.setClicked(true);
      event.stopPropagation();
    });
  }
}

/**
 * Create menu item
 * @param {Object} menuItem - Menu item to be added
 * @returns {Element} List item
 */
function createMenuItem(menuItem) {
  const listItem = document.createElement('li');
  const span = document.createElement('span');

  if (menuItem.extraClass) {
    span.classList.add(menuItem.extraClass);
  }

  listItem.setAttribute('id', menuItem.elementId);
  listItem.classList.add('link');
  span.appendChild(document.createTextNode(menuItem.itemName));
  listItem.appendChild(span);

  return listItem;
}

/**
 * Creates sub-menu list
 * @param {string[]} subItems - Items that will be added to the list
 * @param {boolean} [replaceInput] - Should a click on the item replace current input?
 * @returns {Element} List item
 */
function createSubMenuItem(subItems, replaceInput) {
  const ulElem = document.createElement('ul');

  for (let i = 0; i < subItems.length; i += 1) {
    const item = subItems[i];
    const liElem = document.createElement('li');
    const span = document.createElement('span');

    liElem.classList.add('link');
    span.appendChild(document.createTextNode(item.toUpperCase()));
    liElem.appendChild(span);
    ulElem.classList.add('subMenu');
    ulElem.appendChild(liElem);

    liElem.addEventListener('click', () => {
      if (replaceInput) {
        domManipulator.setCommandInput(`${span.textContent.toLowerCase()} `);
      } else {
        domManipulator.appendInputText(span.textContent.toLowerCase());
      }

      domManipulator.removeAllSubMenus();
    });
  }

  return ulElem;
}

/**
 * Shows available options for command in sub-menu
 */
function thisCommandOptions() {
  const command = commandHandler.getCommand(domManipulator.getThisCommandItem().children[0].textContent.toLowerCase());
  const options = command.options;

  if (options) {
    const input = textTools.trimSpace(domManipulator.getInputText()).split(' ');

    if (input.length > 1) {
      const currentOption = options[input[input.length - 1]];

      if (currentOption && currentOption.next) {
        domManipulator.addSubMenuItem('thisCommand', createSubMenuItem(Object.keys(currentOption.next)));
      }
    } else {
      const firstLevelOptions = Object.keys(options);

      domManipulator.addSubMenuItem('thisCommand', createSubMenuItem(firstLevelOptions));
    }
  }
}

/**
 * Shows available commands in sub-menu
 */
function showCommands() {
  const commands = commandHandler.getCommands({ aliases: true, filtered: true });

  domManipulator.addSubMenuItem('commands', createSubMenuItem(commands, true));
}

/**
 * Populate top menu with items
 */
function populateMenu() {
  const menuItems = {
    runCommand: {
      itemName: 'EXEC',
      extraClass: 'menuButton',
      func: enterKeyHandler,
      elementId: 'runCommand',
    },
    commands: {
      itemName: 'CMDS',
      func: showCommands,
      elementId: 'commands',
    },
    thisCommand: {
      itemName: '',
      func: thisCommandOptions,
      elementId: 'thisCommand',
    },
    lantern: {
      itemName: 'LANTERN',
      func: domManipulator.toggleLantern,
      elementId: 'lantern',
    },
  };
  const menuKeys = Object.keys(menuItems);

  for (let i = 0; i < menuKeys.length; i += 1) {
    const menuItem = menuItems[menuKeys[i]];
    const listItem = createMenuItem(menuItem);

    if (listItem.id === 'thisCommand') {
      domManipulator.setThisCommandItem(listItem);
    }

    attachMenuListener(listItem, menuItem.func);
    domManipulator.addMenuItem(listItem);
  }
}

/**
 * Print welcome messages
 */
function printWelcomeMessage() {
  if (!storage.getFastMode()) {
    const mainLogo = labels.getMessage('logos', 'mainLogo');
    const razorLogo = labels.getMessage('logos', 'razor');

    messenger.queueMessage(mainLogo);
    messenger.queueMessage({ text: labels.getText('info', 'welcomeLoggedIn') });
    messenger.queueMessage({ text: labels.getText('info', 'razorHacked') });
    messenger.queueMessage(razorLogo);
  }
}

/**
 * Print starting messages
 */
function printStartMessage() {
  if (!storage.getFastMode()) {
    const mainLogo = labels.getMessage('logos', 'mainLogo');

    messenger.queueMessage(mainLogo);
    messenger.queueMessage({
      text: labels.getText('info', 'establishConnection'),
      extraClass: 'upperCase',
    });
    messenger.queueMessage({ text: labels.getText('info', 'welcome') });
  }
}

/**
 * Add listener that sets view to full screen on click
 */
function attachFullscreenListener() {
  domManipulator.getMainView().addEventListener('click', (event) => {
    clickHandler.toggleClicked();

    if (clickHandler.isClicked()) {
      domManipulator.focusInput();
    } else {
      domManipulator.blurInput();
    }

    if (storage.getForceFullscreen() === true) {
      // Set whole document to full screen
      goFullScreen(document.documentElement);
      fullscreenResize(clickHandler.isClicked());
    }

    domManipulator.removeAllSubMenus();

    event.preventDefault();
  });
}

/**
 * Resets local storage
 */
function resetAllLocalVals() {
  storage.removeCommandHistory();
  storage.removeRoom();
  storage.removeUser();
  storage.setAccessLevel(0);
  domManipulator.setInputStart(storage.getDefaultInputStart());
  previousCommandPointer = 0;
}

// TODO Not all Android devices have touch screens
/**
 * Checks if device is iOS or Android
 * @returns {boolean} Returns true if userAgent contains iPhone, iPad, iPod or Android
 */
function isTouchDevice() {
  return ((isIos() || isAndroid()));
}

/**
 * Called on reconnect emit. Triggers when the connection is lost and then re-established
 */
function onReconnect() {
  clearTimeout(serverDownTimeout);
  socketHandler.reconnect();
  domManipulator.setStatus(labels.getString('status', 'online'));
}

/**
 * Called on disconnect emit
 */
function onDisconnect() {
  const serverDown = () => {
    if (storage.getUser()) {
      printWelcomeMessage();
    } else {
      printStartMessage();
    }
  };

  domManipulator.setStatus(labels.getString('status', 'offline'));
  messenger.queueMessage({
    text: labels.getText('info', 'lostConnection'),
  });
  serverDownTimeout = setTimeout(serverDown, 300000);
}

/**
 * @param {Object} params - Parameters
 * @param {boolean} params.noStepCall - Should next step function be skipped?
 * @param {boolean} params.freezeStep - Should the step stay the same after being called?
 * @param {*} params.newData - New data to be used by next command step
 */
function onCommandSuccess(params = {}) {
  const commandHelper = commandHandler.commandHelper;

  if (!params.noStepCall) {
    if (!params.freezeStep) {
      commandHelper.onStep += 1;
    }

    commandHandler.triggerCommandStep(params.newData);
  } else {
    commandHandler.resetCommand(false);
  }
}

/**
 * Called on commandFail emit
 */
function onCommandFail() {
  const commandHelper = commandHandler.commandHelper;

  if (commandHelper.command !== null) {
    commandHandler.abortCommand(commandHelper.command);
    commandHandler.resetCommand(true);
  }
}

/**
 * Calls a specific command step which has been designated as the fallback step
 * Example usage: failed login leads back to start of user name input
 * @param {string[]} cmdParams - Parameters for the command step
 */
function onCommandStep(cmdParams) {
  commandHandler.commandHelper.onStep = commandHandler.commandHelper.fallbackStep;
  commandHandler.triggerCommandStep(cmdParams);
}

/**
 * Called on reconnectSuccess emit
 * @param {Object} params - Parameters
 *
 */
function onReconnectSuccess(params = {}) {
  if (!params.anonUser) {
    const mode = params.user.mode || 'cmd';
    const room = storage.getRoom();

    commandHandler.triggerCommand({ cmd: 'mode', cmdParams: [mode] });
    storage.setAccessLevel(params.user.accessLevel);

    if (!params.firstConnection) {
      messenger.queueMessage({
        text: labels.getText('info', 'reestablished'),
      });
    } else {
      printWelcomeMessage();

      if (room) {
        commandHandler.triggerCommand({ cmd: 'room', cmdParams: [room] });
      }
    }

    messenger.queueMessage({
      text: ['Retrieving missed messages (if any)'],
      text_se: ['Hämtar missade meddelanden (om det finns några)'],
    });

    socketHandler.emit('updateDeviceSocketId', {
      device: {
        deviceId: storage.getDeviceId(),
      },
      user: {
        userName: storage.getUser(),
      },
    });
  } else if (!params.firstConnection) {
    messenger.queueMessage(labels.getMessage('info', 'reestablished'));
  } else {
    printStartMessage();
  }

  socketHandler.setReconnecting(false);

  if (params.welcomeMessage) {
    messenger.queueMessage({
      text: ['!!!!!', params.welcomeMessage, '!!!!!'],
    });
  }
}

/**
 * Called on disconnectUser emit
 */
function onDisconnectUser() {
  const currentUser = storage.getUser();

  // There is no saved local user. We don't need to print this
  if (currentUser && currentUser !== null) {
    messenger.queueMessage({
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

/**
 * Called on ban emit
 */
function onBan() {
  messenger.queueMessage({
    text: labels.getText('info', 'youHaveBeenBanned'),
    extraClass: 'importantMsg',
  });
  resetAllLocalVals();
}

/**
 * Called on logout emit. Clears local data
 */
function onLogout() {
  commandHandler.triggerCommand({ cmd: 'clear' });
  resetAllLocalVals();
  socketHandler.emit('followPublic');

  printStartMessage();
}

/**
 * Called on updateDeviceId emit. Sets new device ID
 * @param {string} newId - New device ID
 */
function onUpdateDeviceId(newId) {
  storage.setDeviceId(newId);
}

/**
 * Called on list emit. Receives a list to print
 * @param {Object} params - Parameters
 * @param {number} params.columns - Number of columns to print items to
 * @param {Object[]} params.itemList - List to be printed
 * @param {string} params.itemList[].listTitle - Title of the list
 */
function onList(params = {}) {
  if (params.itemList) {
    const itemList = params.itemList.itemList;
    const title = params.itemList.listTitle;

    if (title) {
      messenger.onMessage({ message: { text: textTools.createCommandStart(title) } });
    }

    messenger.onMessage({
      message: {
        text: itemList,
        linkable: params.itemList.linkable || true,
        keepInput: params.itemList.keepInput || true,
        replacePhrase: params.itemList.replacePhrase || false,
        columns: params.columns,
        extraClass: 'columns',
      },
    });
  }
}

/**
 * Video message emitted from server
 * @param {{videoPath: string}} params - Path for the video to load from
 */
function onVideoMessage(params = {}) {
  if (!storage.getLoadVideo()) {
    return;
  }

  const videoPath = params.videoPath;

  if (videoPath) {
    videoPlayer.setVideo(videoPath);
    videoPlayer.loadVideo();

    videoPlayer.getPlayer().addEventListener('canplaythrough', () => {
      // layoutChanger.splitView(true, domManipulator.getVideoHolder());
      videoPlayer.playVideo();
    });
  }
}

/**
 * Called on reboot emit. Calls reboot command
 */
function onReboot() {
  commandHandler.triggerCommand({ cmd: 'reboot' });
}

/**
 * Called from server on client connection
 * Sets configuration properties from server and starts the rest of the app
 * @param {Object} params - Configuration properties
 */
function onStartup(params = { }) {
  domManipulator.setStatus(labels.getString('status', 'online'));
  storage.setDefaultLanguage(params.defaultLanguage);
  storage.shouldForceFullscreen(params.forceFullscreen);
  storage.shouldGpsTrack(params.gpsTracking);
  storage.shouldDisableCommands(params.disableCommands);
  storage.shouldHideRoomNames(params.hideRoomNames);
  storage.shouldHideTimeStamp(params.hideTimeStamp);
  storage.shouldStaticInputStart(params.staticInputStart);
  storage.setDefaultInputStart(params.defaultInputStart);
  storage.shouldHideCursor(storage.isHiddenCursor());
  storage.shouldHideMenu(storage.isHiddenMenu());
  storage.shouldHideCmdInput(storage.isHiddenCmdInput());
  storage.shouldThinView(storage.isThinView());
  storage.setCenterCoordinates(params.centerLong, params.centerLat);
  storage.setCornerOneCoordinates(params.cornerOneLong, params.cornerOneLat);
  storage.setCornerTwoCoordinates(params.cornerTwoLong, params.cornerTwoLat);
  storage.setDefaultZoomLevel(params.defaultZoomLevel);
  storage.setRadioChannels(params.radioChannels);
  mapTools.setCornerCoords(storage.getCornerOneCoordinates(), storage.getCornerTwoCoordinates());

  socketHandler.emit('getCommands', '', ({ error, data: { commands } }) => {
    if (error) {
      throw new Error('Failed to retrieve commands');
    }

    commandHandler.onUpdateCommands({ commands });
  });
  labels.setLanguage(storage.getDefaultLanguage());
  domManipulator.setMainView(document.getElementById('background'));
  commandHandler.addSpecialHelpOptions();

  if (firstConnection) {
    populateMenu();
    padMenu();

    if (!isTouchDevice()) {
      domManipulator.focusInput();
    } else {
      document.body.classList.add('bold');
      domManipulator.getMainView().classList.add('fullscreen');
    }

    if (!storage.getDeviceId()) {
      storage.setDeviceId(textTools.createDeviceId());
    }

    setInterval(() => {
      socketHandler.emit('updateDeviceLastAlive', { device: { deviceId: storage.getDeviceId(), lastAlive: new Date() } });
    }, 5000);

    attachFullscreenListener();
    // Needed for some special keys. They are not detected with keypress
    addEventListener('keydown', specialKeyPress);
    addEventListener('keyup', keyReleased);
    addEventListener('orientationchange', () => {
      layoutChanger.toggleIsLandscape();
      layoutChanger.changeOrientation();
      domManipulator.scrollView();
    });
    window.addEventListener('focus', refocus);

    resetPreviousCommandPointer();
    setTimeouts();
    buildMorsePlayer();

    if (!storage.getAccessLevel()) {
      storage.setAccessLevel(0);
    }

    if (!storage.getUser()) {
      domManipulator.setInputStart(storage.getDefaultInputStart());
      socketHandler.emit('updateDeviceSocketId', {
        device: { deviceId: storage.getDeviceId() },
        user: {
          userName: 'NO_USER_LOGGED_IN',
        },
      });
    } else {
      domManipulator.setUserName(storage.getUser());
    }

    socketHandler.emit('updateId', {
      user: { userName: storage.getUser() },
      firstConnection: true,
      device: { deviceId: storage.getDeviceId() },
    });

    mapTools.startMap();

    firstConnection = false;
  }
}

window.addEventListener('error', (event) => {
  /**
   * Reloads page
   * @private
   */
  function restart() {
    window.location.reload();
  }

  console.log(event.error);
  domManipulator.setStatus(labels.getString('status', 'offline'));
  messenger.queueMessage({
    text: ['!!!! Something bad happened and the terminal is no longer working !!!!', 'Rebooting in 3 seconds'],
  });
  setTimeout(restart, 3000);

  return false;
});

socketHandler.startSocket({
  message: messenger.onMessage,
  messages: messenger.onMessages,
  importantMsg: messenger.onImportantMsg,
  reconnect: onReconnect,
  disconnect: onDisconnect,
  follow: roomHandler.onFollow,
  unfollow: roomHandler.onUnfollow,
  commandSuccess: onCommandSuccess,
  commandFail: onCommandFail,
  reconnectSuccess: onReconnectSuccess,
  disconnectUser: onDisconnectUser,
  morse: playMorse,
  ban: onBan,
  logout: onLogout,
  updateCommands: commandHandler.onUpdateCommands,
  updateDeviceId: onUpdateDeviceId,
  list: onList,
  startup: onStartup,
  mapPositions: mapTools.onMapPositions,
  videoMessage: onVideoMessage,
  commandStep: onCommandStep,
  reboot: onReboot,
});
