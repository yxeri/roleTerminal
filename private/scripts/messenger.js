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

const storage = require('./storage');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');
const textTools = require('./textTools');
const clickHandler = require('./clickHandler');
const labels = require('./labels');
const layoutChanger = require('./layoutChanger');

// TODO mainFeed should be moved out of here
/**
 * List where all the output is printed too
 * @type {Element}
 * @private
 */
const mainFeed = document.getElementById('mainFeed');
/**
 * Number of messages that will be processed and printed
 * per loop in consumeMessageQueue
 * @type {number}
 * @private
 */
const messagesPerQueue = 5;
/**
 * Queue of all the message objects that will be handled and printed
 * @type {object[]}
 * @private
 */
const messageQueue = [];
/**
 * Room names which should be hidden in the output
 * @type {string[]}
 * @private
 */
const hideRooms = [
  'broadcast',
  'important',
  'morse',
];
/**
 * Room names which should not be clickable
 * @type {string[]}
 * @private
 */
const noLinkRooms = [
  'whisper',
];
/**
 * Timeout between print of rows (milliseconds)
 * @type {number}
 * @private
 */
const rowTimeout = 40;
/**
 * Class names of animations in css
 * @type {string[]}
 * @private
 */
const animations = [
  'subliminal',
  'subliminalFast',
  'subliminalSlow',
];
/**
 * Index of the animation to be retrieved from animations array
 * @private
 * @type {Number}
 */
let animationPosition = 0;
/**
 * True if messages are being processed and printed right now
 * @private
 * @type {boolean}
 */
let printing = false;
/**
 * Shorter queue of messages that will be processed this loop. Length is
 * based on messagesPerQueue constiable
 * @private
 * @type {Object[]}
 */
let shortMessageQueue = [];

/**
 * Creates and returns a span element
 * Span can be clickable, if the flag is true
 * @private
 * @param {Object} params - Parameters
 * @param {string} params.text - Text
 * @param {boolean} [params.replacePhrase] - Should the text (when clicked on) replace the last phrase in the input?
 * @param {string} [params.className] - CSS class name
 * @param {boolean} [params.linkable] - Should the text be clickable?
 * @param {boolean} [params.keepInput] - Should the text (when clicked on) be appended to existing input?
 * @returns {HTMLElement} - Generated span element
 */
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
      clickHandler.setClicked(true);

      if (replacePhrase) {
        domManipulator.replaceLastInputPhrase(`${text} `);
      } else if (keepInput) {
        domManipulator.appendInputText(`${text} `);
      } else {
        domManipulator.setCommandInput(`${text} `);
      }

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
/**
 * Adds a mouse click listener on the sent text that triggers sent callback
 * @private
 * @param {string} text - String to be clickable
 * @param {string} className - CSS class
 * @param {function} func - Callback on click
 * @returns {HTMLElement} - Clickable span
 */
function generateLink(text, className, func) {
  const spanObj = generateSpan({
    text,
    className,
  });
  spanObj.classList.add('link');

  spanObj.addEventListener('click', (event) => {
    clickHandler.setClicked(true);
    func(event.target);
    domManipulator.focusInput();
    event.stopPropagation();
  });

  return spanObj;
}

/**
 * Clicked callback
 * Sets input field to "whisper " + user name
 * @private
 * @param {HTMLElement} elem - Clicked span
 */
function linkUser(elem) {
  domManipulator.setCommandInput(`whisper ${elem.textContent} `);
}

/**
 * Clicked callback
 * Triggers room command with the room named clicked as parameter
 * @private
 * @param {HTMLElement} elem - Clicked span
 */
function linkRoom(elem) {
  commandHandler.triggerCommand({
    cmd: 'room',
    cmdParams: [elem.textContent],
  });
}

