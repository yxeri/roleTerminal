require('../library/polyfills');

const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');

const chatView = new ChatView({
  titles: {
    following: 'Chats',
    rooms: 'Rooms',
    users: 'Users',
  },
  whisperText: ' PM: ',
  placeholder: 'Alt+Enter to send message',
  showTeam: false,
});

const menuBar = new MenuBar({
  viewSwitcher,
  image: {
    url: 'images/grumsnet.gif',
  },
  appendTop: true,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    room: true,
  },
});
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Coms',
  columns: [{
    components: [
      { component: chatView },
    ],
  }],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: chatWrapper });
viewSwitcher.switchView({
  setToDefault: true,
  view: chatWrapper,
});

// if (!tools.getQueryParameters().noFullscreen) {
//   document.addEventListener('click', () => {
//     viewTools.goFullScreen({});
//   });
// }

voiceCommander.start();
voiceCommander.addCommands({
  activationString: labelHandler.getLabel({ baseObject: 'VoiceCommands', label: 'viewSwitch' }),
  commands: [
    {
      strings: [
        'chat',
        'coms',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT }); },
    },
  ],
});

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    StatusBar.hide();
    positionTracker.startTracker({ standalone: true });
  }, false);
} else {
  positionTracker.startTracker({});
}
