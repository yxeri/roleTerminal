require('../library/polyfills');

const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');
const PeopleView = require('../library/components/views/PeopleView');
const TextAnimation = require('../library/components/views/TextAnimation');
const ForumView = require('../library/components/views/ForumView');

const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const labelHandler = require('../library/labels/LabelHandler');
const elementCreator = require('../library/ElementCreator');
const deviceChecker = require('../library/DeviceChecker');
const mouseHandler = require('../library/MouseHandler');

labelHandler.setLabel({ baseObject: 'WalletDialog', labelName: 'currency', label: '¥' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createThread', label: 'new_topic' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createPost', label: 'reply' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createSubPost', label: 'sub_reply' });
labelHandler.setLabel({ baseObject: 'MenuBar', labelName: 'menu', label: 'menu' });

const systemLogo = [];

const chatView = new ChatView({
  titles: {
    rooms: 'room',
    following: 'following',
    whispers: 'pm',
    users: 'usr',
  },
  corners: [
    'lowerRight',
    'lowerLeft',
    'upperRight',
  ],
  allowImages: true,
  effect: true,
  placeholder: 'Alt+Enter to send message',
});
const docFileView = new DocFileView({});
const walletView = new WalletView({
  corners: ['lowerRight'],
});
const peopleView = new PeopleView({
  showButtons: false,
});
const forumView = new ForumView({
  corners: [
    'lowerLeft',
    'lowerRight',
    'upperLeft',
    'upperRight',
  ],
  shouldDisableVoting: true,
  showUserList: false,
  showForumList: false,
});
const menuBar = new MenuBar({
  viewSwitcher,
  currencySign: '¥',
  setMenuImage: false,
  appendTop: false,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    room: true,
    view: true,
    docFile: true,
    wallet: true,
  },
  corners: ['upperRight'],
});
const docWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.DOCS,
  title: 'dir',
  columns: [{
    components: [
      { component: docFileView },
    ],
  }],
});
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'msg',
  columns: [{
    components: [
      { component: chatView },
    ],
  }],
});
const walletWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WALLET,
  title: '¥¥¥',
  columns: [{
    components: [
      { component: walletView },
    ],
  }],
});
const peopleWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.PEOPLE,
  title: 'usr',
  columns: [{
    components: [
      { component: peopleView },
    ],
  }],
});
const forumWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.FORUM,
  title: 'bbs',
  columns: [{
    components: [
      { component: forumView },
    ],
  }],
});

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: forumWrapper },
    { view: chatWrapper },
    { view: docWrapper },
    { view: walletWrapper },
    { view: peopleWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    forumWrapper.viewType,
    chatWrapper.viewType,
    walletWrapper.viewType,
    docWrapper.viewType,
    peopleWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: forumWrapper });
viewSwitcher.switchView({
  setToDefault: true,
  view: forumWrapper,
});

if (!tools.getQueryParameters().noFullscreen) {
  document.addEventListener('click', () => {
    viewTools.goFullScreen({});
  });
}

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    StatusBar.hide(); // eslint-disable-line
    positionTracker.startTracker({ standalone: true });
  }, false);
} else {
  positionTracker.startTracker({});
}

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}

const boot = new TextAnimation({
  messages: systemLogo.concat([
    { element: elementCreator.createSpan({ text: 'Connecting to HQ...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Failed to connect to HQ' }) },
    { element: elementCreator.createSpan({ text: 'Rerouting...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Connected!' }) },
    { element: elementCreator.createSpan({ text: 'Welcome to the Oracle, employee UNDEFINED.' }) },
    { element: elementCreator.createSpan({ text: 'May you have a productive day!' }) },
    { element: elementCreator.createSpan({ text: '' }) },
    { element: elementCreator.createSpan({ text: 'Establishing uplink to relays...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Uplink established!' }) },
    { element: elementCreator.createSpan({ text: 'Downloading modules...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'LAMM  - LANTERN Amplification Master Manipulator' }) },
    { element: elementCreator.createSpan({ text: 'RSAT  - O̶r̶g̶a̶n̶i̶c̶a RAZOR System Administrator Toolset' }) },
    { element: elementCreator.createSpan({ text: 'CHAT  - Communication Host-Agent Tracker' }) },
    { element: elementCreator.createSpan({ text: 'CREDS - Computer Registered Evaluative Decision System' }) },
    { element: elementCreator.createSpan({ text: 'YOU   - YOU Object Unifier' }) },
    { element: elementCreator.createSpan({ text: 'Booting O3S 7.1.3...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'THIS RELEASE OF O3S WAS BROUGHT TO YOU BY' }) },
  ]),
});

mouseHandler.allowRightClick = true;

// boot.addToView({ element: viewSwitcher.getParentElement() });
