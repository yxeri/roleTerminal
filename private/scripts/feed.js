'use strict';

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

/**
 * Queue of all the commands used by the user that will be handled and printed
 * @type {object[]}
 */
const commandQueue = [];
/**
 * Check every * amount of milliseconds to see if Javascript is still responding
 * It will trigger a function if the response is delayed
 * @type {number}
 */
const screenOffIntervalTime = 1000;
/**
 * Get GPS coordinates for * amount of milliseconds
 * @type {number}
 */
const watchPositionTime = 15000;
/**
 * Get GPS coordinates every * milliseconds
 * @type {number}
 */
const pausePositionTime = 40000;
/**
 * Queue of all sounds to be consumed and played
 * @type {object[]}
 */
const soundQueue = [];
/**
 * Timeout between each command to be run
 * @type {number}
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
let audioCtx;
let oscillator;
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
 * Used to block repeat of some key presses
 */
let keyPressed = false;
let trackingInterval = null;
let isScreenOffInterval = null;
let serverDownTimeout = null;

function queueCommand(command, data, commandMsg) {
  commandQueue.push({
    command,
    data,
    commandMsg,
  });
}

function pushCommandHistory(command) {
  const commandHistory = storage.getCommandHistory();

  commandHistory.push(command);
  storage.setCommandHistory(commandHistory);
}

function enterRoom(roomName) {
  storage.setRoom(roomName);

  if (!storage.getStaticInputStart()) {
    domManipulator.setInputStart(roomName);
  }

  messenger.queueMessage({
    text: [`Entered ${roomName}`],
    text_se: [`Gick in i ${roomName}`],
  });
}