// Adds time stamp and room name to a string from a message if they are set
/**
 * Creates and returns a li element
 * @private
 * @param {Object} message - Message
 * @param {boolean} message.extraClass - CSS class name
 * @param {string} message.roomName - Receiving room name
 * @param {Date} message.time - Time sent
 * @param {boolean} message.hideName - Should the name of the sender be hidden?
 * @param {Object} message.msgAnimation - Animation on print and/or interval
 * @param {boolean} message.msgAnimation.instantAnimation - Should the animation start playing instantly?
 * @param {boolean} message.msgAnimation.fixedAnimationSpeed - Should the animation always be the same? False will randomise the animation style
 * @param {string} subText - Text shown during some animations
 * @returns {HTMLElement} - Created li element
 */
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

  if (!storage.getHideTimeStamp() && message.time && !message.skipTime) {
    rowObj.appendChild(generateSpan({
      text: textTools.generateTimeStamp(message.time),
      extraClass: 'timestamp',
    }));
  }

  if (!storage.getHideRoomNames() && roomName && hideRooms.indexOf(roomName.toLowerCase()) === -1) {
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

/**
 * Append span to row
 * @private
 * @param {string} text - Text to insert into span
 * @param {HTMLElement} row - Row to append to
 * @param {Object} message - Message
 */
function addText(text, row, message) {
  row.appendChild(generateSpan({
    text,
    linkable: message.linkable,
    keepInput: message.keepInput,
    replacePhrase: message.replacePhrase,
  }));
}

/**
 * Creates a row, appends it to the list and consumes next item in the message queue
 * @private
 * @param {Object} message - Message
 * @param {string} message.subText - Sub text
 * @param {number} message.timeout - Waiting time until the row is printed
 */
function addRow(message) {
  const defaultLanguage = storage.getDefaultLanguage();
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

    if (storage.getFastMode()) {
      timeout = 20;
    } else if (message.timeout) {
      timeout = message.timeout;
    } else {
      timeout = rowTimeout;
    }

    for (let i = 0; i < columns; i += 1) {
      const text = currentText.shift();

      addText(text, row, message);

      if (currentText.length <= 0) {
        break;
      }
    }

    mainFeed.appendChild(row);
    domManipulator.scrollView(mainFeed.lastChild.getBoundingClientRect().height);
    setTimeout(addRow, timeout, message);
  } else {
    if (message.morseCode) {
      const row = createRow(message.morseCode, { time: message.time });

      mainFeed.appendChild(row);
      domManipulator.scrollView(mainFeed.lastChild.getBoundingClientRect().height);
    }

    consumeMessageShortQueue(); // eslint-disable-line no-use-before-define
  }
}

/**
 * Shift shortMessageQueue and add a row from the message
 * @private
 */
function consumeMessageShortQueue() {
  if (shortMessageQueue.length > 0) {
    const message = shortMessageQueue.shift();

    addRow(message);
  } else {
    printing = false;
    consumeMessageQueue(); // eslint-disable-line no-use-before-define
  }
}

// Prints messages from the queue
/**
 * Splice messageQueue and start consuming messages from the shorter queue
 * @private
 */
function consumeMessageQueue() {
  if (!printing && messageQueue.length > 0) {
    shortMessageQueue = messageQueue.splice(0, messagesPerQueue);
    printing = true;
    consumeMessageShortQueue();
  }
}

/**
 * Adds message to the queue and starts the queue
 * @static
 * @param {Object} message - Message
 */
function queueMessage(message) {
  messageQueue.push(message);
  consumeMessageQueue();
}

/**
 * Prints help and instructions from the command
 * @static
 * @param {string} command - Command name
 */
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

/**
 * Modifies message following special rules depending on what the message contains
 * @param {Object} message - Message to be modified
 * @returns {Object} Returns modified message
 */
function hideMessageProperties(message = {}) {
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

/**
 * Called on message emit. Prints text
 * @param {Object} params - Parameters
 * @param {Object} params.message - Message
 */
function onMessage(params = { message: {} }) {
  const message = textTools.addMessageSpecialProperties(hideMessageProperties(params.message));

  queueMessage(message);

  if (layoutChanger.isViewExpanded()) {
    domManipulator.flashMenu();
  }
}

/**
 * Called on messages emit. Prints multiple texts
 * @param {Object} params - Parameters
 * @param {Object[]} params.messages - Messages
 */
function onMessages(params = { messages: [] }) {
  const messages = params.messages;

  for (let i = 0; i < messages.length; i += 1) {
    const message = textTools.addMessageSpecialProperties(hideMessageProperties(messages[i]));

    queueMessage(message);
  }

  if (layoutChanger.isViewExpanded()) {
    domManipulator.flashMenu();
  }
}

exports.queueMessage = queueMessage;
exports.printHelpMessage = printHelpMessage;
exports.onMessage = onMessage;
exports.onMessages = onMessages;
