require('../library/polyfills');

const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');
const PeopleView = require('../library/components/views/PeopleView');
const ForumView = require('../library/components/views/ForumView');

const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const labelHandler = require('../library/labels/LabelHandler');
const deviceChecker = require('../library/DeviceChecker');
const mouseHandler = require('../library/MouseHandler');

labelHandler.setLabel({ baseObject: 'WalletDialog', labelName: 'currency', label: '¥' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createThread', label: 'new_topic' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createPost', label: 'reply' });
labelHandler.setLabel({ baseObject: 'ForumView', labelName: 'createSubPost', label: 'sub_reply' });
labelHandler.setLabel({ baseObject: 'MenuBar', labelName: 'menu', label: 'menu' });
labelHandler.setLabel({ baseObject: 'List', labelName: 'users', label: 'usrs' });
labelHandler.setLabel({ baseObject: 'List', labelName: 'teams', label: 'crews' });
labelHandler.setLabel({ baseObject: 'List', labelName: 'whispers', label: 'pm' });
labelHandler.setLabel({ baseObject: 'List', labelName: 'rooms', label: 'rooms' });
labelHandler.setLabel({ baseObject: 'List', labelName: 'following', label: 'following' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'createAlias', label: 'create handle' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'createDocument', label: 'create document' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'createRoom', label: 'create room' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'openDocument', label: 'document id search' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'login', label: 'login' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'logout', label: 'logout' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'reboot', label: 'reboot' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'myProfile', label: 'profile' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'createTeam', label: 'create crew' });
labelHandler.setLabel({ baseObject: 'Button', labelName: 'register', label: 'register user' });

const chatView = new ChatView({
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
    team: true,
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
  }, false);
}

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}

mouseHandler.allowRightClick = true;

// boot.addToView({ element: viewSwitcher.getParentElement() });