function resetPreviousCommandPointer() {
  const commandHistory = storage.getCommandHistory();

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

      mapTools.setUserPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
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

  if (storage.getUser() !== null && positions.length > 0) {
    mostAccuratePos = positions[positions.length - 1];

    for (let i = positions.length - 2; i >= 0; i--) {
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
    socketHandler.reconnect();
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

  if (storage.getGpsTracking() && navigator.geolocation) {
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
    domManipulator.setCommandInput(textTools.trimSpace(text));

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
      messenger.queueMessage(commandMessage);
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

function combineSequences(commandName, phrases) {
  const aliases = storage.getAliases();

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
      return commandHandler.isCommandChar(sign) ? sign + partialMatch + expanded : partialMatch + expanded;
    }
  }

  return '';
}

function autoCompleteCommand() {
  const phrases = textTools.trimSpace(domManipulator.getInputText().toLowerCase()).split(' ');
  // TODO Change from Object.keys for compatibility with older Android
  const allCommands = commandHandler.getCommands().concat(Object.keys(storage.getAliases()));
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
  if (phrases.length === 1 && partialCommand.length > 0 && (commandHandler.isCommandChar(sign) || (storage.getMode() === 'cmd') || storage.getUser() === null)) {
    // Removes prepend sign
    if (commandHandler.isCommandChar(sign)) {
      partialCommand = partialCommand.slice(1);
    }

    for (const command of allCommands) {
      matches = false;

      for (let j = 0; j < partialCommand.length; j++) {
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

      if (commandIndex >= 0) {
        newText += commandChars[commandIndex];
      }

      newText += `${matched[0]} `;

      domManipulator.clearInput();
      domManipulator.setCommandInput(newText);
    } else if (matched.length > 0) {
      domManipulator.setCommandInput(expandPartialMatch(matched, partialCommand, sign));
      messenger.queueMessage({ text: [matched.join('\t')] });
    }

    // No input? Show all available commands
  } else if (partialCommand.length === 0) {
    commandHandler.triggerCommand({ cmd: 'help' });
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
    messenger.queueMessage(helpMsg);
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
    text: [`${domManipulator.getInputStart()}${domManipulator.getModeText()}$ ${inputText}`],
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
        const command = commandHandler.getCommand(phrases[0]);

        if (!storage.getDisableCommands() && (command && (isNaN(command.accessLevel) || storage.getAccessLevel() >= command.accessLevel))) {
          // Store the command for usage with up/down arrows
          pushCommandHistory(phrases.join(' '));

          /**
           * Print the help and instruction parts of the command
           */
          if (phrases[1] === '-help') {
            printHelpMessage(command.commandName);
          } else {
            if (command.steps) {
              commandHelper.command = command.commandName;
              commandHelper.maxSteps = command.steps.length;
            }

            if (command.clearBeforeUse) {
              commandHandler.triggerCommand({ cmd: 'clear' });
            }

            queueCommand(command.func, combineSequences(command.commandName, phrases), printUsedCommand(command.clearAfterUse, inputText));
            startCommandQueue();
          }
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

  resetPreviousCommandPointer();
  domManipulator.clearInput();
  domManipulator.clearModeText();
}

function specialKeyPress(event) {
  const keyCode = typeof event.which === 'number' ? event.which : event.keyCode;
  const commandHistory = storage.getCommandHistory();
  const commandHelper = commandHandler.commandHelper;

  if (!keyPressed) {
    switch (keyCode) {
      // Backspace
      case 8: {
        if (domManipulator.getInputText().length <= 1) {
          domManipulator.clearModeText();
        } else {
          domManipulator.changeModeText();
        }

        break;
      }
      // Tab
      case 9: {
        const phrases = domManipulator.getInputText().split(' ');
        keyPressed = true;

        if (!commandHelper.keysBlocked && commandHelper.command === null && phrases.length === 1) {
          autoCompleteCommand();
          domManipulator.changeModeText();
        } else if (commandHelper.allowAutoComplete || phrases.length === 2) {
          const command = commandHelper.command ? commandHandler.getCommand(commandHelper.command) : commandHandler.getCommand(phrases[0]);
          const partial = commandHelper.command ? phrases[0] : phrases[1];

          if (command && command.autocomplete) {
            switch (command.autocomplete.type) {
              case 'users': {
                socketHandler.emit('matchPartialUser', { partialName: partial });

                break;
              }
              case 'rooms': {
                socketHandler.emit('matchPartialRoom', { partialName: partial });

                break;
              }
              case 'myRooms': {
                socketHandler.emit('matchPartialMyRoom', { partialName: partial });

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
        if (domManipulator.getInputText().length === 0) {
          domManipulator.clearModeText();
        } else {
          domManipulator.changeModeText();
        }

        event.preventDefault();

        break;
      }
      // Page up
      case 33: {
        domManipulator.getMainView().scrollTop -= window.innerHeight;

        event.preventDefault();

        break;
      }
      // Page down
      case 34: {
        domManipulator.getMainView().scrollTop += window.innerHeight;

        event.preventDefault();

        break;
      }
      // Up arrow
      case 38: {
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          domManipulator.getMainView().scrollTop -= window.innerHeight;
        } else if (!commandHelper.keysBlocked && commandHelper.command === null && previousCommandPointer > 0) {
          domManipulator.clearInput();
          previousCommandPointer--;
          domManipulator.setCommandInput(commandHistory[previousCommandPointer]);
        }

        event.preventDefault();

        break;
      }
      // Down arrow
      case 40: {
        keyPressed = true;

        if (triggerKeysPressed.ctrl) {
          domManipulator.getMainView().scrollTop += window.innerHeight;
        } else {
          if (!commandHelper.keysBlocked && commandHelper.command === null) {
            if (previousCommandPointer < commandHistory.length - 1) {
              domManipulator.clearInput();
              previousCommandPointer++;
              domManipulator.setCommandInput(commandHistory[previousCommandPointer]);
            } else if (previousCommandPointer === commandHistory.length - 1) {
              domManipulator.clearInput();
              previousCommandPointer++;
            } else {
              domManipulator.clearInput();
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
    domManipulator.changeModeText();
  }

  if (triggerAutoComplete(domManipulator.getInputText(), textChar) && commandHandler.commandHelper.command === null) {
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
      clickHandler.setClicked(true);
      domManipulator.focusInput();
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
      func: commandHandler.getCommand('help').func,
    },
    thisCommand: {
      itemName: '',
    },
  };

  for (const key of Object.keys(menuItems)) {
    const menuItem = menuItems[key];
    const listItem = createMenuItem(menuItem);

    attachMenuListener(listItem, menuItem.func, menuItem.funcParam);
    domManipulator.addMenuItem(listItem);
  }
}

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

    event.preventDefault();
  });
}

function resetAllLocalVals() {
  storage.removeCommandHistory();
  storage.removeRoom();
  storage.removeUser();
  storage.setAccessLevel(0);
  domManipulator.setInputStart(storage.getDefaultInputStart());
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
      if (message.userName === storage.getUser()) {
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

// TODO Not all Android devices have touch screens
/**
 * @returns {boolean} Returns true if userAgent contains iPhone, iPad, iPod or Android
 */
function isTouchDevice() {
  return ((/iP(hone|ad|od)/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)));
}

function onMessage(data = { message: {} }) {
  const message = textTools.addMessageSpecialProperties(hideMessageProperties(data.message));

  messenger.queueMessage(message);
}

function onMessages(data = { messages: [] }) {
  const messages = data.messages;

  for (let i = 0; i < messages.length; i++) {
    const message = textTools.addMessageSpecialProperties(hideMessageProperties(messages[i]));

    messenger.queueMessage(message);
  }
}

function onImportantMsg(data = {}) {
  const message = data.message;

  if (message) {
    message.extraClass = 'importantMsg';
    message.skipTime = true;

    messenger.queueMessage(message);

    if (message.morse) {
      commandHandler.triggerCommand({ cmd: 'morse', cmdParams: message.text.slice(0, 1) });
    }
  }
}

/*
 * Triggers when the connection is lost and then re-established
 */
function onReconnect() {
  clearTimeout(serverDownTimeout);
  socketHandler.reconnect();
}

function onDisconnect() {
  const serverDown = () => {
    if (storage.getUser()) {
      printWelcomeMessage();
    } else {
      printStartMessage();
    }
  };

  messenger.queueMessage({
    text: labels.getText('info', 'lostConnection'),
  });
  serverDownTimeout = setTimeout(serverDown, 300000);
}

function onFollow(data = { room: {} }) {
  const room = data.room;

  if (room.entered) {
    enterRoom(room.roomName);
  } else {
    messenger.queueMessage({
      text: [`Following ${room.roomName}`],
      text_se: [`Följer ${room.roomName}`],
    });
  }
}

function onUnfollow(data = { room: { roomName: '' } }) {
  const room = data.room;

  messenger.queueMessage({
    text: [`Stopped following ${room.roomName}`],
    text_se: [`Slutade följa ${room.roomName}`],
  });

  if (room.exited) {
    socketHandler.emit('follow', {
      room: {
        roomName: 'public',
        entered: true,
      },
    });
  }
}

function onLogin(data = {}) {
  const user = data.user;
  const mode = user.mode || 'cmd';

  commandHandler.triggerCommand({ cmd: 'clear' });
  storage.setUser(user.userName);
  storage.setAccessLevel(user.accessLevel);
  messenger.queueMessage({
    text: [`Successfully logged in as ${user.userName}`],
    text_se: [`Lyckades logga in som ${user.userName}`],
  });
  printWelcomeMessage();
  commandHandler.triggerCommand({ cmd: 'mode', cmdParams: [mode] });

  socketHandler.emit('updateDeviceSocketId', {
    device: {
      deviceId: storage.getDeviceId(),
    },
    user: {
      userName: storage.getUser(),
    },
  });
  socketHandler.emit('follow', {
    room: {
      roomName: 'public',
      entered: true,
    },
  });
}

function onCommandSuccess(data = {}) {
  const commandHelper = commandHandler.commandHelper;

  if (!data.noStepCall) {
    if (!data.freezeStep) {
      commandHelper.onStep++;
    }

    commandHandler.triggerCommandStep();
  } else {
    commandHandler.resetCommand(false);
  }
}

function onCommandFail() {
  const commandHelper = commandHandler.commandHelper;

  if (commandHelper.command !== null) {
    commandHandler.abortCommand(commandHelper.command);
    commandHandler.resetCommand(true);
  }
}

function onReconnectSuccess(data) {
  if (!data.anonUser) {
    const mode = data.user.mode || 'cmd';
    const room = storage.getRoom();

    commandHandler.triggerCommand({ cmd: 'mode', cmdParams: [mode] });
    storage.setAccessLevel(data.user.accessLevel);

    if (!data.firstConnection) {
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
  } else {
    if (!data.firstConnection) {
      messenger.queueMessage({
        text: ['Re-established connection'],
        text_se: ['Lyckades återansluta'],
      });
    } else {
      printStartMessage();
    }
  }

  socketHandler.setReconnecting(false);
}

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

function onMorse(data = {}) {
  playMorse(data.morseCode, data.silent);
}

function onTime(data = {}) {
  messenger.queueMessage({
    text: [`Time: ${textTools.generateTimeStamp(data.time, true, true)}`],
    text_en: [`Tid: ${textTools.generateTimeStamp(data.time, true, true)}`],
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
    text += `Time: ${textTools.generateTimeStamp(position.timestamp, true)}${'\t'}`;
    text += `Accuracy: ${accuracy} ${accuracy !== 'BAD' ? 'meters' : ''}${'\t'}`;
    text += `Coordinates: ${latitude}, ${longitude}${'\t'}`;

    if (heading !== null) {
      text += `Heading: ${heading} deg.`;
    }

    messenger.queueMessage({ text: [text] });
  }
}

function onBan() {
  messenger.queueMessage({
    text: labels.getText('info', 'youHaveBeenBanned'),
    extraClass: 'importantMsg',
  });
  resetAllLocalVals();
}

function onLogout() {
  commandHandler.triggerCommand({ cmd: 'clear' });
  resetAllLocalVals();
  socketHandler.emit('followPublic');

  printStartMessage();
}

function onUpdateCommands(data = { commands: [] }) {
  const newCommands = data.commands;

  for (let i = 0; i < newCommands.length; i++) {
    commandHandler.updateCommand(newCommands[i]);
  }
}

function onWeather(report) {
  const weather = [];
  let weatherString = '';

  for (let i = 0; i < report.length; i++) {
    const weatherInstance = report[i];
    const time = new Date(weatherInstance.time);
    const hours = textTools.beautifyNumb(time.getHours());
    const day = textTools.beautifyNumb(time.getDate());
    const month = textTools.beautifyNumb(time.getMonth() + 1);
    const temperature = Math.round(weatherInstance.temperature);
    const windSpeed = Math.round(weatherInstance.gust);
    const precipitation = weatherInstance.precipitation === 0 ? 'Light ' : `${weatherInstance.precipitation}mm`;
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

    weatherString += `${day}/${month} ${hours}:00: `;
    weatherString += `${labels.getString('weather', 'temperature')}: ${temperature}${'\xB0C'} `;
    weatherString += `${labels.getString('weather', 'visibility')}: ${weatherInstance.visibility}km `;
    weatherString += `${labels.getString('weather', 'direction')}: ${weatherInstance.windDirection}${'\xB0'} `;
    weatherString += `${labels.getString('weather', 'speed')}: ${windSpeed}m/s `;
    weatherString += `${labels.getString('weather', 'pollution')}: ${coverage} `;

    if (precipType) {
      weatherString += precipitation;
      weatherString += precipType;
    }

    weather.push(weatherString);
  }

  messenger.queueMessage({ text: weather });
}

function onUpdateDeviceId(newId) {
  storage.setDeviceId(newId);
}

function onWhoami(data) {
  const team = data.user.team || '';
  const userMarker = mapTools.getThisUserMarker();
  const text = textTools.createCommandStart('whoami').concat([
    `User: ${data.user.userName}`,
    `Access level: ${data.user.accessLevel}`,
    `Team: ${team}`,
    `Device ID: ${storage.getDeviceId()}`,
    `Location: ${userMarker ? userMarker.getPosition() : 'Unknown'}`,
    textTools.createCommandEnd('whoami'),
  ]);

  messenger.queueMessage({ text });
}

function onList(data = { itemList: [] }) {
  const itemList = data.itemList.itemList;
  const title = data.itemList.listTitle;

  if (title) {
    onMessage({ message: { text: textTools.createCommandStart(title) } });
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
  domManipulator.replaceLastInputPhrase(`${data.matchedName} `);
}

function onMapPositions(mapPositions = []) {
  for (const mapPosition of mapPositions) {
    if (mapPosition.positionName.toLowerCase() === storage.getUser().toLowerCase()) {
      continue;
    }

    const positionName = mapPosition.positionName;
    const latitude = parseFloat(mapPosition.position.latitude);
    const longitude = parseFloat(mapPosition.position.longitude);
    const coordsCollection = mapPosition.position.coordsCollection;
    const geometry = mapPosition.geometry;
    const type = mapPosition.type;

    if (geometry === 'line') {
      mapTools.setLinePosition({
        coordsCollection,
        positionName,
      });
    } else if (geometry === 'polygon') {
      mapTools.setPolygonPosition({
        positionName,
        coordsCollection,
      });
    } else if (geometry === 'point') {
      mapTools.setMarkerPosition({
        positionName,
        position: {
          latitude,
          longitude,
        },
      });
    } else if (type && type === 'user') {
      mapTools.setMarkerPosition({
        positionName,
        position: {
          latitude,
          longitude,
        },
        iconUrl: 'images/mapiconuser.png',
        hideLabel: true,
      });
    }
  }

  mapTools.toggleMapLabels();
}

/**
 * Called from server on client connection
 * Sets configuration properties from server and starts the rest of the app
 */
function onStartup(params = { }) {
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

  socketHandler.emit('getCommands');
  labels.setLanguage(storage.getDefaultLanguage());
  domManipulator.setMainView(document.getElementById('background'));

  if (firstConnection) {
    populateMenu();

    if (!isTouchDevice()) {
      domManipulator.focusInput();
    } else {
      domManipulator.getMainView().classList.add('fullscreen');
    }

    if (!storage.getDeviceId()) {
      storage.setDeviceId(textTools.createDeviceId());
    }

    setInterval(() => {
      socketHandler.emit('updateDeviceLastAlive', { device: { deviceId: storage.getDeviceId(), lastAlive: new Date() } });
    }, 5000);

    attachFullscreenListener();
    addEventListener('keypress', keyPress);
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
    setIntervals();
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
    }

    socketHandler.emit('updateId', {
      user: { userName: storage.getUser() },
      firstConnection: true,
      device: { deviceId: storage.getDeviceId() },
    });

    firstConnection = false;
  }
}

socketHandler.startSocket({
  message: onMessage,
  messages: onMessages,
  importantMsg: onImportantMsg,
  reconnect: onReconnect,
  disconnect: onDisconnect,
  follow: onFollow,
  unfollow: onUnfollow,
  login: onLogin,
  commandSuccess: onCommandSuccess,
  commandFail: onCommandFail,
  reconnectSuccess: onReconnectSuccess,
  disconnectUser: onDisconnectUser,
  morse: onMorse,
  time: onTime,
  locationMsg: onLocationMsg,
  ban: onBan,
  logout: onLogout,
  updateCommands: onUpdateCommands,
  weather: onWeather,
  updateDeviceId: onUpdateDeviceId,
  whoAmI: onWhoami,
  list: onList,
  matchFound: onMatchFound,
  startup: onStartup,
  mapPositions: onMapPositions,
});
