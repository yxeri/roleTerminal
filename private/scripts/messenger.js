const storage = require('./storage');
const commandHandler = require('./commandHandler');
const domManipulator = require('./domManipulator');
const textTools = require('./textTools');
const clickHandler = require('./clickHandler');

// TODO mainFeed should be moved out of here
/**
 * List where all the output is printed too
 * @type {Element}
 */
const mainFeed = document.getElementById('mainFeed');
/**
 * Number of messages that will be processed and printed
 * per loop in consumeMessageQueue
 * @type {number}
 */
const messagesPerQueue = 5;
/**
 * Queue of all the message objects that will be handled and printed
 * @type {object[]}
 */
const messageQueue = [];
/**
 * Room names which should be hidden in the output
 * @type {string[]}
 */
const hideRooms = [
  'broadcast',
  'important',
  'morse',
];
/**
 * Room names which should not be clickable
 * @type {string[]}
 */
const noLinkRooms = [
  'whisper',
];
/**
 * Timeout between print of rows (milliseconds)
 * @type {number}
 */
const rowTimeout = 40;
/**
 * Class names of animations in css
 * @type {string[]}
 */
const animations = [
  'subliminal',
  'subliminalFast',
  'subliminalSlow',
];
// Index of the animation to be retrieved from animations array
let animationPosition = 0;
// True if messages are being processed and printed right now
let printing = false;
/**
 * Shorter queue of messages that will be processed this loop. Length is
 * based on messagesPerQueue constiable
 */
let shortMessageQueue = [];

function appendInputText(text) {
  const currentInputText = domManipulator.getInputText();
  let appendText = '';

  if (currentInputText[currentInputText.length - 1] !== ' ') {
    appendText = ' ';
  }

  appendText += text;

  domManipulator.setCommandInput(currentInputText + appendText);
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
      clickHandler.setClicked(true);

      if (replacePhrase) {
        domManipulator.replaceLastInputPhrase(`${text} `);
      } else if (keepInput) {
        appendInputText(`${text} `);
      } else {
        domManipulator.setCommandInput(`${text} `);
      }

      domManipulator.focusInput();
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
    clickHandler.setClicked(true);
    func(this);
    domManipulator.focusInput();
    event.stopPropagation();
  });

  return spanObj;
}

function linkUser(elem) {
  domManipulator.setCommandInput(`whisper ${elem.textContent} `);
}

function linkRoom(elem) {
  commandHandler.triggerCommand({
    cmd: 'room',
    cmdParams: [elem.textContent],
  });
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

function addText(text, row, message) {
  row.appendChild(generateSpan({
    text,
    linkable: message.linkable,
    keepInput: message.keepInput,
    replacePhrase: message.replacePhrase,
  }));
}

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

    for (let i = 0; i < columns; i++) {
      const text = currentText.shift();

      addText(text, row, message);

      if (currentText.length <= 0) {
        break;
      }
    }

    mainFeed.appendChild(row);
    domManipulator.scrollView();
    setTimeout(addRow, timeout, message);
  } else {
    if (message.morseCode) {
      const row = createRow(message.morseCode, { time: message.time });

      mainFeed.appendChild(row);
      domManipulator.scrollView();
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

function queueMessage(message) {
  messageQueue.push(message);
  consumeMessageQueue();
}

exports.queueMessage = queueMessage;
